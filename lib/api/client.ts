import axios, { AxiosError, AxiosInstance } from "axios";
import type { CompetencyStatus } from "@/lib/learning/competencies";

export interface ActivationStatusResponse {
  activationScore: number;
  canRequestGoLive: boolean;
  breakdown: {
    scenarios: { earned: number; max: number; completed: number; total: number };
    competencies: { earned: number; max: number; achieved: number; total: number };
    profile: { earned: number; max: number };
  };
  blockingStep: 'profile' | 'simulations' | 'competencies' | 'ready';
  nextAction: string;
  nextScenario: { id: string; name: string; purpose: string } | null;
  gates: Array<{
    gateId: string;
    name: string;
    status: 'PASSED' | 'BLOCKED';
    progress: number;
    blockingReasons: string[];
  }>;
  competencies: CompetencyStatus[];
}

/**
 * API Response type
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Create axios instance with base configuration
 */
const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  withCredentials: true, // Include cookies (for refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Decode JWT payload (browser-safe, no signature verification).
 * Used only to read `exp` for proactive refresh — server always re-verifies.
 */
function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const claims = JSON.parse(json) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

const PROACTIVE_REFRESH_THRESHOLD_SEC = 60;

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function notifyQueue(token: string | null) {
  const queue = refreshQueue;
  refreshQueue = [];
  queue.forEach((cb) => cb(token));
}

