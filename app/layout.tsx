import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/components/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "SalesBrain - Lead Qualification AI",
  description: "AI-powered lead qualification for freelancers and agencies",
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
