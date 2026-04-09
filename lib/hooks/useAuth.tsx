"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
  createdAt: string;
}

/**
 * Register data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  industry?: string;
}

/**
 * Auth context interface
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  clearError: () => void;
}

/**
 * Create auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Check for existing session on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Only attempt to fetch profile if token exists
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const profile = await api.user.getProfile();
        setUser(profile as User);
      } catch (err) {
        // User not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setIsLoading(true);

        const response = await api.auth.login({ email, password });

        // Get user profile
        const profile = await api.user.getProfile();
        setUser(profile as User);

        // Redirect based on onboarding state
        const status = await api.onboarding.getStatus().catch(() => null);

        if (status?.onboardingComplete) {
          router.push('/dashboard');
          return;
        }

        const step = status?.onboardingStep;
        // If profile already exists, questionnaire is done — skip it
        if (step === 'questionnaire' && !status?.hasProfile) {
          router.push('/questionnaire');
          return;
        }

        if (step === 'simulations') {
          router.push('/simulations/new');
          return;
        }

        if (step === 'approval') {
          router.push('/profile/approve');
          return;
        }

        // Fallback
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      await api.auth.logout();
      setUser(null);
      // Use window.location for guaranteed redirect (bypasses router race condition)
      window.location.href = "/login";
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Logout failed. Please try again.";
      setError(errorMsg);
      // Still redirect on error to clear the user session
      window.location.href = "/login";
      throw err;
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setError(null);
        setIsLoading(true);

        const response = await api.auth.register(data);

        // Get user profile
        const profile = await api.user.getProfile();
        setUser(profile as User);

        // Redirect to questionnaire for new users (onboarding)
        const nextStep = (response as any)?.data?.nextStep;
        router.push(nextStep === 'questionnaire' ? '/questionnaire' : '/dashboard');
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Registration failed. Please try again.";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