async function performRefresh(): Promise<string | null> {
  const refreshResponse = await axios.post<ApiResponse<{ token: string }>>(
    `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const newToken = refreshResponse.data.data?.token ?? null;
  if (newToken && typeof window !== "undefined") {
    localStorage.setItem("token", newToken);
  }
  return newToken;
}

function handleRefreshFailure() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  if (
    !window.location.pathname.startsWith("/auth") &&
    !window.location.pathname.startsWith("/login") &&
    !window.location.pathname.startsWith("/register")
  ) {
    window.location.href = "/login";
  }
}

/**
 * Coalesced refresh: concurrent callers share a single refresh in flight.
 */
async function refreshTokenCoalesced(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise<string | null>((resolve) => {
      refreshQueue.push(resolve);
    });
  }
  isRefreshing = true;
  try {
    const token = await performRefresh();
    notifyQueue(token);
    return token;
  } catch (err) {
    notifyQueue(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Request interceptor:
 * 1. Proactively refresh if token expires within threshold.
 * 2. Attach JWT to Authorization header.
 */
instance.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  // Never intercept the refresh call itself.
  const url = config.url ?? "";
  const isRefreshCall = url.includes("/auth/refresh");

  let token = localStorage.getItem("token");

  if (token && !isRefreshCall) {
    const exp = decodeJwtExp(token);
    const nowSec = Math.floor(Date.now() / 1000);
    const expiresSoon = exp !== null && exp - nowSec < PROACTIVE_REFRESH_THRESHOLD_SEC;

    if (expiresSoon) {
      try {
        const refreshed = await refreshTokenCoalesced();
        if (refreshed) token = refreshed;
      } catch {
        // Fall through — request will 401 and reactive path will handle it.
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Response interceptor: reactive refresh on 401 (defense in depth).
 */
interface RetriableRequest {
  _retry?: boolean;
  headers?: Record<string, unknown> | import("axios").AxiosHeaders;
  url?: string;
}

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & RetriableRequest) | undefined;
    const status = error.response?.status;
    const isRefreshCall = (originalRequest?.url ?? "").includes("/auth/refresh");

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshTokenCoalesced();
      if (!newToken) {
        handleRefreshFailure();
        return Promise.reject(error);
      }
      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, unknown>).Authorization = `Bearer ${newToken}`;
      }
      return instance(originalRequest);
    } catch (refreshError) {
      handleRefreshFailure();
      return Promise.reject(refreshError);
    }
  }
);

/**
 * API client with organized endpoints
 */
export const api = {
  /**
   * Authentication endpoints
   */
  auth: {
    login: async (data: { email: string; password: string }) => {
      const response = await instance.post<
        ApiResponse<{
          userId: string;
          tenantId: string;
          name: string;
          email: string;
          token: string;
          refreshToken?: string;
        }>
      >("/auth/login", data);

      // Store token
      if (response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
      }

      return response.data;
    },

    register: async (data: {
      email: string;
      password: string;
      name: string;
      businessName: string;
      industry?: string;
    }) => {
      const response = await instance.post<
        ApiResponse<{
          userId: string;
          tenantId: string;
          email: string;
          token: string;
          refreshToken?: string;
        }>
      >("/auth/register", data);

      // Store token
      if (response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
      }

      return response.data;
    },

    logout: async () => {
      const response = await instance.post<ApiResponse<{ message: string }>>("/auth/logout");
      localStorage.removeItem("token");
      return response.data;
    },

    refresh: async () => {
      const response = await instance.post<ApiResponse<{ token: string }>>("/auth/refresh");

      if (response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
      }

      return response.data;
    },
  },

  /**
   * User endpoints
   */
  user: {
    getProfile: async () => {
      const response = await instance.get<
        ApiResponse<{
          id: string;
          email: string;
          name: string;
          role: string;
          tenantId: string;
          createdAt: string;
        }>
      >("/user/profile");

      return response.data.data;
    },
  },

  /**
   * Onboarding endpoints
   */
  onboarding: {
    getStatus: async () => {
      const response = await instance.get<
        ApiResponse<{
          onboardingComplete: boolean;
          onboardingStep: string;
          leadConversationsActive: boolean;
          activatedAt: string | null;
          tenantIndustry: string | null;
          hasProfile: boolean;
          profile: null | {
            id: string;
            profileApprovalStatus: string;
            completionPercentage: number;
            simulationCount: number;
          };
        }>
      >('/onboarding/status');

      return response.data.data;
    },
  },

  /**
   * Conversations endpoints
   */
  conversations: {
    list: async (params?: Record<string, unknown>) => {
      const response = await instance.get<ApiResponse<Array<unknown>>>("/conversations", {
        params,
      });
      return response.data;
    },

    get: async (id: string) => {
      const response = await instance.get<ApiResponse<unknown>>(`/conversations/${id}`);
      return response.data.data;
    },

    review: async (id: string, data: Record<string, unknown>) => {
      const response = await instance.put<ApiResponse<unknown>>(
        `/conversations/${id}/review`,
        data
      );
      return response.data;
    },

    reanalyze: async (id: string) => {
      const response = await instance.post<ApiResponse<unknown>>(`/conversations/${id}/reanalyze`);
      return response.data;
    },
  },

  /**
   * Simulations endpoints
   */
  simulations: {
    scenarios: async () => {
      const response = await instance.get<{
        success: boolean;
        scenarios: Array<{
          id: string;
          name: string;
          description: string;
          difficulty: string;
          estimatedDuration: number;
          isMandatory: boolean;
          isCompleted: boolean;
          orderIndex: number;
          scenarioType: string;
        }>;
        suggestion: { scenarioId: string; scenarioName: string; reason: string } | null;
        completedScenarios: string[];
        industry: string | null;
        completionStats: { completed: number; total: number; percentage: number };
      }>('/simulations/scenarios');
      return response.data;
    },

    start: async (data: { scenarioType: string }) => {
      const response = await instance.post<ApiResponse<unknown>>('/simulations/start', data);
      return response.data;
    },

    list: async (params?: Record<string, unknown>) => {
      const response = await instance.get<ApiResponse<unknown>>('/simulations/list', {
        params,
      });
      return response.data;
    },

    get: async (id: string) => {
      const response = await instance.get<ApiResponse<unknown>>(`/simulations/${id}`);
      return response.data;
    },

    sendMessage: async (id: string, data: { content: string }) => {
      const response = await instance.post<ApiResponse<unknown>>(
        `/simulations/${id}/message`,
        data
      );
      return response.data;
    },

    complete: async (id: string) => {
      const response = await instance.post<ApiResponse<unknown>>(`/simulations/${id}/complete`);
      return response.data;
    },

    extract: async (id: string) => {
      const response = await instance.post<ApiResponse<unknown>>(`/simulations/${id}/extract`);
      return response.data;
    },
  },

  /**
   * Leads endpoints
   */
  leads: {
    list: async (params?: Record<string, unknown>) => {
      const response = await instance.get<ApiResponse<Array<unknown>>>("/leads", {
        params,
      });
      return response.data;
    },

    get: async (id: string) => {
      const response = await instance.get<ApiResponse<unknown>>(`/leads/${id}`);
      return response.data;
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const response = await instance.put<ApiResponse<unknown>>(`/leads/${id}`, data);
      return response.data;
    },
  },

  /**
   * Analytics endpoints
   */
  analytics: {
    getOverview: async (params?: Record<string, unknown>) => {
      const response = await instance.get<ApiResponse<unknown>>("/analytics/overview", {
        params,
      });
      return response.data;
    },

    getTrends: async (params?: Record<string, unknown>) => {
      const response = await instance.get<ApiResponse<unknown>>("/analytics/trends", {
        params,
      });
      return response.data;
    },
  },

  /**
   * Business Profile endpoints
   */
  profile: {
    get: async () => {
      const response = await instance.get<ApiResponse<unknown>>('/profile');
      return response.data;
    },

    update: async (data: Record<string, unknown>) => {
      const response = await instance.patch<ApiResponse<unknown>>('/profile', data);
      return response.data;
    },

    refresh: async () => {
      const response = await instance.post<ApiResponse<unknown>>('/profile/refresh');
      return response.data;
    },

    reset: async () => {
      const response = await instance.post<ApiResponse<unknown>>('/profile/reset');
      return response.data;
    },

    reExtract: async () => {
      const response = await instance.post<ApiResponse<unknown>>('/profile/re-extract');
      return response.data;
    },

    activationStatus: async (): Promise<ActivationStatusResponse> => {
      const response = await instance.get<ActivationStatusResponse>('/profiles/activation-status');
      return response.data;
    },
  },

  /**
   * Tenant endpoints
   */
  tenant: {
    get: async () => {
      const response = await instance.get<ApiResponse<unknown>>('/tenant');
      return response.data;
    },

    updateSettings: async (data: Record<string, unknown>) => {
      const response = await instance.put<ApiResponse<unknown>>('/tenant/settings', data);
      return response.data;
    },
  },
};

export default instance;
