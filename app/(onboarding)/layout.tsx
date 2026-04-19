import { OnboardingBrandShell } from "@/components/onboarding/OnboardingBrandShell";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingBrandShell>{children}</OnboardingBrandShell>;
}
