import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/components/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Concierge — Your AI Sales Rep, Always On",
  description: "AI-powered lead warm-up. Your concierge is always on.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <I18nProvider>
          <Providers>
            <AuthProvider>{children}</AuthProvider>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
