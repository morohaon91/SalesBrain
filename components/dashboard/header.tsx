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
  Search,
  Menu,
} from "lucide-react";

/**
 * Get display title from pathname
 */
function getTitleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter((s) => Boolean(s));
  if (segments.length === 0) return "Dashboard";

  const lastSegment = segments[segments.length - 1] ?? "Dashboard";
  const secondLastSegment = segments[segments.length - 2];

  // Remove ID parameter if present (UUID or numeric ID)
  if (
    lastSegment.match(/^[a-z0-9-]{8,}$/i) &&
    secondLastSegment &&
    secondLastSegment !== lastSegment
  ) {
    return secondLastSegment;
  }

  return lastSegment;
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

/**
 * Header component with page title and user menu
 * Includes mobile hamburger menu toggle
 */
export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isHebrew } = useI18n('common');

  const pageTitle = getTitleFromPathname(pathname)
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleProfileClick = () => {
    router.push("/profile");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ms-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={t('header.openMenu')}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Page Title */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{pageTitle}</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={t('header.notifications')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>

            {/* User Name */}
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500">{user?.role}</span>
            </div>

            {/* Chevron */}
            <ChevronDown className="w-4 h-4 text-gray-600 flip-rtl" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute end-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-start"
                >
                  <User className="w-4 h-4 shrink-0" aria-hidden />
                  {t('menu.profile')}
                </button>

                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-start"
                >
                  <Settings className="w-4 h-4 shrink-0" aria-hidden />
                  {t('menu.settings')}
                </button>

                {/* Language Switcher */}
                <LanguageSwitcher isOpen={true} onSelect={() => setIsMenuOpen(false)} />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 py-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors text-start"
                >
                  <LogOut className={rtlMirrorIcon(isHebrew, 'w-4 h-4 shrink-0')} aria-hidden />
                  {t('menu.signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
