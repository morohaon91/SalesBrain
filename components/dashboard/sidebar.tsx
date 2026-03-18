"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BrainCircuit,
  BarChart3,
  Settings,
  User,
} from "lucide-react";

/**
 * Navigation items for sidebar
 */
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    name: "Simulations",
    href: "/simulations",
    icon: BrainCircuit,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * Sidebar component with dark slate design
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 flex flex-col overflow-hidden h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">SalesBrain</h1>
        </div>
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
          <p className="text-xs font-semibold text-slate-200">Trial Plan</p>
          <p className="text-xs text-slate-400 mt-1">14 days remaining</p>
        </div>

        <button className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
}
