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

/**
 * Dashboard layout with sidebar and header
 * Protected - requires authentication
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuToggle={() => setIsSidebarOpen(true)} />

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
