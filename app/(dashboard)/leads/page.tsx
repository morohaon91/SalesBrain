'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  TrendingUp,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

// Type definition
interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: string;
  qualificationScore: number;
  conversationsCount: number;
  firstContactAt?: string;
  ownerViewed: boolean;
  budget?: string;
  timeline?: string;
  ownerNotes?: string;
}

// Fallback mock data
const mockLeads: Lead[] = [
  {
    id: "lead-001",
    name: "Sarah Johnson",
    email: "sarah@startup.com",
    company: "TechStart Inc",
    phone: "+1-555-0123",
    status: "NEW",
    qualificationScore: 85,
    budget: "$10k-25k",
    timeline: "3-6 months",
    conversationsCount: 1,
    firstContactAt: "2026-03-17T09:15:00Z",
    ownerViewed: true,
    ownerNotes: "High potential, follow up this week",
  },
  {
    id: "lead-002",
    name: "Michael Chen",
    email: "michael@techco.com",
    company: "Tech Solutions Corp",
    phone: "+1-555-0456",
    status: "CONTACTED",
    qualificationScore: 72,
    budget: "$5k-15k",
    timeline: "1-3 months",
    conversationsCount: 2,
    firstContactAt: "2026-03-16T14:30:00Z",
    ownerViewed: true,
    ownerNotes: "Budget conscious but interested",
  },
  {
    id: "lead-003",
    name: "Emma Davis",
    email: "emma@consultancy.io",
    company: "Consultancy Partners",
    phone: "+1-555-0789",
    status: "QUALIFIED",
    qualificationScore: 45,
    budget: "$25k+",
    timeline: "6-12 months",
    conversationsCount: 1,
    firstContactAt: "2026-03-16T10:00:00Z",
    ownerViewed: false,
    ownerNotes: "",
  },
];

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: "NEW" | "CONTACTED" | "QUALIFIED" }) {
  const styles = {
    NEW: "bg-primary-100 text-primary-800",
    CONTACTED: "bg-warning-100 text-warning-800",
    QUALIFIED: "bg-success-100 text-success-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

/**
 * Score indicator component
 */
function ScoreIndicator({ score }: { score: number }) {
  let color = "text-danger-600";
  if (score >= 70) color = "text-success-600";
  else if (score >= 50) color = "text-warning-600";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            score >= 70 ? "bg-success-500" : score >= 50 ? "bg-warning-500" : "bg-danger-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${color}`}>{score}</span>
    </div>
  );
}

/**
 * Leads page component
 */
export default function LeadsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('score');

  // Fetch leads from API
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['leads', filterStatus],
    queryFn: () =>
      api.leads.list({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      }),
    enabled: !!user,
  });

  const leads = (response?.data as Lead[]) || [];

  // Filter and sort leads
  let filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort leads
  if (sortBy === 'score') {
    filteredLeads.sort((a, b) => b.qualificationScore - a.qualificationScore);
  } else if (sortBy === 'date') {
    filteredLeads.sort(
      (a, b) =>
        new Date(b.firstContactAt || 0).getTime() -
        new Date(a.firstContactAt || 0).getTime()
    );
  } else if (sortBy === 'name') {
    filteredLeads.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">
          Qualified leads from conversations
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">Failed to load leads</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error ? error.message : 'Please try again'}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Total Leads</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{leads.length}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">New</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-primary-600 mt-2">
              {leads.filter((l) => l.status === 'NEW').length}
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Contacted</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-warning-600 mt-2">
              {leads.filter((l) => l.status === 'CONTACTED').length}
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Avg Score</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-success-600 mt-2">
              {leads.length > 0
                ? Math.round(
                    leads.reduce((acc, l) => acc + l.qualificationScore, 0) /
                      leads.length
                  )
                : 0}
            </p>
          )}
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="score">Highest Score</option>
            <option value="date">Latest</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No leads found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || filterStatus !== "ALL"
                ? "Try adjusting your filters"
                : "Start conversations to generate leads"}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top Row - Name & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {lead.name}
                      </h3>
                      <StatusBadge status={lead.status as any} />
                    </div>

                    {/* Company & Email */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {lead.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </span>
                      )}
                    </div>

                    {/* Budget & Timeline */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <span className="font-medium">{lead.budget}</span>
                      <span className="font-medium">{lead.timeline}</span>
                    </div>

                    {/* Owner Notes */}
                    {lead.ownerNotes && (
                      <div className="bg-primary-50 border border-primary-200 rounded px-2 py-1 text-xs text-primary-900 mb-2">
                        {lead.ownerNotes}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.conversationsCount} conversation
                        {lead.conversationsCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.firstContactAt).toLocaleDateString()}
                      </span>
                      {!lead.ownerViewed && (
                        <span className="px-2 py-0.5 bg-warning-100 text-warning-800 rounded-full font-medium">
                          Needs Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score & Arrow */}
                  <div className="flex flex-col items-end gap-3">
                    <ScoreIndicator score={lead.qualificationScore} />
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination (Placeholder) */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page 1 of 1</span>
          <Button variant="outline" disabled>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
