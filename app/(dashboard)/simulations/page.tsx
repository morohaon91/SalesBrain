'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Plus,
  Filter,
  Clock,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with API calls
const mockSimulations = [
  {
    id: "sim-001",
    scenarioType: "PRICE_SENSITIVE",
    status: "COMPLETED",
    duration: 1845,
    messageCount: 32,
    qualityScore: 85,
    extractedScore: 85,
    completedAt: "2026-03-15T14:30:00Z",
  },
  {
    id: "sim-002",
    scenarioType: "TIME_CONSTRAINED",
    status: "COMPLETED",
    duration: 1240,
    messageCount: 24,
    qualityScore: 72,
    extractedScore: 72,
    completedAt: "2026-03-14T10:15:00Z",
  },
  {
    id: "sim-003",
    scenarioType: "BUDGET_FOCUSED",
    status: "COMPLETED",
    duration: 2100,
    messageCount: 38,
    qualityScore: 78,
    extractedScore: 78,
    completedAt: "2026-03-13T16:45:00Z",
  },
  {
    id: "sim-004",
    scenarioType: "PRICE_SENSITIVE",
    status: "IN_PROGRESS",
    duration: 450,
    messageCount: 8,
    qualityScore: null,
    extractedScore: null,
    completedAt: null,
  },
];

/**
 * Scenario badge
 */
function ScenarioBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    PRICE_SENSITIVE: "Price Sensitive",
    TIME_CONSTRAINED: "Time Constrained",
    BUDGET_FOCUSED: "Budget Focused",
  };

  return (
    <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
      {labels[type] || type}
    </span>
  );
}

/**
 * Status badge
 */
function StatusBadge({ status }: { status: "COMPLETED" | "IN_PROGRESS" }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === "COMPLETED"
          ? "bg-success-100 text-success-800"
          : "bg-primary-100 text-primary-800"
      }`}
    >
      {status === "COMPLETED" ? "Completed" : "In Progress"}
    </span>
  );
}

/**
 * Simulations page component
 */
export default function SimulationsPage() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Fetch simulations from API
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['simulations', filterStatus],
    queryFn: () =>
      api.simulations.list({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      }),
    enabled: !!user,
  });

  const simulations = (response?.data as any[]) || [];

  // Filter simulations
  const filteredSimulations = simulations.filter((sim) => {
    return filterStatus === 'ALL' || sim.status === filterStatus;
  });

  const completedCount = simulations.filter((s) => s.status === 'COMPLETED').length;
  const totalMessages = simulations.reduce((acc, s) => acc + s.messageCount, 0);
  const avgQuality =
    simulations.filter((s) => s.qualityScore).length > 0
      ? Math.round(
          simulations
            .filter((s) => s.qualityScore)
            .reduce((acc, s) => acc + (s.qualityScore || 0), 0) /
            simulations.filter((s) => s.qualityScore).length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulations</h1>
          <p className="text-gray-600 mt-1">
            Practice conversations to train your AI
          </p>
        </div>
        <Link href="/simulations/new">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Simulation
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-900">Failed to load simulations</p>
            <p className="text-sm text-danger-700 mt-1">
              {error instanceof Error ? error.message : 'Please try again'}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Total</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {simulations.length}
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Completed</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-success-600 mt-2">
              {completedCount}
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Messages</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-primary-600 mt-2">
              {totalMessages}
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600">Avg Quality</p>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-accent-600 mt-2">
              {avgQuality}%
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">All Simulations</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      {/* Simulations List */}
      <div className="space-y-3">
        {filteredSimulations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No simulations found</p>
            <p className="text-sm text-gray-400 mt-1">
              Start your first simulation to train your AI profile
            </p>
            <Link href="/simulations/new" className="mt-4 inline-block">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                Start Simulation
              </Button>
            </Link>
          </div>
        ) : (
          filteredSimulations.map((sim) => (
            <Link
              key={sim.id}
              href={
                sim.status === "COMPLETED"
                  ? `/simulations/${sim.id}`
                  : `/simulations/${sim.id}`
              }
            >
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top Row - Scenario & Status */}
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <ScenarioBadge type={sim.scenarioType} />
                        <StatusBadge status={sim.status as any} />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {Math.round(sim.duration / 60)} min
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        {sim.messageCount} messages
                      </span>
                      {sim.qualityScore !== null && (
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success-600" />
                          <span className="font-semibold text-success-600">
                            {sim.qualityScore}%
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500 mt-2">
                      {sim.completedAt
                        ? `Completed ${new Date(sim.completedAt).toLocaleDateString()}`
                        : "In progress..."}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Getting Started */}
      {mockSimulations.length === 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-primary-900 mb-2">
            How to use Simulations
          </h3>
          <ol className="space-y-2 text-sm text-primary-800">
            <li>
              <strong>1. Start a simulation</strong> - Choose a scenario (price
              sensitive, time constrained, etc.)
            </li>
            <li>
              <strong>2. Chat with AI</strong> - Have a conversation like you
              would with a real client
            </li>
            <li>
              <strong>3. AI learns</strong> - The system analyzes your responses
              to extract business rules
            </li>
            <li>
              <strong>4. Profile builds</strong> - Repeat simulations to improve
              accuracy
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
