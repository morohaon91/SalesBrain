'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScenarioSelection, { ScenarioSuggestionPayload } from '@/components/simulation/ScenarioSelection';
import { ScenarioCardData } from '@/components/simulation/ScenarioCard';
import { authFetch } from '@/lib/api/auth-fetch';
import { Loader2, AlertCircle } from 'lucide-react';

export default function NewSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scenarios, setScenarios] = useState<ScenarioCardData[]>([]);
  const [suggestion, setSuggestion] = useState<ScenarioSuggestionPayload | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await authFetch('/api/v1/simulations/scenarios');
      if (!response.ok) throw new Error('Failed to load scenarios');
      const data = await response.json();
      setScenarios(data.scenarios ?? []);
      setSuggestion(data.suggestion ?? null);
      setCompletedScenarios(data.completedScenarios ?? []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
      setLoading(false);
    }
  };

  const handleStartSimulation = async (scenarioId: string) => {
    setStarting(true);
    setError(null);
    try {
      const response = await authFetch('/api/v1/simulations/start', {
        method: 'POST',
        body: JSON.stringify({ scenarioId }),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error?.message || 'Failed to start simulation');
      }
      const data = await response.json();
      router.push(`/simulations/${data.data?.simulationId ?? data.simulationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start simulation');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Choose a Practice Scenario</h1>
        <p className="mt-2 text-gray-600">
          Each simulation trains your AI on different aspects of client interactions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {starting && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
          <p className="text-blue-800">Generating your client persona and starting simulation...</p>
        </div>
      )}

      {scenarios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No scenarios available for your industry. Please complete your business profile first.
          </p>
        </div>
      ) : (
        <ScenarioSelection
          scenarios={scenarios}
          suggestion={suggestion}
          completedScenarios={completedScenarios}
          onSelect={handleStartSimulation}
        />
      )}
    </div>
  );
}
