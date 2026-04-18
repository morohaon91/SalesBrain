"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { LoadingScreen } from "@/components/shared/loading-screen";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (!user) redirect("/login");

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
