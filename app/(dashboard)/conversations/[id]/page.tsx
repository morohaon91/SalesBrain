"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/shared/message-bubble";
import { ArrowLeft, Flag } from "lucide-react";

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const [isQualified, setIsQualified] = useState(false);

  // Mock conversation data
  const conversation = {
    id: conversationId,
    leadName: "Sarah Johnson",
    leadEmail: "sarah@acmecorp.com",
    status: "ENDED",
    qualificationStatus: "QUALIFIED",
    leadScore: 85,
    messageCount: 12,
    duration: 1245,
    createdAt: "2026-03-17T10:30:00Z",
    summary:
      "Lead showed strong interest in our premium tier. Budget approved, timeline 2-3 months.",
    messages: [
      {
        id: "1",
        role: "assistant",
        content:
          "Hello Sarah! Thanks for reaching out. How can I help you today?",
        createdAt: "2026-03-17T10:30:00Z",
      },
      {
        id: "2",
        role: "user",
        content:
          "Hi! I'm looking for a solution to help our team with lead qualification.",
        createdAt: "2026-03-17T10:31:00Z",
      },
      {
        id: "3",
        role: "assistant",
        content:
          "Great! You've come to the right place. Can you tell me about your current process and main pain points?",
        createdAt: "2026-03-17T10:32:00Z",
      },
      {
        id: "4",
        role: "user",
        content:
          "We currently use a manual spreadsheet. It's time-consuming and error-prone. We need AI to qualify leads automatically.",
        createdAt: "2026-03-17T10:33:00Z",
      },
      {
        id: "5",
        role: "assistant",
        content:
          "I completely understand. Our platform can analyze conversations and qualify leads in real-time. How many leads do you handle monthly?",
        createdAt: "2026-03-17T10:34:00Z",
      },
      {
        id: "6",
        role: "user",
        content:
          "Around 200-300 inbound leads per month. What's your pricing structure?",
        createdAt: "2026-03-17T10:35:00Z",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
              {conversation.leadName}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 break-all">{conversation.leadEmail}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <Button variant="outline" className="text-sm">
            <Flag className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Flag</span>
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Add to CRM</span>
            <span className="sm:hidden">Add CRM</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Transcript */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversation Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-600">Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                  {conversation.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Duration</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {Math.round(conversation.duration / 60)} min
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Messages</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {conversation.messageCount}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Summary
              </h3>
              <p className="text-sm text-gray-600">{conversation.summary}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conversation
            </h3>

            {conversation.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
                timestamp={msg.createdAt}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Score */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Score
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Overall
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {conversation.leadScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600"
                    style={{ width: `${conversation.leadScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <p className="text-xs font-medium text-gray-600">Indicators:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✓ Budget approved</li>
                  <li>✓ Timeline: 2-3 months</li>
                  <li>✓ Strong interest</li>
                  <li>✗ Not urgent</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Qualification Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Qualification
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800">
                  Qualified
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Recommendation
                </p>
                <p className="text-sm text-gray-900">
                  Contact immediately - high-value prospect
                </p>
              </div>

              <div className="pt-3">
                <Button
                  onClick={() => setIsQualified(!isQualified)}
                  className="w-full bg-success-600 hover:bg-success-700 text-white"
                >
                  {isQualified ? "Mark as Unqualified" : "Confirm Qualified"}
                </Button>
              </div>
            </div>
          </div>

          {/* Owner Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Owner Notes
            </h3>
            <textarea
              defaultValue="Follow up with pricing proposal next week."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
            <Button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white">
              Save Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
