"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/hooks/useI18n";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BrainCircuit,
  BarChart3,
  Settings,
  User,
  GraduationCap,
  X,
  Zap,
} from "lucide-react";

const getNavigation = (t: (k: string) => string) => [
  { name: t("navigation.dashboard"), href: "/dashboard", icon: LayoutDashboard },
  { name: t("navigation.conversations"), href: "/conversations", icon: MessageSquare },
  { name: t("navigation.leads"), href: "/leads", icon: Users },
  { name: t("navigation.simulations"), href: "/simulations", icon: BrainCircuit },
  { name: t("navigation.learning"), href: "/learning", icon: GraduationCap },
  { name: t("navigation.analytics"), href: "/analytics", icon: BarChart3 },
  { name: t("navigation.profile"), href: "/profile", icon: User },
  { name: t("navigation.settings"), href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n("common");
  const navigation = getNavigation(t);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "w-64 flex flex-col overflow-hidden h-screen",
          "fixed inset-y-0 inset-inline-start-0 z-50 transform transition-transform duration-300",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ backgroundColor: "hsl(222, 47%, 7%)" }}
      >
        {/* ── Wordmark ── */}
        <div
          className="px-5 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid hsl(222, 30%, 14%)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            {/* Concierge bell mark */}
            <svg
              width="20"
              height="26"
              viewBox="0 0 20 26"
              fill="hsl(38, 92%, 50%)"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <circle cx="10" cy="1.75" r="1.75" />
              <path d="M10 3.5 C13 3.5 17 7 17 14 H3 C3 7 7 3.5 10 3.5Z" />
              <rect x="2.5" y="14" width="15" height="2.5" rx="1.25" />
              <circle cx="10" cy="19" r="1.75" />
            </svg>
            <span
              className="text-base font-semibold"
              style={{ color: "hsl(0, 0%, 100%)", letterSpacing: "0.06em" }}
            >
              Concierge
            </span>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md transition-colors"
            style={{ color: "hsl(215, 20%, 60%)" }}
            aria-label={t("sidebar.closeMenu")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose?.()}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  "relative"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: "hsl(222, 30%, 16%)",
                        color: "hsl(0, 0%, 100%)",
                        borderInlineStart: "2px solid hsl(38, 92%, 50%)",
                        paddingInlineStart: "calc(0.75rem - 2px)",
                      }
                    : {
                        color: "hsl(215, 20%, 58%)",
                        borderInlineStart: "2px solid transparent",
                        paddingInlineStart: "calc(0.75rem - 2px)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "hsl(222, 30%, 12%)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(0, 0%, 90%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLElement).style.color = "hsl(215, 20%, 58%)";
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div
          className="p-4 space-y-3"
          style={{ borderTop: "1px solid hsl(222, 30%, 14%)" }}
        >
          {/* Plan badge */}
          <div
            className="px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: "hsl(222, 30%, 12%)" }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="w-3 h-3" style={{ color: "hsl(38, 92%, 60%)" }} />
              <p className="text-xs font-semibold" style={{ color: "hsl(0, 0%, 90%)" }}>
                {t("sidebar.trialPlan")}
              </p>
            </div>
            <p className="text-xs" style={{ color: "hsl(215, 20%, 50%)" }}>
              14 {t("sidebar.daysRemaining")}
            </p>
          </div>

          <Link href="/settings/subscription" className="block">
            <button
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 active:opacity-80"
              style={{
                backgroundColor: "hsl(38, 92%, 50%)",
                color: "hsl(0, 0%, 100%)",
              }}
            >
              {t("buttons.upgrade")}
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
