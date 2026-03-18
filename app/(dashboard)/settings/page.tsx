"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
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
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "subscription", label: "Subscription", icon: SettingsIcon },
    { id: "widget", label: "Widget", icon: SettingsIcon },
    { id: "security", label: "Security", icon: SettingsIcon },
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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account, subscription, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 px-0">
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Account Information
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
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
                  Email Address
                </label>
                <Input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="max-w-md bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Role
                </label>
                <div className="bg-gray-50 px-4 py-2 rounded-lg max-w-md border border-gray-200">
                  <p className="text-sm text-gray-900 font-medium">{user?.role}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner of this workspace
                  </p>
                </div>
              </div>

              {/* Member Invite */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Add Team Members</h4>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="team@example.com"
                    className="max-w-md"
                  />
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    Send Invite
                  </Button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200 flex gap-2">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                {showSuccess && (
                  <div className="text-success-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Saved
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
                Current Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary-900">TRIAL PLAN</p>
                  <p className="text-2xl font-bold text-primary-900 mt-2">$0</p>
                  <p className="text-xs text-primary-700 mt-1">
                    14 days remaining (expires Mar 31, 2026)
                  </p>
                  <div className="mt-4 space-y-1 text-xs text-primary-800">
                    <p>✓ Unlimited simulations</p>
                    <p>✓ Basic analytics</p>
                    <p>✓ 1 team member</p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Ready to upgrade?
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Get advanced features and unlimited API calls
                    </p>
                  </div>
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white w-full">
                    View Plans
                  </Button>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Billing History
              </h3>
              <p className="text-sm text-gray-600">
                No billing yet. Start with trial, upgrade when ready.
              </p>
            </div>
          </div>
        )}

        {/* Widget Tab */}
        {activeTab === "widget" && (
          <div className="space-y-6">
            {/* Widget Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Widget Configuration
              </h3>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget API Key
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
                  Use this key to embed the widget on your website
                </p>
              </div>

              {/* Embed Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embed Code
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
                  Widget Preview
                </label>
                <Button variant="outline">
                  Preview Widget
                </Button>
              </div>
            </div>

            {/* Widget Documentation */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-900 mb-2">
                Need help setting up the widget?
              </p>
              <p className="text-xs text-primary-700">
                Check our{" "}
                <a href="#" className="underline hover:no-underline">
                  widget documentation
                </a>{" "}
                for advanced customization options
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
                Password & Security
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <Input type="password" className="max-w-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input type="password" className="max-w-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input type="password" className="max-w-md" />
              </div>

              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                Update Password
              </Button>
            </div>

            {/* Sessions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Active Sessions
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Session
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Chrome on Windows • Active now
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">192.168.1.100</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                Sign Out All Sessions
              </Button>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-danger-900 mb-4">
                Danger Zone
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-danger-800 mb-2">
                    <strong>Delete Account:</strong> Permanently delete your account
                    and all data. This action cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    className="text-danger-600 border-danger-300 hover:bg-danger-50"
                  >
                    Delete Account
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
