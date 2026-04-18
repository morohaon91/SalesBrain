"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { rtlMirrorIcon } from "@/lib/i18n/rtl-icons";
import {
  LogOut,
  Settings,
  User,
  ChevronDown,
  Bell,
  Menu,
} from "lucide-react";

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  const last = segments[segments.length - 1] ?? "Dashboard";
  const secondLast = segments[segments.length - 2];
  if (last.match(/^[a-z0-9-]{8,}$/i) && secondLast) return secondLast;
  return last;
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isHebrew } = useI18n("common");

  const pageTitle = getPageTitle(pathname)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try { await logout(); } catch { router.push("/login"); }
  };

  return (
    <header
      className="px-4 sm:px-6 py-3.5 flex items-center justify-between"
      style={{
        backgroundColor: "hsl(0, 0%, 100%)",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ms-2 rounded-lg transition-colors hover:bg-slate-100"
          aria-label={t("header.openMenu")}
        >
          <Menu className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }} />
        </button>
        <h2
          className="text-base font-semibold truncate capitalize"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {pageTitle}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-slate-100"
          aria-label={t("header.notifications")}
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <Bell className="w-4.5 h-4.5" />
          <span
            className="absolute top-1.5 end-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "hsl(350, 89%, 50%)" }}
          />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: "hsl(38 92% 50% / 0.15)",
                color: "hsl(38, 92%, 40%)",
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>
                {user?.name}
              </span>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 flip-rtl"
              style={{ color: "hsl(var(--muted-foreground))" }}
            />
          </button>

          {isMenuOpen && (
            <div
              className="absolute end-0 mt-1.5 w-52 rounded-xl shadow-lg z-50 overflow-hidden"
              style={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                  {user?.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {user?.email}
                </p>
              </div>

              <div className="py-1.5">
                <button
                  onClick={() => { router.push("/profile"); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors hover:bg-slate-50"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  <User className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                  {t("menu.profile")}
                </button>
                <button
                  onClick={() => { router.push("/settings"); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors hover:bg-slate-50"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  <Settings className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                  {t("menu.settings")}
                </button>
                <LanguageSwitcher isOpen onSelect={() => setIsMenuOpen(false)} />
              </div>

              <div className="py-1.5" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors hover:bg-red-50"
                  style={{ color: "hsl(350, 89%, 44%)" }}
                >
                  <LogOut
                    className={rtlMirrorIcon(isHebrew, "w-3.5 h-3.5 shrink-0")}
                    aria-hidden
                  />
                  {t("menu.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}
