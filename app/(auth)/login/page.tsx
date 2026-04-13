"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";

type LoginFormData = {
  email: string;
  password: string;
};

/**
 * Login page component
 */
export default function LoginPage() {
  const { login, error: authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n(["auth", "validation"]);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation:login.emailInvalid")),
        password: z.string().min(1, t("validation:login.passwordRequired")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      clearError();
      await login(data.email, data.password);
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("auth:login.welcomeBack")}</h2>
        <p className="text-gray-600 mt-1">{t("auth:login.subtitle")}</p>
      </div>

      {authError && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-danger-900">{authError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t("auth:login.emailAddress")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isLoading}
            className={errors.email ? "border-danger-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-danger-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t("auth:login.password")}
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
            className={errors.password ? "border-danger-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-danger-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-gray-700">{t("auth:login.rememberMe")}</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t("auth:login.forgotPasswordShort")}
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("auth:login.signingIn")}
            </>
          ) : (
            t("auth:login.submit")
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t("auth:login.or")}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          {t("auth:login.noAccount")}{" "}
          <Link
            href="/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t("auth:login.signUpLink")}
          </Link>
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm font-medium text-primary-900 mb-2">{t("auth:login.demoCredentials")}</p>
        <div className="space-y-1 text-sm text-primary-800 font-mono">
          <p>{t("auth:login.demoEmail")}</p>
          <p>{t("auth:login.demoPassword")}</p>
        </div>
      </div>
    </div>
  );
}
