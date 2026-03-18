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

        // Redirect to dashboard
        router.push("/dashboard");
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
      router.push("/login");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Logout failed. Please try again.";
      setError(errorMsg);
      throw err;
    }
  }, [router]);

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

        // Redirect to dashboard
        router.push("/dashboard");
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
