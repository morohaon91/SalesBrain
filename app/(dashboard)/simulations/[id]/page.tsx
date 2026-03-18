'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { SimulationChat } from '@/components/simulations/simulation-chat';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function SimulationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id as string;
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Fetch simulation data
  const {
    data: simulationResponse,
    isLoading: isSimulationLoading,
    error: simulationError,
  } = useQuery({
    queryKey: ['simulations', simulationId],
    queryFn: () => api.simulations.get(simulationId),
  });

  const simulation = simulationResponse?.data as any;

  // Complete simulation mutation
  const completeSimulation = useMutation({
    mutationFn: () => api.simulations.complete(simulationId),
    onSuccess: () => {
      router.push('/simulations');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to complete simulation';
      setCompleteError(message);
    },
  });

  if (isSimulationLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (simulationError || !simulation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Simulation Error</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-danger-600" />
          <p className="text-lg font-medium text-gray-900">
            Failed to load simulation
          </p>
          <p className="text-gray-600 max-w-md">
            {simulationError instanceof Error
              ? simulationError.message
              : 'The simulation could not be loaded. Please try again.'}
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
              {simulation.scenarioType.replace(/_/g, ' ')} Simulation
            </h1>
            <p className="text-gray-600 mt-1">
              {simulation.status === 'IN_PROGRESS'
                ? 'Practice conversation with AI client'
                : 'Simulation Completed'}
            </p>
          </div>
        </div>

        {simulation.status === 'IN_PROGRESS' && (
          <Button
            onClick={() => completeSimulation.mutate()}
            disabled={completeSimulation.isPending}
            variant="outline"
            className="text-danger-600 border-danger-300 hover:bg-danger-50"
          >
            {completeSimulation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Simulation'
            )}
          </Button>
        )}
      </div>

      {/* Error message */}
      {completeError && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger-700">{completeError}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 h-[600px]">
          <SimulationChat simulationId={simulationId} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Info
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                    simulation.status === 'IN_PROGRESS'
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-success-100 text-success-800'
                  }`}
                >
                  {simulation.status === 'IN_PROGRESS'
                    ? 'In Progress'
                    : 'Completed'}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Messages Exchanged</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {simulation.messages?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {simulation.duration
                    ? `${Math.round(simulation.duration / 60)} minutes`
                    : 'Just started'}
                </p>
              </div>

              {simulation.qualityScore && (
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Quality Score
                  </p>
                  <p className="text-2xl font-bold text-success-600 mt-1">
                    {simulation.qualityScore}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scenario Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Client Profile
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600">Type</p>
                <p className="text-sm text-gray-900 mt-1">
                  {simulation.aiPersona?.clientType || 'Client'}
                </p>
              </div>

              {simulation.aiPersona?.personality && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Personality</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {simulation.aiPersona.personality}
                  </p>
                </div>
              )}

              {simulation.aiPersona?.painPoints && simulation.aiPersona.painPoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Pain Points
                  </p>
                  <ul className="space-y-1">
                    {simulation.aiPersona.painPoints.map(
                      (point: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-gray-400 rounded-full" />
                          {point}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-2">💡 Pro Tip</h4>
            <p className="text-xs text-primary-700">
              {simulation.status === 'IN_PROGRESS'
                ? 'Continue the conversation to understand the client\'s deeper needs and test different approaches.'
                : 'Review how you handled this scenario. Consider doing another simulation to practice different strategies.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
