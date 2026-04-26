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
        <h2
          className="text-2xl font-semibold"
          style={{
            fontFamily: "'Cormorant', Georgia, serif",
            fontSize: "28px",
            color: "hsl(38, 25%, 90%)",
            letterSpacing: "-0.01em",
          }}
        >
          {t("auth:login.welcomeBack")}
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "hsl(228, 12%, 47%)" }}>
          {t("auth:login.subtitle")}
        </p>
      </div>

      {authError && (
        <div
          className="rounded-lg p-3.5 flex gap-3"
          style={{
            background: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.2)",
          }}
        >
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" style={{ color: "#fb7185" }} />
          <p className="text-sm" style={{ color: "#fb7185" }}>{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: "hsl(38, 20%, 78%)" }}>
            {t("auth:login.emailAddress")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth:login.emailPlaceholder")}
            {...register("email")}
            disabled={isLoading}
            className={errors.email ? "border-danger-500/50 focus-visible:ring-danger-500/30" : ""}
          />
          {errors.email && (
            <p className="text-xs" style={{ color: "#fb7185" }}>{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: "hsl(38, 20%, 78%)" }}>
            {t("auth:login.password")}
          </label>
          <Input
            id="password"
            type="password"
            placeholder={t("auth:login.passwordPlaceholder")}
            {...register("password")}
            disabled={isLoading}
            className={errors.password ? "border-danger-500/50 focus-visible:ring-danger-500/30" : ""}
          />
          {errors.password && (
            <p className="text-xs" style={{ color: "#fb7185" }}>{errors.password.message}</p>
          )}
        </div>

        <div className="flex min-h-11 items-center justify-between gap-3 text-sm">
          <label
            htmlFor="remember-me"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg py-1 pe-2 ps-1 hover:bg-white/[0.04]"
          >
            <input
              id="remember-me"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[hsl(var(--border))] accent-primary-500"
            />
            <span style={{ color: "hsl(228, 12%, 55%)" }}>{t("auth:login.rememberMe")}</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium transition-colors"
            style={{ color: "hsl(38, 84%, 61%)" }}
          >
            {t("auth:login.forgotPasswordShort")}
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-1"
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
        <div
          className="absolute inset-0 flex items-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3" style={{ background: "hsl(228, 38%, 6%)", color: "hsl(228, 12%, 40%)" }}>
            {t("auth:login.or")}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm" style={{ color: "hsl(228, 12%, 47%)" }}>
          {t("auth:login.noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold transition-colors"
            style={{ color: "hsl(38, 84%, 61%)" }}
          >
            {t("auth:login.signUpLink")}
          </Link>
        </p>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(200,136,26,0.07)",
          border: "1px solid rgba(200,136,26,0.15)",
        }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "hsl(38, 84%, 61%)" }}>
          {t("auth:login.demoCredentials")}
        </p>
        <div className="space-y-0.5 text-xs font-mono" style={{ color: "hsl(228, 12%, 55%)" }}>
          <p>{t("auth:login.demoEmail")}</p>
          <p>{t("auth:login.demoPassword")}</p>
        </div>
      </div>
    </div>
  );
}
