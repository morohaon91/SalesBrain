"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface LeadDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  status: string;
  qualificationScore: number;
  budget?: string;
  timeline?: string;
  conversationsCount: number;
  firstContactAt?: string;
  ownerViewed: boolean;
  ownerNotes?: string;
  conversations?: Array<{ id: string; createdAt: string; summary?: string }>;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => api.leads.get(leadId),
    enabled: !!leadId,
  });

  const lead = (data as any)?.data as LeadDetail | undefined;

  // Initialize local state once data loads
  if (lead && notes === undefined) setNotes(lead.ownerNotes ?? "");
  if (lead && status === undefined) setStatus(lead.status);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.leads.update(leadId, { ownerNotes: notes, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lead", leadId] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
        <p className="text-danger-900">Failed to load lead details.</p>
      </div>
    );
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{lead.name}</h1>
            {lead.company && (
              <p className="text-gray-600 text-sm sm:text-base mt-1 break-words">{lead.company}</p>
            )}
          </div>
        </div>

        {lead.email && (
          <a href={`mailto:${lead.email}`}>
            <Button variant="outline" className="text-sm whitespace-nowrap">Send Email</Button>
          </a>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-4">
              {lead.email && (
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Email</p>
                    <p className="text-sm text-gray-900">{lead.email}</p>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Phone</p>
                    <p className="text-sm text-gray-900">{lead.phone}</p>
                  </div>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-4">
                  <Building className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Company</p>
                    <p className="text-sm text-gray-900">{lead.company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deal Information */}
          {(lead.budget || lead.timeline || lead.industry || lead.firstContactAt) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Deal Information</h2>
              <div className="grid grid-cols-2 gap-6">
                {lead.budget && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Budget
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{lead.budget}</p>
                  </div>
                )}
                {lead.timeline && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Timeline
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{lead.timeline}</p>
                  </div>
                )}
                {lead.industry && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Industry</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.industry}</p>
                  </div>
                )}
                {lead.firstContactAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">First Contact</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(lead.firstContactAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conversation History */}
          {lead.conversations && lead.conversations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                Conversation History
              </h2>
              <div className="space-y-3">
                {lead.conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/conversations/${conv.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm">
                      {conv.summary || "Conversation"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Qualification Score */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualification Score</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Score</span>
                  <span className="text-3xl font-bold text-primary-600">{lead.qualificationScore}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600"
                    style={{ width: `${lead.qualificationScore}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800">
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="UNQUALIFIED">Unqualified</option>
            </select>
          </div>

          {/* Owner Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Notes</h3>
            <textarea
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
            <Button
              className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
