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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
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
        style={{
          background: "hsl(228, 42%, 5%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Wordmark ── */}
        <div
          className="px-5 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
            onClick={onClose}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm transition-transform duration-200 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
                color: "#060300",
                fontFamily: "'Cormorant', Georgia, serif",
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              ✦
            </div>
            <span
              className="text-base font-semibold tracking-wide"
              style={{
                color: "hsl(38, 25%, 90%)",
                fontFamily: "'Cormorant', Georgia, serif",
                letterSpacing: "0.06em",
              }}
            >
              Concierge
            </span>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md transition-colors hover:bg-white/5"
            style={{ color: "hsl(228, 12%, 47%)" }}
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
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative"
                style={
                  isActive
                    ? {
                        background: "rgba(200,136,26,0.1)",
                        color: "hsl(38, 84%, 61%)",
                        borderInlineStart: "2px solid hsl(38,78%,46%)",
                        paddingInlineStart: "calc(0.75rem - 2px)",
                      }
                    : {
                        color: "hsl(228, 12%, 52%)",
                        borderInlineStart: "2px solid transparent",
                        paddingInlineStart: "calc(0.75rem - 2px)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(38, 25%, 85%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "hsl(228, 12%, 52%)";
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
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(200,136,26,0.07)", border: "1px solid rgba(200,136,26,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="w-3 h-3" style={{ color: "hsl(38, 84%, 61%)" }} />
              <p className="text-xs font-semibold" style={{ color: "hsl(38, 25%, 88%)" }}>
                {t("sidebar.trialPlan")}
              </p>
            </div>
            <p className="text-xs" style={{ color: "hsl(228, 12%, 47%)" }}>
              14 {t("sidebar.daysRemaining")}
            </p>
          </div>

          <Link href="/settings/subscription" className="block">
            <button
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, hsl(38,84%,61%), hsl(38,78%,46%))",
                color: "#060300",
                boxShadow: "0 4px 16px rgba(200,136,26,0.3)",
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
