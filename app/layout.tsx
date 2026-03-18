import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Providers } from "@/components/providers";

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
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
