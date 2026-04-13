"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/hooks/useI18n";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/shared/message-bubble";
import { ScoringBreakdown } from "@/components/conversation/scoring-breakdown";
import { CloserProgressIndicator } from "@/components/closer/closer-progress-indicator";
import { ObjectionsSummary } from "@/components/closer/objections-summary";
import { ArrowLeft, Flag, Loader2, AlertCircle } from "lucide-react";
import { CloserProgress } from "@/lib/ai/closer-conversation";

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
  scoringBreakdown?: any;
  closerProgress?: CloserProgress;
  objectionsRaised?: string[];
  objectionsHandled?: Record<string, any>;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  }>;
};

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n(["conversations", "common"]);
  const conversationId = params.id as string;
  const [isQualified, setIsQualified] = useState(false);
  const [ownerMessage, setOwnerMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: conversation,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.conversations.get(conversationId) as Promise<ConversationDetail>,
    enabled: !!conversationId,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const statusLabel = (raw: string) =>
    t(`conversations:conversationStatus.${raw}`, { defaultValue: raw });

  const qualificationLabel = (status: string) =>
    t(`conversations:qualification.${status}`, { defaultValue: status });

  const handleTakeover = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/conversations/${conversationId}/takeover`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to take over");
      await refetch();
      setOwnerMessage("");
    } catch (err) {
      console.error("Takeover error:", err);
      alert(t("conversations:alerts.takeoverFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!ownerMessage.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/conversations/${conversationId}/owner-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: ownerMessage }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setOwnerMessage("");
      await refetch();
    } catch (err) {
      console.error("Send message error:", err);
      alert(t("conversations:alerts.sendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isQueryLoading || (!conversation && !error)) {
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
          className="p-2 -ms-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("conversations:detail.back")}
        </button>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">{t("conversations:detail.loadError")}</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error
                ? error.message
                : t("conversations:detail.loadErrorHint")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ms-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
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
            <span className="hidden sm:inline">{t("conversations:actions.flag")}</span>
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white text-sm whitespace-nowrap">
            <span className="hidden sm:inline">{t("conversations:actions.addCrm")}</span>
            <span className="sm:hidden">{t("conversations:actions.addCrmShort")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-600">{t("conversations:detail.status")}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                  {statusLabel(conversation.status)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">{t("conversations:detail.duration")}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {Math.round(conversation.duration / 60)} {t("common:units.min")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">{t("conversations:detail.messages")}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{conversation.messageCount}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {t("conversations:detail.summary")}
              </h3>
              <p className="text-sm text-gray-600">{conversation.summary}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("conversations:detail.conversation")}
            </h3>

            {conversation.messages.length === 0 ? (
              <p className="text-sm text-gray-500">{t("conversations:detail.noMessages")}</p>
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

        <div className="space-y-6">
          {conversation.closerProgress && (
            <CloserProgressIndicator progress={conversation.closerProgress} />
          )}

          {conversation.objectionsRaised &&
            conversation.objectionsRaised.length > 0 &&
            conversation.objectionsHandled && (
              <ObjectionsSummary
                objectionsRaised={conversation.objectionsRaised}
                objectionsHandled={conversation.objectionsHandled}
              />
            )}

          {conversation.scoringBreakdown && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("conversations:detail.scoringDetails")}
              </h3>
              <ScoringBreakdown breakdown={conversation.scoringBreakdown} />
            </div>
          )}

          {!conversation.scoringBreakdown && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("conversations:detail.leadScore")}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {t("conversations:detail.overall")}
                    </span>
                    <span className="text-2xl font-bold text-primary-600">{conversation.leadScore}</span>
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
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("conversations:detail.qualification")}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {t("conversations:detail.status")}
                </p>
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
                  {isQualified
                    ? t("conversations:detail.markUnqualified")
                    : t("conversations:detail.confirmQualified")}
                </Button>
              </div>
            </div>
          </div>

          {conversation.status === "ACTIVE" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("conversations:detail.takeOverTitle")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{t("conversations:detail.takeOverBody")}</p>
              <Button
                onClick={handleTakeover}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading
                  ? t("conversations:detail.takeOverLoading")
                  : t("conversations:detail.takeOverBtn")}
              </Button>
            </div>
          )}

          {conversation.status === "MANUAL" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("conversations:detail.inControlTitle")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{t("conversations:detail.inControlBody")}</p>
              <textarea
                value={ownerMessage}
                onChange={(e) => setOwnerMessage(e.target.value)}
                placeholder={t("conversations:detail.messagePlaceholder")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !ownerMessage.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? t("conversations:detail.sending") : t("conversations:detail.sendMessage")}
              </Button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("conversations:detail.ownerNotes")}
            </h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder={t("conversations:detail.notesPlaceholder")}
            />
            <Button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white">
              {t("conversations:detail.saveNotes")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
