"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  businessName: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  users: any[];
  _count: {
    conversations: number;
    leads: number;
    simulations: number;
  };
}

interface Analytics {
  tenants: { total: number; active: number };
  users: number;
  conversations: number;
  leads: { total: number; qualified: number };
  ai: { totalCost30Days: number; totalCalls30Days: number };
  revenue: Array<{ tier: string; count: number }>;
}

export default function PlatformAdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("platformAdminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      setLoading(true);

      // Fetch analytics
      const analyticsRes = await fetch("/api/v1/platform-admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!analyticsRes.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.data);

      // Fetch tenants
      const tenantsRes = await fetch("/api/v1/platform-admin/tenants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!tenantsRes.ok) {
        throw new Error("Failed to fetch tenants");
      }

      const tenantsData = await tenantsRes.json();
      setTenants(tenantsData.data);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load dashboard");
      localStorage.removeItem("platformAdminToken");
      router.push("/admin/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("platformAdminToken");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-danger-600">{error || "Failed to load data"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tenants"
            value={analytics.tenants.total}
            subtitle={`${analytics.tenants.active} active`}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={analytics.users}
            color="green"
          />
          <StatCard
            title="Conversations"
            value={analytics.conversations}
            color="purple"
          />
          <StatCard
            title="AI Costs (30d)"
            value={`$${analytics.ai.totalCost30Days.toFixed(2)}`}
            subtitle={`${analytics.ai.totalCalls30Days} calls`}
            color="orange"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Leads"
            value={analytics.leads.total}
            subtitle={`${analytics.leads.qualified} qualified`}
            color="indigo"
          />
          <StatCard
            title="Revenue Distribution"
            value="-"
            subtitle={`${analytics.revenue.length} tiers`}
            color="pink"
          />
          <StatCard
            title="AI Usage"
            value={`${analytics.ai.totalCalls30Days}`}
            subtitle="API calls"
            color="cyan"
          />
        </div>

        {/* Tenants List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Tenants ({tenants.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Conversations
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Leads
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant.businessName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant.users.length}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant._count.conversations}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant._count.leads}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                        {tenant.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tenant.subscriptionStatus === "ACTIVE"
                            ? "bg-success-100 text-success-800"
                            : tenant.subscriptionStatus === "CANCELED"
                              ? "bg-danger-100 text-danger-800"
                              : "bg-warning-100 text-warning-800"
                        }`}
                      >
                        {tenant.subscriptionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Breakdown */}
        {analytics.revenue.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue by Tier
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-2">
                {analytics.revenue.map((tier, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-700">{tier.tier}</span>
                    <span className="font-semibold text-gray-900">
                      {tier.count} tenant(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  const colorClasses = {
    blue: "bg-primary-50 border-primary-200",
    green: "bg-success-50 border-success-200",
    purple: "bg-accent-50 border-accent-200",
    orange: "bg-orange-50 border-orange-200",
    indigo: "bg-indigo-50 border-indigo-200",
    pink: "bg-pink-50 border-pink-200",
    cyan: "bg-cyan-50 border-cyan-200",
  };

  const textColorClasses = {
    blue: "text-primary-700",
    green: "text-success-700",
    purple: "text-accent-700",
    orange: "text-orange-700",
    indigo: "text-indigo-700",
    pink: "text-pink-700",
    cyan: "text-cyan-700",
  };

  return (
    <div
      className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}
    >
      <h3
        className={`text-sm font-medium ${textColorClasses[color as keyof typeof textColorClasses]} mb-2`}
      >
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
