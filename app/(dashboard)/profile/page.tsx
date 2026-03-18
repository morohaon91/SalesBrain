"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Edit } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  // Mock business profile data
  const profile = {
    tenantId: user?.tenantId,
    extractedAt: "2026-03-17T10:30:00Z",
    confidence: 87,
    simulationCount: 5,
    pricingRules: {
      currency: "USD",
      basePrice: 5000,
      minimumPrice: 3500,
      discountThreshold: 5000,
      annualDiscount: "15%",
    },
    toneProfile: {
      formality: "Professional but friendly",
      responseTime: "Within 2 hours",
      negotiationStyle: "Collaborative, value-focused",
    },
    dealBreakers: [
      "Clients outside US/Canada",
      "Request for >50% discount",
      "Companies with <10 employees",
    ],
    strengths: [
      "Strong ROI focus",
      "Excellent negotiation skills",
      "Quick decision-making",
    ],
    improvements: [
      "Build more rapport early",
      "Ask qualifying questions sooner",
      "Handle budget objections better",
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600 mt-1">
            Your extracted business rules and communication style
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Re-extract
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profile Confidence</h2>
          <span className="text-3xl font-bold text-primary-600">
            {profile.confidence}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary-600"
            style={{ width: `${profile.confidence}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">
          Based on {profile.simulationCount} simulations. Run more simulations to improve accuracy.
        </p>
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Rules */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            💰 Pricing Rules
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Base Price</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                ${profile.pricingRules.basePrice.toLocaleString()}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600">Minimum</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    ${profile.pricingRules.minimumPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Discount Threshold
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    ${profile.pricingRules.discountThreshold.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gray-600">Annual Discount</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {profile.pricingRules.annualDiscount}
              </p>
            </div>
          </div>
        </div>

        {/* Tone Profile */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            🎤 Tone Profile
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600">Formality</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {profile.toneProfile.formality}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gray-600">Response Time</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {profile.toneProfile.responseTime}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gray-600">Negotiation Style</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {profile.toneProfile.negotiationStyle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Breakers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          🚫 Deal Breakers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.dealBreakers.map((breaker, idx) => (
            <div
              key={idx}
              className="p-4 bg-danger-50 border border-danger-200 rounded-lg"
            >
              <p className="text-sm text-danger-900 font-medium">{breaker}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            ⭐ Strengths
          </h2>

          <ul className="space-y-3">
            {profile.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 bg-success-50 border border-success-200 rounded-lg"
              >
                <span className="text-success-600 font-bold mt-0.5">✓</span>
                <span className="text-sm text-gray-900">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            📈 Areas to Improve
          </h2>

          <ul className="space-y-3">
            {profile.improvements.map((improvement, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 bg-warning-50 border border-warning-200 rounded-lg"
              >
                <span className="text-warning-600 font-bold mt-0.5">→</span>
                <span className="text-sm text-gray-900">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="font-semibold text-primary-900 mb-2">💡 How Profile Works</h3>
        <p className="text-sm text-primary-700 mb-3">
          Your business profile is automatically extracted from your simulations. Each
          conversation helps the AI understand your pricing, tone, and negotiation style.
        </p>
        <Button variant="outline" className="border-primary-300 text-primary-700">
          Learn More
        </Button>
      </div>
    </div>
  );
}
