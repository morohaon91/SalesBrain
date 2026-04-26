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

  const menuItemStyle = {
    background: "transparent",
    color: "hsl(228, 12%, 60%)",
    border: "none",
    transition: "all 0.15s",
  };

  return (
    <header
      className="px-4 sm:px-6 py-3.5 flex items-center justify-between"
      style={{
        background: "hsl(228, 42%, 5%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ms-2 rounded-lg transition-colors"
          style={{ color: "hsl(228, 12%, 52%)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "")}
          aria-label={t("header.openMenu")}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2
          className="text-sm font-semibold truncate capitalize tracking-wide"
          style={{ color: "hsl(228, 12%, 52%)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {pageTitle}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: "hsl(228, 12%, 52%)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "")}
          aria-label={t("header.notifications")}
        >
          <Bell className="w-4.5 h-4.5" />
          <span
            className="absolute top-1.5 end-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(350,80%,55%)" }}
          />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "")}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: "rgba(200,136,26,0.15)",
                color: "hsl(38, 84%, 61%)",
                border: "1px solid rgba(200,136,26,0.25)",
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-medium" style={{ color: "hsl(38, 25%, 82%)" }}>
                {user?.name}
              </span>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 flip-rtl"
              style={{ color: "hsl(228, 12%, 47%)" }}
            />
          </button>

          {isMenuOpen && (
            <div
              className="absolute end-0 mt-1.5 w-52 rounded-xl z-50 overflow-hidden"
              style={{
                background: "hsl(228, 32%, 8%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "hsl(38, 25%, 88%)" }}>
                  {user?.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(228, 12%, 47%)" }}>
                  {user?.email}
                </p>
              </div>

              <div className="py-1.5">
                {[
                  { label: t("menu.profile"), icon: User, path: "/profile" },
                  { label: t("menu.settings"), icon: Settings, path: "/settings" },
                ].map(({ label, icon: Icon, path }) => (
                  <button
                    key={path}
                    onClick={() => { router.push(path); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors"
                    style={menuItemStyle}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.color = "hsl(38, 25%, 88%)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "";
                      (e.currentTarget as HTMLElement).style.color = "hsl(228, 12%, 60%)";
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
                <LanguageSwitcher isOpen onSelect={() => setIsMenuOpen(false)} />
              </div>

              <div className="py-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors"
                  style={{ color: "hsl(350,70%,60%)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(244,63,94,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
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
