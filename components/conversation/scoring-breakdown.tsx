"use client";

import { Flame, Thermometer, Snowflake } from "lucide-react";

interface ScoringBreakdownData {
  totalScore: number;
  temperature: "hot" | "warm" | "cold";
  components: {
    budgetFit: {
      score: number;
      reasoning: string;
      leadBudget?: number;
      ownerRange?: { min: number; max: number };
    };
    timelineFit: {
      score: number;
      reasoning: string;
      leadTimeline?: string;
      ownerTypical?: string;
    };
    engagement: {
      score: number;
      reasoning: string;
      signals: string[];
    };
    valueAlignment: {
      score: number;
      reasoning: string;
      matchedValues: string[];
    };
  };
  qualificationAnalysis: {
    greenFlagsMatched: string[];
    redFlagsDetected: string[];
    dealBreakersPresent: string[];
    mustHavesMet: string[];
  };
  recommendation: {
    action: "call_immediately" | "call_soon" | "email_first" | "skip";
    reasoning: string;
    talkingPoints: string[];
  };
}

export function ScoringBreakdown({ breakdown }: { breakdown: ScoringBreakdownData }) {
  const getTemperatureIcon = () => {
    switch (breakdown.temperature) {
      case "hot":
        return <Flame className="w-5 h-5 text-red-500" />;
      case "warm":
        return <Thermometer className="w-5 h-5 text-orange-500" />;
      case "cold":
        return <Snowflake className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTemperatureColor = () => {
    switch (breakdown.temperature) {
      case "hot":
        return "bg-red-50 border-red-200";
      case "warm":
        return "bg-orange-50 border-orange-200";
      case "cold":
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTemperatureTextColor = () => {
    switch (breakdown.temperature) {
      case "hot":
        return "text-red-700";
      case "warm":
        return "text-orange-700";
      case "cold":
        return "text-blue-700";
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Temperature Badge */}
      <div className={`border rounded-lg p-4 ${getTemperatureColor()}`}>
        <div className="flex items-center gap-3 mb-3">
          {getTemperatureIcon()}
          <div>
            <p className={`text-xs font-medium uppercase ${getTemperatureTextColor()}`}>
              {breakdown.temperature === "hot" ? "🔥 Hot Lead" : breakdown.temperature === "warm" ? "🟡 Warm Lead" : "❄️ Cold Lead"}
            </p>
            <p className={`text-sm font-semibold ${getTemperatureTextColor()}`}>
              {breakdown.recommendation.action.replace(/_/g, " ").toUpperCase()}
            </p>
          </div>
        </div>
        <p className={`text-xs ${getTemperatureTextColor()} italic`}>
          {breakdown.recommendation.reasoning}
        </p>
      </div>

      {/* Score Components Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Budget Fit */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Budget Fit</span>
            <span className="text-lg font-bold text-gray-900">
              {breakdown.components.budgetFit.score}/30
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${getScoreColor(breakdown.components.budgetFit.score, 30)}`}
              style={{ width: `${(breakdown.components.budgetFit.score / 30) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {breakdown.components.budgetFit.reasoning}
          </p>
        </div>

        {/* Timeline Fit */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Timeline Fit</span>
            <span className="text-lg font-bold text-gray-900">
              {breakdown.components.timelineFit.score}/20
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${getScoreColor(breakdown.components.timelineFit.score, 20)}`}
              style={{ width: `${(breakdown.components.timelineFit.score / 20) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {breakdown.components.timelineFit.reasoning}
          </p>
        </div>

        {/* Engagement */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Engagement</span>
            <span className="text-lg font-bold text-gray-900">
              {breakdown.components.engagement.score}/25
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${getScoreColor(breakdown.components.engagement.score, 25)}`}
              style={{ width: `${(breakdown.components.engagement.score / 25) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {breakdown.components.engagement.reasoning}
          </p>
        </div>

        {/* Value Alignment */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Value Alignment</span>
            <span className="text-lg font-bold text-gray-900">
              {breakdown.components.valueAlignment.score}/25
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${getScoreColor(breakdown.components.valueAlignment.score, 25)}`}
              style={{ width: `${(breakdown.components.valueAlignment.score / 25) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {breakdown.components.valueAlignment.reasoning}
          </p>
        </div>
      </div>

      {/* Qualification Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-900">Qualification Analysis</p>

        {breakdown.qualificationAnalysis.greenFlagsMatched.length > 0 && (
          <div>
            <p className="text-xs font-medium text-green-700 mb-1">✓ Green Flags</p>
            <div className="flex flex-wrap gap-1">
              {breakdown.qualificationAnalysis.greenFlagsMatched.map((flag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {breakdown.qualificationAnalysis.redFlagsDetected.length > 0 && (
          <div>
            <p className="text-xs font-medium text-orange-700 mb-1">⚠ Red Flags</p>
            <div className="flex flex-wrap gap-1">
              {breakdown.qualificationAnalysis.redFlagsDetected.map((flag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-700"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {breakdown.qualificationAnalysis.dealBreakersPresent.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-700 mb-1">✗ Deal-Breakers</p>
            <div className="flex flex-wrap gap-1">
              {breakdown.qualificationAnalysis.dealBreakersPresent.map((flag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Talking Points */}
      {breakdown.recommendation.talkingPoints.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-900 mb-2">💡 Talking Points</p>
          <ul className="space-y-1">
            {breakdown.recommendation.talkingPoints.map((point, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
