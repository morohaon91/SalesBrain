'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { authFetch } from '@/lib/api/auth-fetch';
import SimulationSummary from '@/components/simulation/SimulationSummary';
import { Loader2 } from 'lucide-react';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';

export default function SimulationSummaryPage() {
  const params = useParams();
  const simulationId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [simulationId]);

  const loadData = async () => {
    try {
      const [simRes, profileRes] = await Promise.all([
        authFetch(`/api/v1/simulations/${simulationId}`),
        authFetch('/api/v1/profile'),
      ]);

      if (!simRes.ok) throw new Error('Failed to load simulation');

      const simData = await simRes.json();
      const profileData = profileRes.ok ? await profileRes.json() : null;

      const sim = simData.data ?? simData;
      const profile = profileData?.data ?? profileData;

      // Calculate completion live from profile data (more accurate than stale DB value)
      const liveCompletion = profile
        ? calculateProfileCompletion(profile).total
        : 0;

      // Previous = stored DB value before this simulation's extraction ran
      // If DB value is 0 (never updated), use liveCompletion as both (no animation)
      const storedCompletion = profile?.completionPercentage ?? 0;
      const previousCompletion = storedCompletion > 0
        ? Math.max(0, storedCompletion - 5)
        : Math.max(0, liveCompletion - 5);

      setData({
        simulation: sim,
        currentCompletion: Math.max(liveCompletion, storedCompletion),
        previousCompletion,
        suggestedNextScenario: profile?.suggestedNextScenario ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center text-red-600 py-12">{error ?? 'Could not load summary'}</div>;
  }

  return (
    <div className="py-12 px-4">
      <SimulationSummary
        simulationId={simulationId}
        demonstratedPatterns={data.simulation?.demonstratedPatterns ?? []}
        liveScore={data.simulation?.liveScore ?? 0}
        previousCompletion={data.previousCompletion}
        currentCompletion={data.currentCompletion}
        suggestedNextScenario={data.suggestedNextScenario}
      />
    </div>
  );
}
