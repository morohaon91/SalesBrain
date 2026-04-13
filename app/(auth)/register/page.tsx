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

  const getStrengthColor = (str: number) => {
    if (str <= 1) return "bg-danger-500";
    if (str <= 2) return "bg-warning-500";
    if (str <= 3) return "bg-primary-500";
    return "bg-success-500";
  };

  const getStrengthLabel = (str: number) => {
    if (str <= 1) return t("auth:passwordStrength.weak");
    if (str <= 2) return t("auth:passwordStrength.fair");
    if (str <= 3) return t("auth:passwordStrength.good");
    return t("auth:passwordStrength.strong");
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full bg-gray-200 ${
              i < strength ? getStrengthColor(strength) : ""
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        {t("auth:passwordStrength.label")}{" "}
        <span className="font-medium">{getStrengthLabel(strength)}</span>
      </p>
    </div>
  );
}

type RegisterFormData = z.infer<ReturnType<typeof buildRegisterSchema>>;

function buildRegisterSchema(t: TFunction) {
  return z
    .object({
      name: z
        .string()
        .min(2, t("validation:register.nameMin"))
        .max(100, t("validation:register.nameMax")),
      email: z.string().email(t("validation:register.emailInvalid")),
      businessName: z
        .string()
        .min(2, t("validation:register.businessNameMin"))
        .max(200, t("validation:register.businessNameMax")),
      industry: z.string().min(1, t("validation:register.industryRequired")),
      password: z
        .string()
        .min(8, t("validation:register.passwordMin"))
        .regex(/[A-Z]/, t("validation:register.passwordUppercase"))
        .regex(/[0-9]/, t("validation:register.passwordNumber")),
      confirmPassword: z.string(),
      terms: z.boolean().refine((val) => val === true, {
        message: t("validation:register.termsRequired"),
      }),
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("auth:register.heading")}</h2>
        <p className="text-gray-600 mt-1">{t("auth:register.subtitle")}</p>
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t("auth:register.name")}
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
            disabled={isLoading}
            className={errors.name ? "border-danger-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-danger-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t("auth:register.emailAddress")}
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
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            {t("auth:register.businessName")}
          </label>
          <Input
            id="businessName"
            type="text"
            placeholder="Doe Consulting"
            {...register("businessName")}
            disabled={isLoading}
            className={errors.businessName ? "border-danger-500" : ""}
          />
          {errors.businessName && (
            <p className="text-sm text-danger-600">{errors.businessName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            {t("auth:register.industry")}
          </label>
          <Select
            id="industry"
            placeholder={t("auth:register.industryPlaceholder")}
            options={INDUSTRY_LIST}
            {...register("industry")}
            disabled={isLoading}
            className={errors.industry ? "border-danger-500" : ""}
          />
          {errors.industry && (
            <p className="text-sm text-danger-600">{errors.industry.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t("auth:register.password")}
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
            className={errors.password ? "border-danger-500" : ""}
            onChange={(e) => {
              register("password").onChange(e);
            }}
          />
          {password && <PasswordStrengthIndicator password={password} t={t} />}
          {errors.password && (
            <p className="text-sm text-danger-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t("auth:register.confirmPassword")}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            disabled={isLoading}
            className={errors.confirmPassword ? "border-danger-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-danger-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("terms")}
              disabled={isLoading}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              {t("auth:register.terms")}{" "}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                {t("auth:register.termsLink")}
              </Link>{" "}
              {t("auth:register.and")}{" "}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                {t("auth:register.privacyLink")}
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-danger-600">{errors.terms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white font-medium"
        >
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
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t("auth:register.or")}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          {t("auth:register.haveAccount")}{" "}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t("auth:register.signIn")}
          </Link>
        </p>
      </div>

      <div className="bg-success-50 border border-success-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-success-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {t("auth:register.benefitsTitle")}
        </p>
        <ul className="text-sm text-success-800 space-y-1 ml-6 list-disc">
          <li>{t("auth:register.benefit1")}</li>
          <li>{t("auth:register.benefit2")}</li>
          <li>{t("auth:register.benefit3")}</li>
          <li>{t("auth:register.benefit4")}</li>
        </ul>
      </div>
    </div>
  );
}
