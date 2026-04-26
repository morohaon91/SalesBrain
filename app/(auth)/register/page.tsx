"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
import { INDUSTRY_LIST } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import type { TFunction } from "i18next";

function PasswordStrengthIndicator({
  password,
  t,
}: {
  password: string;
  t: TFunction;
}) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  const colors = ["#fb7185", "#fb923c", "hsl(38,84%,61%)", "#4ade80"];
  const labels = [
    t("auth:passwordStrength.weak"),
    t("auth:passwordStrength.fair"),
    t("auth:passwordStrength.good"),
    t("auth:passwordStrength.strong"),
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < strength ? colors[strength - 1] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: "hsl(228, 12%, 47%)" }}>
        {t("auth:passwordStrength.label")}{" "}
        <span style={{ color: strength > 0 ? colors[strength - 1] : "hsl(228,12%,47%)", fontWeight: 600 }}>
          {strength > 0 ? labels[strength - 1] : "—"}
        </span>
      </p>
    </div>
  );
}

type RegisterFormData = z.infer<ReturnType<typeof buildRegisterSchema>>;

function buildRegisterSchema(t: TFunction) {
  return z
    .object({
      name: z.string().min(2, t("validation:register.nameMin")).max(100, t("validation:register.nameMax")),
      email: z.string().email(t("validation:register.emailInvalid")),
      businessName: z.string().min(2, t("validation:register.businessNameMin")).max(200, t("validation:register.businessNameMax")),
      industry: z.string().min(1, t("validation:register.industryRequired")),
      password: z
        .string()
        .min(8, t("validation:register.passwordMin"))
        .regex(/[A-Z]/, t("validation:register.passwordUppercase"))
        .regex(/[0-9]/, t("validation:register.passwordNumber")),
      confirmPassword: z.string(),
      terms: z.boolean().refine((val) => val === true, { message: t("validation:register.termsRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation:register.passwordsMatch"),
      path: ["confirmPassword"],
    });
}

export default function RegisterPage() {
  const { register: registerUser, error: authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n(["auth", "validation"]);
  const registerSchema = useMemo(() => buildRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      clearError();
      await registerUser({
        name: data.name,
        email: data.email,
        businessName: data.businessName,
        industry: data.industry,
        password: data.password,
      });
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = { color: "hsl(38, 20%, 78%)" };
  const errorStyle = { color: "#fb7185" };
  const errorClass = "border-danger-500/50 focus-visible:ring-danger-500/30";

  return (
    <div className="space-y-5">
      <div>
        <h2
          style={{
            fontFamily: "'Cormorant', Georgia, serif",
            fontSize: "28px",
            fontWeight: 600,
            color: "hsl(38, 25%, 90%)",
            letterSpacing: "-0.01em",
          }}
        >
          {t("auth:register.heading")}
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "hsl(228, 12%, 47%)" }}>
          {t("auth:register.subtitle")}
        </p>
      </div>

      {authError && (
        <div
          className="rounded-lg p-3.5 flex gap-3"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#fb7185" }} />
          <p className="text-sm" style={{ color: "#fb7185" }}>{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            {t("auth:register.name")}
          </label>
          <Input id="name" type="text" placeholder={t("auth:register.namePlaceholder")} {...register("name")} disabled={isLoading} className={errors.name ? errorClass : ""} />
          {errors.name && <p className="text-xs" style={errorStyle}>{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            {t("auth:register.emailAddress")}
          </label>
          <Input id="email" type="email" placeholder={t("auth:register.emailPlaceholder")} {...register("email")} disabled={isLoading} className={errors.email ? errorClass : ""} />
          {errors.email && <p className="text-xs" style={errorStyle}>{errors.email.message}</p>}
        </div>

        {/* Business name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            {t("auth:register.businessName")}
          </label>
          <Input id="businessName" type="text" placeholder={t("auth:register.businessNamePlaceholder")} {...register("businessName")} disabled={isLoading} className={errors.businessName ? errorClass : ""} />
          {errors.businessName && <p className="text-xs" style={errorStyle}>{errors.businessName.message}</p>}
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            {t("auth:register.industry")}
          </label>
          <Select
            id="industry"
            placeholder={t("auth:register.industryPlaceholder")}
            options={INDUSTRY_LIST}
            {...register("industry")}
            disabled={isLoading}
            className={errors.industry ? errorClass : ""}
          />
          {errors.industry && <p className="text-xs" style={errorStyle}>{errors.industry.message}</p>}
          <p className="text-xs" style={{ color: "hsl(228, 12%, 40%)" }}>{t("auth:register.industryHint")}</p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            {t("auth:register.password")}
          </label>
          <Input
            id="password"
            type="password"
            placeholder={t("auth:register.passwordPlaceholder")}
            {...register("password")}
            disabled={isLoading}
            className={errors.password ? errorClass : ""}
          />
          {password && <PasswordStrengthIndicator password={password} t={t} />}
          {errors.password && <p className="text-xs" style={errorStyle}>{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            {t("auth:register.confirmPassword")}
          </label>
          <Input id="confirmPassword" type="password" placeholder={t("auth:register.passwordPlaceholder")} {...register("confirmPassword")} disabled={isLoading} className={errors.confirmPassword ? errorClass : ""} />
          {errors.confirmPassword && <p className="text-xs" style={errorStyle}>{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register("terms")}
              disabled={isLoading}
              className="mt-0.5 rounded border-[hsl(var(--border))] accent-primary-500 flex-shrink-0"
            />
            <span className="text-sm" style={{ color: "hsl(228, 12%, 55%)" }}>
              {t("auth:register.terms")}{" "}
              <Link href="/terms" style={{ color: "hsl(38, 84%, 61%)" }} className="font-medium">
                {t("auth:register.termsLink")}
              </Link>{" "}
              {t("auth:register.and")}{" "}
              <Link href="/privacy" style={{ color: "hsl(38, 84%, 61%)" }} className="font-medium">
                {t("auth:register.privacyLink")}
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs" style={errorStyle}>{errors.terms.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-11 mt-1">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("auth:register.creating")}
            </>
          ) : (
            t("auth:register.submit")
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
        <div className="relative flex justify-center text-xs mt-[-8px]">
          <span className="px-3" style={{ background: "hsl(228, 38%, 6%)", color: "hsl(228, 12%, 40%)" }}>
            {t("auth:register.or")}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm" style={{ color: "hsl(228, 12%, 47%)" }}>
          {t("auth:register.haveAccount")}{" "}
          <Link href="/login" className="font-semibold" style={{ color: "hsl(38, 84%, 61%)" }}>
            {t("auth:register.signIn")}
          </Link>
        </p>
      </div>

      <div
        className="rounded-xl p-4 space-y-2"
        style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}
      >
        <p className="text-xs font-semibold flex items-center gap-2" style={{ color: "#4ade80" }}>
          <CheckCircle className="w-3.5 h-3.5" />
          {t("auth:register.benefitsTitle")}
        </p>
        <ul className="text-xs space-y-1 ml-5 list-disc" style={{ color: "hsl(142,40%,55%)" }}>
          <li>{t("auth:register.benefit1")}</li>
          <li>{t("auth:register.benefit2")}</li>
          <li>{t("auth:register.benefit3")}</li>
          <li>{t("auth:register.benefit4")}</li>
        </ul>
      </div>
    </div>
  );
}
