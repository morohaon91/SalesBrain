"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { INDUSTRY_LIST } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";

/**
 * Register form validation schema
 */
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters")
      .max(200, "Business name must be less than 200 characters"),
    industry: z.string().min(1, "Please select your industry"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Password strength indicator
 */
function PasswordStrengthIndicator({ password }: { password: string }) {
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
    if (str <= 1) return "Weak";
    if (str <= 2) return "Fair";
    if (str <= 3) return "Good";
    return "Strong";
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
        Strength: <span className="font-medium">{getStrengthLabel(strength)}</span>
      </p>
    </div>
  );
}

/**
 * Register page component
 */
export default function RegisterPage() {
  const { register: registerUser, error: authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  /**
   * Handle form submission
   */
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

      // Redirect happens in useAuth hook
    } catch (err) {
      // Error is handled by useAuth hook
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-600 mt-1">
          Get started with AI-powered lead qualification in minutes
        </p>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-danger-900">{authError}</p>
          </div>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full name
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

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
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

        {/* Business Name Field */}
        <div className="space-y-2">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business name
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

        {/* Industry Field */}
        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <Select
            id="industry"
            placeholder="Select your industry"
            options={INDUSTRY_LIST}
            {...register("industry")}
            disabled={isLoading}
            className={errors.industry ? "border-danger-500" : ""}
          />
          {errors.industry && (
            <p className="text-sm text-danger-600">{errors.industry.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
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
          {password && <PasswordStrengthIndicator password={password} />}
          {errors.password && (
            <p className="text-sm text-danger-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
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

        {/* Terms & Conditions */}
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("terms")}
              disabled={isLoading}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              I agree to the{" "}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                terms and conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                privacy policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-danger-600">{errors.terms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-success-50 border border-success-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-success-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          What you get:
        </p>
        <ul className="text-sm text-success-800 space-y-1 ml-6 list-disc">
          <li>14-day free trial</li>
          <li>Unlimited simulations</li>
          <li>AI-powered lead qualification</li>
          <li>24/7 support</li>
        </ul>
      </div>
    </div>
  );
}
