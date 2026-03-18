"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "@/components/shared/message-bubble";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

export default function SimulationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id as string;
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock simulation data
  const simulation = {
    id: simulationId,
    scenarioType: "PRICE_SENSITIVE",
    status: "IN_PROGRESS",
    aiPersona: {
      clientType: "Price-conscious decision maker",
      personality: "Negotiation-focused, budget-constrained",
    },
    duration: 450,
    messageCount: 8,
    qualityScore: null,
    messages: [
      {
        id: "1",
        role: "assistant",
        content:
          "Hi there! I'm looking for a lead qualification solution. What are your prices?",
        createdAt: new Date(Date.now() - 5 * 60000),
      },
      {
        id: "2",
        role: "user",
        content:
          "Welcome! Great question. We offer flexible pricing starting at $299/month. What's your monthly lead volume?",
        createdAt: new Date(Date.now() - 4 * 60000),
      },
      {
        id: "3",
        role: "assistant",
        content: "We get about 500 leads per month. That seems expensive. Do you offer discounts?",
        createdAt: new Date(Date.now() - 3 * 60000),
      },
      {
        id: "4",
        role: "user",
        content:
          "Absolutely! For 500 leads, we can offer 20% off our enterprise plan at $4,000/month, which works out to $8 per lead.",
        createdAt: new Date(Date.now() - 2 * 60000),
      },
      {
        id: "5",
        role: "assistant",
        content: "Still higher than your competitors. What about annual pricing?",
        createdAt: new Date(Date.now() - 60000),
      },
      {
        id: "6",
        role: "user",
        content:
          "Great point! Annual billing gets you another 15% off, bringing it to $3,400/month. Plus, you get priority support and custom integrations included.",
        createdAt: new Date(),
      },
    ],
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage("");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {simulation.scenarioType.replace("_", " ")} Simulation
            </h1>
            <p className="text-gray-600 mt-1">
              {simulation.status === "IN_PROGRESS"
                ? "Chat with AI client"
                : "Simulation Review"}
            </p>
          </div>
        </div>

        {simulation.status === "IN_PROGRESS" && (
          <Button
            variant="outline"
            className="text-danger-600 border-danger-300"
          >
            End Simulation
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-96">
            {/* Scenario Info Header */}
            <div className="bg-primary-50 border-b border-primary-200 p-4">
              <h3 className="font-semibold text-primary-900">
                Scenario: {simulation.scenarioType.replace("_", " ")}
              </h3>
              <p className="text-xs text-primary-700 mt-1">
                {simulation.aiPersona.clientType}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {simulation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role as "user" | "assistant"}
                  content={msg.content}
                  timestamp={msg.createdAt}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            {simulation.status === "IN_PROGRESS" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="border-t border-gray-200 p-4 space-y-2"
              >
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your response..."
                  rows={2}
                  disabled={isLoading}
                  className="text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Info
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 bg-primary-100 text-primary-800">
                  {simulation.status === "IN_PROGRESS"
                    ? "In Progress"
                    : "Completed"}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Messages</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {simulation.messageCount}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Duration</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {Math.round(simulation.duration / 60)} minutes
                </p>
              </div>

              {simulation.qualityScore && (
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Quality Score
                  </p>
                  <p className="text-sm font-semibold text-success-600 mt-1">
                    {simulation.qualityScore}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Feedback
            </h3>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                <p className="font-medium text-success-900">✓ Good negotiation</p>
                <p className="text-xs text-success-700 mt-1">
                  You handled the price objection well
                </p>
              </div>

              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="font-medium text-warning-900">
                  ⚠ Could improve
                </p>
                <p className="text-xs text-warning-700 mt-1">
                  Try emphasizing value earlier in conversation
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-2">💡 Tip</h4>
            <p className="text-xs text-primary-700">
              Continue the conversation to gather more insights about their
              needs and budget constraints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
