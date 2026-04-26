"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, Phone, Building, DollarSign, Calendar,
  MessageSquare, Loader2, AlertCircle,
} from "lucide-react";
import Link from "next/link";

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  muted2: 'hsl(228,12%,55%)',
  gold: 'hsl(38,84%,61%)',
};

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

const cardStyle = { background: C.card, border: `1px solid ${C.border}` };

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '14px',
  background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
  color: C.fg, outline: 'none', colorScheme: 'dark' as const,
};

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
  if (lead && notes === undefined) setNotes(lead.ownerNotes ?? "");
  if (lead && status === undefined) setStatus(lead.status);

  const saveMutation = useMutation({
    mutationFn: () => api.leads.update(leadId, { ownerNotes: notes, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lead", leadId] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.muted }} />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="rounded-xl p-4 flex gap-3"
        style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#fb7185' }} />
        <p className="text-sm" style={{ color: '#fb7185' }}>Failed to load lead details.</p>
      </div>
    );
  }

  const scoreColor = lead.qualificationScore >= 70 ? '#fb923c' : lead.qualificationScore >= 45 ? C.gold : C.muted2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-2 -ms-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: C.muted }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold break-words" style={{ fontFamily: "'Cormorant', Georgia, serif", color: C.fg }}>
              {lead.name}
            </h1>
            {lead.company && (
              <p className="text-sm mt-1 break-words" style={{ color: C.muted }}>{lead.company}</p>
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
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-base font-semibold mb-5" style={{ color: C.fg }}>Contact Information</h2>
            <div className="space-y-4">
              {lead.email && (
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: C.gold }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: C.muted }}>Email</p>
                    <p className="text-sm" style={{ color: C.fg }}>{lead.email}</p>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: C.gold }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: C.muted }}>Phone</p>
                    <p className="text-sm" style={{ color: C.fg }}>{lead.phone}</p>
                  </div>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-4">
                  <Building className="w-5 h-5 flex-shrink-0" style={{ color: C.gold }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: C.muted }}>Company</p>
                    <p className="text-sm" style={{ color: C.fg }}>{lead.company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deal Info */}
          {(lead.budget || lead.timeline || lead.industry || lead.firstContactAt) && (
            <div className="rounded-xl p-6" style={cardStyle}>
              <h2 className="text-base font-semibold mb-5" style={{ color: C.fg }}>Deal Information</h2>
              <div className="grid grid-cols-2 gap-5">
                {lead.budget && (
                  <div>
                    <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: C.muted }}>
                      <DollarSign className="w-3.5 h-3.5" /> Budget
                    </p>
                    <p className="text-sm font-semibold" style={{ color: C.fg }}>{lead.budget}</p>
                  </div>
                )}
                {lead.timeline && (
                  <div>
                    <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: C.muted }}>
                      <Calendar className="w-3.5 h-3.5" /> Timeline
                    </p>
                    <p className="text-sm font-semibold" style={{ color: C.fg }}>{lead.timeline}</p>
                  </div>
                )}
                {lead.industry && (
                  <div>
                    <p className="text-xs font-medium mb-1.5" style={{ color: C.muted }}>Industry</p>
                    <p className="text-sm font-semibold" style={{ color: C.fg }}>{lead.industry}</p>
                  </div>
                )}
                {lead.firstContactAt && (
                  <div>
                    <p className="text-xs font-medium mb-1.5" style={{ color: C.muted }}>First Contact</p>
                    <p className="text-sm font-semibold" style={{ color: C.fg }}>
                      {new Date(lead.firstContactAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conversations */}
          {lead.conversations && lead.conversations.length > 0 && (
            <div className="rounded-xl p-6" style={cardStyle}>
              <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: C.fg }}>
                <MessageSquare className="w-5 h-5" style={{ color: C.gold }} />
                Conversation History
              </h2>
              <div className="space-y-2">
                {lead.conversations.map((conv) => (
                  <Link key={conv.id} href={`/conversations/${conv.id}`}>
                    <div className="p-3 rounded-xl transition-all duration-150 cursor-pointer"
                      style={{ border: `1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                      <p className="font-medium text-sm" style={{ color: C.fg }}>{conv.summary || "Conversation"}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Score */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
              Qualification Score
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: C.muted }}>Score</span>
                <span className="text-3xl font-bold tabular-nums" style={{ color: scoreColor, fontFamily: "'Cormorant', Georgia, serif" }}>
                  {lead.qualificationScore}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full" style={{ width: `${lead.qualificationScore}%`, background: scoreColor }} />
              </div>
              <div className="pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(200,136,26,0.12)', color: C.gold }}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.muted }}>Status</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="UNQUALIFIED">Unqualified</option>
            </select>
          </div>

          {/* Notes */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.muted }}>Owner Notes</h3>
            <textarea
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <Button
              className="w-full mt-3"
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
