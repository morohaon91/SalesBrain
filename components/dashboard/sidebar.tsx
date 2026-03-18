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
  X,
} from "lucide-react";

/**
 * Navigation items for sidebar
 */
const getNavigation = (t: any) => [
  {
    name: t('navigation.dashboard'),
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: t('navigation.conversations'),
    href: "/conversations",
    icon: MessageSquare,
  },
  {
    name: t('navigation.leads'),
    href: "/leads",
    icon: Users,
  },
  {
    name: t('navigation.simulations'),
    href: "/simulations",
    icon: BrainCircuit,
  },
  {
    name: t('navigation.analytics'),
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: t('navigation.profile'),
    href: "/profile",
    icon: User,
  },
  {
    name: t('navigation.settings'),
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar component with dark slate design
 * Responsive: collapses on mobile with slide-in animation
 */
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n('common');
  const navigation = getNavigation(t);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-slate-900 flex flex-col overflow-hidden h-screen",
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">SalesBrain</h1>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-slate-800 rounded transition-colors"
            aria-label={t('sidebar.closeMenu')}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-slate-800 text-white border-l-2 border-primary-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2.5 bg-slate-800 rounded-lg">
            <p className="text-xs font-semibold text-slate-200">{t('sidebar.trialPlan')}</p>
            <p className="text-xs text-slate-400 mt-1">14 {t('sidebar.daysRemaining')}</p>
          </div>

          <button className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
            {t('buttons.upgrade')}
          </button>
        </div>
      </aside>
    </>
  );
}
