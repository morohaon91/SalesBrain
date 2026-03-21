import axios, { AxiosError, AxiosInstance } from "axios";

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
 * Request interceptor: Add JWT token to Authorization header
 */
instance.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Response interceptor: Handle 401 errors and refresh token
 */
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const onRefreshed = () => {
  refreshQueue.forEach((callback) => callback());
  refreshQueue = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !isRefreshing && originalRequest) {
      isRefreshing = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post<ApiResponse<{ token: string }>>(
          `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Extract and store new access token
        const newToken = refreshResponse.data.data?.token;
        if (newToken && typeof window !== "undefined") {
          localStorage.setItem("token", newToken);
        }

        // Token refresh successful, notify queued requests
        onRefreshed();
        isRefreshing = false;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login (only if not already on auth page)
        isRefreshing = false;
        refreshQueue = [];

        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          // Only redirect if we're not already on an auth page to prevent redirect loops
          if (
            !window.location.pathname.startsWith("/auth") &&
            !window.location.pathname.startsWith("/login") &&
            !window.location.pathname.startsWith("/register")
          ) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
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
      return response.data;
    },

    review: async (id: string, data: Record<string, unknown>) => {
      const response = await instance.put<ApiResponse<unknown>>(
        `/conversations/${id}/review`,
        data
      );
      return response.data;
    },
  },

  /**
   * Simulations endpoints
   */
  simulations: {
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
