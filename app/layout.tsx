import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/components/i18n/I18nProvider";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Concierge — Your AI Sales Rep, Always On",
  description: "AI-powered lead warm-up. Your concierge is always on.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
