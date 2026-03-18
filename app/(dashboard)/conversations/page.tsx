"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Search,
  MessageSquare,
  Filter,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Mock data - replace with API calls
const mockConversations = [
  {
    id: "conv-001",
    leadName: "Sarah Johnson",
    leadEmail: "sarah@startup.com",
    status: "ENDED",
    qualificationStatus: "QUALIFIED",
    leadScore: 85,
    messageCount: 15,
    duration: 480,
    createdAt: "2026-03-17T09:15:00Z",
    summary: "Interested in 3-month consulting package",
  },
  {
    id: "conv-002",
    leadName: "Michael Chen",
    leadEmail: "michael@techco.com",
    status: "ENDED",
    qualificationStatus: "QUALIFIED",
    leadScore: 72,
    messageCount: 12,
    duration: 360,
    createdAt: "2026-03-16T14:30:00Z",
    summary: "Budget constraints but interested in features",
  },
  {
    id: "conv-003",
    leadName: "Emma Davis",
    leadEmail: "emma@consultancy.io",
    status: "ACTIVE",
    qualificationStatus: "MAYBE",
    leadScore: 45,
    messageCount: 8,
    duration: 240,
    createdAt: "2026-03-16T10:00:00Z",
    summary: "Still evaluating options",
  },
  {
    id: "conv-004",
    leadName: "James Wilson",
    leadEmail: "james@corp.com",
    status: "ENDED",
    qualificationStatus: "UNQUALIFIED",
    leadScore: 22,
    messageCount: 5,
    duration: 120,
    createdAt: "2026-03-15T16:45:00Z",
    summary: "Looking for different solution",
  },
];

/**
 * Status badge component
 */
function StatusBadge({
  status,
}: {
  status: "ACTIVE" | "ENDED" | "ABANDONED";
}) {
  const styles = {
    ACTIVE: "bg-success-100 text-success-800",
    ENDED: "bg-primary-100 text-primary-800",
    ABANDONED: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

/**
 * Qualification badge component
 */
function QualificationBadge({
  status,
}: {
  status: "QUALIFIED" | "UNQUALIFIED" | "MAYBE";
}) {
  const styles = {
    QUALIFIED: "bg-success-100 text-success-800 border-success-300",
    UNQUALIFIED: "bg-danger-100 text-danger-800 border-danger-300",
    MAYBE: "bg-warning-100 text-warning-800 border-warning-300",
  };

  const icons = {
    QUALIFIED: <CheckCircle2 className="w-4 h-4" />,
    UNQUALIFIED: <AlertCircle className="w-4 h-4" />,
    MAYBE: <Zap className="w-4 h-4" />,
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </div>
  );
}

/**
 * Conversations page component
 */
export default function ConversationsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterQualification, setFilterQualification] = useState<string>("ALL");

  // Filter conversations
  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.leadEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" || conv.status === filterStatus;

    const matchesQualification =
      filterQualification === "ALL" ||
      conv.qualificationStatus === filterQualification;

    return matchesSearch && matchesStatus && matchesQualification;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-600 mt-1">
          All lead conversations and interactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {mockConversations.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Active</p>
          <p className="text-2xl font-bold text-success-600 mt-2">
            {mockConversations.filter((c) => c.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Qualified</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">
            {mockConversations.filter((c) => c.qualificationStatus === "QUALIFIED").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Avg Score</p>
          <p className="text-2xl font-bold text-accent-600 mt-2">
            {Math.round(
              mockConversations.reduce((acc, c) => acc + c.leadScore, 0) /
                mockConversations.length
            )}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
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
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
            <option value="ABANDONED">Abandoned</option>
          </select>

          {/* Qualification Filter */}
          <select
            value={filterQualification}
            onChange={(e) => setFilterQualification(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Qualifications</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="MAYBE">Maybe</option>
            <option value="UNQUALIFIED">Unqualified</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No conversations found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || filterStatus !== "ALL" || filterQualification !== "ALL"
                ? "Try adjusting your filters"
                : "Start a simulation to create conversations"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conv) => (
              <Link key={conv.id} href={`/conversations/${conv.id}`}>
                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Lead Info */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {conv.leadName}
                        </h3>
                        <div className="flex gap-2">
                          <StatusBadge status={conv.status as any} />
                          <QualificationBadge
                            status={conv.qualificationStatus as any}
                          />
                        </div>
                      </div>

                      {/* Email & Summary */}
                      <p className="text-xs text-gray-500 truncate">
                        {conv.leadEmail}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {conv.summary}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {conv.messageCount} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(conv.duration / 60)} min
                        </span>
                        <span>
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Score & Arrow */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {conv.leadScore}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination (Placeholder) */}
      {filteredConversations.length > 0 && (
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
