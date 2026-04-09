"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/shared/message-bubble";
import { ArrowLeft, Flag, Loader2, AlertCircle } from "lucide-react";

type ConversationDetail = {
  id: string;
  leadName: string;
  leadEmail: string;
  status: string;
  qualificationStatus: string;
  leadScore: number;
  messageCount: number;
  duration: number;
  createdAt: string;
  summary: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  }>;
};

function qualificationLabel(status: string): string {
  switch (status) {
    case "QUALIFIED":
      return "Qualified";
    case "UNQUALIFIED":
      return "Unqualified";
    case "MAYBE":
      return "Maybe";
    default:
      return "Unknown";
  }
}

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const [isQualified, setIsQualified] = useState(false);

  const {
    data: conversation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.conversations.get(conversationId) as Promise<ConversationDetail>,
    enabled: !!conversationId,
    staleTime: 0,
    refetchOnMount: "always",
  });

  if (isLoading || (!conversation && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">Could not load conversation</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error ? error.message : "It may have been removed or you may not have access."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
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

            {conversation.messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages in this thread yet.</p>
            ) : (
              conversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.createdAt}
                />
              ))
            )}
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
                    style={{ width: `${Math.min(100, Math.max(0, conversation.leadScore))}%` }}
                  />
                </div>
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  {qualificationLabel(conversation.qualificationStatus)}
                </span>
              </div>

              <div className="pt-3">
                <Button
                  type="button"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Add notes for your team…"
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
