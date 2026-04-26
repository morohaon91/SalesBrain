"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff, Save, Check, Lock, CreditCard, Code, Shield } from "lucide-react";

type Tab = "account" | "subscription" | "widget" | "security";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useI18n("settings");
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs: Array<{ id: Tab; label: string; icon: typeof Save }> = [
    { id: "account", label: t("page.tabs.account"), icon: Save },
    { id: "subscription", label: t("page.tabs.subscription"), icon: CreditCard },
    { id: "widget", label: t("page.tabs.widget"), icon: Code },
    { id: "security", label: t("page.tabs.security"), icon: Shield },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {t("title")}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("subtitle")}
        </p>
      </div>

      {/* ── Tab nav ── */}
      <div
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-webkit-overflow-scrolling:touch]"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex snap-start items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px"
              style={
                isActive
                  ? {
                      color: "hsl(38,84%,61%)",
                      borderColor: "hsl(38,84%,61%)",
                    }
                  : {
                      color: "hsl(var(--muted-foreground))",
                      borderColor: "transparent",
                    }
              }
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div>
        {activeTab === "account" && (
          <div
            className="rounded-xl p-6 space-y-6 max-w-xl"
            style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
              {t("page.account.infoTitle")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.account.fullName")}
                </label>
                <Input type="text" defaultValue={user?.name || ""} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.account.email")}
                </label>
                <Input type="email" defaultValue={user?.email || ""} disabled />
                <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t("page.account.emailLocked")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.account.role")}
                </label>
                <div
                  className="px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: "hsl(var(--muted))",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: "hsl(38, 92%, 50%)", color: "hsl(0,0%,100%)" }}
              >
                <Save className="w-4 h-4" />
                {t("page.account.saveChanges")}
              </button>
              {showSuccess && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "#4ade80" }}>
                  <Check className="w-4 h-4" />
                  {t("page.account.saved")}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "subscription" && (
          <div className="space-y-5 max-w-xl">
            <div
              className="rounded-xl p-6"
              style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("page.subscription.currentPlan")}
              </h3>
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: "hsl(38 92% 50% / 0.05)",
                  borderColor: "hsl(38 92% 50% / 0.2)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: "hsl(38,84%,61%)" }}>
                      {t("page.subscription.trialPlan")}
                    </p>
                    <p className="text-3xl font-bold mt-1" style={{ color: "hsl(var(--foreground))" }}>$0</p>
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {t("page.subscription.trialRemaining")}
                    </p>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "rgba(200,136,26,0.12)", color: "hsl(38,84%,61%)" }}
                  >
                    Trial
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm" style={{ color: "hsl(38,84%,61%)" }}>
                  <p>✓ {t("page.subscription.featSimulations")}</p>
                  <p>✓ {t("page.subscription.featAnalytics")}</p>
                  <p>✓ {t("page.subscription.featTeam")}</p>
                </div>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <h4 className="font-medium mb-1" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.subscription.upgradeTitle")}
                </h4>
                <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t("page.subscription.upgradeBody")}
                </p>
                <button
                  className="w-full py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "hsl(38, 92%, 50%)", color: "hsl(0,0%,100%)" }}
                >
                  {t("page.subscription.viewPlans")}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "widget" && (
          <div className="space-y-5 max-w-xl">
            <div
              className="rounded-xl p-6 space-y-5"
              style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("page.widget.configTitle")}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.widget.apiKey")}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      defaultValue="wk_sk_live_1234567890abcdef"
                      disabled
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute end-3 inset-y-0 my-auto transition-opacity hover:opacity-70"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" onClick={() => handleCopy("wk_sk_live_1234567890abcdef")}>
                    {showSuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.widget.embedCode")}
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={5}
                    defaultValue={`<script src="https://widget.salesbrain.ai/v1/widget.js"></script>\n<script>\n  window.SalesBrainConfig = { apiKey: "wk_sk_live_1234567890abcdef" };\n</script>`}
                    className="w-full p-3 rounded-lg font-mono text-xs resize-none"
                    style={{
                      backgroundColor: "hsl(222, 47%, 7%)",
                      color: "hsl(215, 15%, 70%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                    }}
                  />
                  <button
                    className="absolute top-2 end-2 p-1.5 rounded transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "hsl(222, 30%, 16%)", color: "hsl(215, 15%, 65%)" }}
                    onClick={() => handleCopy("embed")}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-5 max-w-xl">
            <div
              className="rounded-xl p-6 space-y-4"
              style={{ background: 'hsl(228,32%,8%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("page.security.passwordTitle")}
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.security.currentPassword")}
                </label>
                <Input type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.security.newPassword")}
                </label>
                <Input type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  {t("page.security.confirmPassword")}
                </label>
                <Input type="password" />
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: "hsl(38, 92%, 50%)", color: "hsl(0,0%,100%)" }}
              >
                <Lock className="w-4 h-4" />
                {t("page.security.updatePassword")}
              </button>
            </div>

            {/* Danger Zone */}
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: "hsl(350 89% 50% / 0.03)",
                borderColor: "hsl(350 89% 50% / 0.2)",
              }}
            >
              <h3 className="font-semibold mb-1" style={{ color: "#fb7185" }}>
                {t("page.security.dangerTitle")}
              </h3>
              <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("page.security.dangerBody")}
              </p>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                style={{
                  borderColor: "hsl(350 89% 50% / 0.3)",
                  color: "#fb7185",
                }}
              >
                {t("page.security.deleteAccount")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
