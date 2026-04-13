"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon,
  Copy,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Check,
} from "lucide-react";

type Tab = "account" | "subscription" | "widget" | "security";

/**
 * Settings page component
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useI18n("settings");
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs: Array<{ id: Tab; label: string; icon: typeof SettingsIcon }> = [
    { id: "account", label: t("page.tabs.account"), icon: SettingsIcon },
    { id: "subscription", label: t("page.tabs.subscription"), icon: SettingsIcon },
    { id: "widget", label: t("page.tabs.widget"), icon: SettingsIcon },
    { id: "security", label: t("page.tabs.security"), icon: SettingsIcon },
  ];

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-primary-600 border-primary-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("page.account.infoTitle")}
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.account.fullName")}
                </label>
                <Input
                  type="text"
                  defaultValue={user?.name || ""}
                  className="max-w-md"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.account.email")}
                </label>
                <Input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="max-w-md bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("page.account.emailLocked")}
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.account.role")}
                </label>
                <div className="bg-gray-50 px-4 py-2 rounded-lg max-w-md border border-gray-200">
                  <p className="text-sm text-gray-900 font-medium">{user?.role}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("page.account.ownerWorkspace")}
                  </p>
                </div>
              </div>

              {/* Member Invite */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">{t("page.account.teamTitle")}</h4>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t("page.account.teamPlaceholder")}
                    className="max-w-md"
                  />
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    {t("page.account.sendInvite")}
                  </Button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200 flex gap-2">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {t("page.account.saveChanges")}
                </Button>
                {showSuccess && (
                  <div className="text-success-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {t("page.account.saved")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("page.subscription.currentPlan")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary-900">{t("page.subscription.trialPlan")}</p>
                  <p className="text-2xl font-bold text-primary-900 mt-2">$0</p>
                  <p className="text-xs text-primary-700 mt-1">
                    {t("page.subscription.trialRemaining")}
                  </p>
                  <div className="mt-4 space-y-1 text-xs text-primary-800">
                    <p>✓ {t("page.subscription.featSimulations")}</p>
                    <p>✓ {t("page.subscription.featAnalytics")}</p>
                    <p>✓ {t("page.subscription.featTeam")}</p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t("page.subscription.upgradeTitle")}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {t("page.subscription.upgradeBody")}
                    </p>
                  </div>
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white w-full">
                    {t("page.subscription.viewPlans")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("page.subscription.billingHistory")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("page.subscription.billingEmpty")}
              </p>
            </div>
          </div>
        )}

        {/* Widget Tab */}
        {activeTab === "widget" && (
          <div className="space-y-6">
            {/* Widget Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("page.widget.configTitle")}
              </h3>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.widget.apiKey")}
                </label>
                <div className="flex gap-2 max-w-md">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      defaultValue="wk_sk_live_1234567890abcdef"
                      disabled
                      className="pr-10"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleCopyToClipboard("wk_sk_live_1234567890abcdef")
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t("page.widget.apiKeyHint")}
                </p>
              </div>

              {/* Embed Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.widget.embedCode")}
                </label>
                <div className="relative">
                  <textarea
                    defaultValue={`<script src="https://yourbusinessbrain.com/widget.js"></script>
<script>
  YourBusinessBrain.init({
    apiKey: "wk_sk_live_1234567890abcdef"
  });
</script>`}
                    disabled
                    rows={5}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-600"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      handleCopyToClipboard(`<script src="https://yourbusinessbrain.com/widget.js"></script>
<script>
  YourBusinessBrain.init({
    apiKey: "wk_sk_live_1234567890abcdef"
  });
</script>`)
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Widget Preview Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.widget.preview")}
                </label>
                <Button variant="outline">
                  {t("page.widget.previewButton")}
                </Button>
              </div>
            </div>

            {/* Widget Documentation */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-900 mb-2">
                {t("page.widget.helpTitle")}
              </p>
              <p className="text-xs text-primary-700">
                {t("page.widget.helpBody")}{" "}
                <a href="#" className="underline hover:no-underline">
                  {t("page.widget.helpLink")}
                </a>{" "}
                {t("page.widget.helpSuffix")}
              </p>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Password */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("page.security.passwordTitle")}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.security.currentPassword")}
                </label>
                <Input type="password" className="max-w-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.security.newPassword")}
                </label>
                <Input type="password" className="max-w-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("page.security.confirmPassword")}
                </label>
                <Input type="password" className="max-w-md" />
              </div>

              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                {t("page.security.updatePassword")}
              </Button>
            </div>

            {/* Sessions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("page.security.sessionsTitle")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("page.security.currentSession")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("page.security.sessionMeta")}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 truncate ml-2">192.168.1.100</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                {t("page.security.signOutAll")}
              </Button>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("page.security.twoFactorTitle")}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("page.security.twoFactorBody")}
                  </p>
                </div>
                <Button variant="outline">{t("page.security.enable2fa")}</Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-danger-900 mb-4">
                {t("page.security.dangerTitle")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-danger-800 mb-2">
                    {t("page.security.dangerBody")}
                  </p>
                  <Button
                    variant="outline"
                    className="text-danger-600 border-danger-300 hover:bg-danger-50"
                  >
                    {t("page.security.deleteAccount")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
