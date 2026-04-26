'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScenarioSelection, { ScenarioSuggestionPayload } from '@/components/simulation/ScenarioSelection';
import { ScenarioCardData } from '@/components/simulation/ScenarioCard';
import { authFetch } from '@/lib/api/auth-fetch';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  gold: 'hsl(38,84%,61%)',
};

export default function NewSimulationPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioCardData[]>([]);
  const [suggestion, setSuggestion] = useState<ScenarioSuggestionPayload | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadScenarios(); }, []);

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
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.gold }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant', Georgia, serif", fontSize: '28px', color: C.fg }}>
          Choose a Practice Scenario
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>
          Each simulation trains your AI on different aspects of client interactions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#fb7185' }} />
          <p className="text-sm" style={{ color: '#fb7185' }}>{error}</p>
        </div>
      )}

      {starting && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(200,136,26,0.08)', border: '1px solid rgba(200,136,26,0.2)' }}>
          <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" style={{ color: C.gold }} />
          <p className="text-sm" style={{ color: C.gold }}>Generating your client persona and starting simulation...</p>
        </div>
      )}

      {scenarios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: C.muted }}>
            No scenarios available for your industry. Please complete your business profile first.
          </p>
        </div>
      ) : completedScenarios.length === 0 ? (
        <FirstTimeView
          firstScenario={scenarios.find((s) => s.id === 'hot_lead_universal') ?? scenarios[0]}
          onStart={handleStartSimulation}
        />
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

function FirstTimeView({ firstScenario, onStart }: { firstScenario: ScenarioCardData | undefined; onStart: (id: string) => void }) {
  if (!firstScenario) return null;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl p-8 space-y-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.fg }}>Start your first training session</h2>
          <p className="text-sm mt-1" style={{ color: C.muted }}>
            This takes about {firstScenario.estimatedDuration} minutes. Your AI learns from how you
            respond to a real prospect scenario.
          </p>
        </div>

        <div className="rounded-xl p-6 space-y-4" style={{ background: 'rgba(200,136,26,0.06)', border: '1px solid rgba(200,136,26,0.2)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                  Beginner
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(200,136,26,0.12)', color: C.gold }}>
                  Required
                </span>
              </div>
              <h3 className="text-lg font-semibold" style={{ color: C.fg }}>{firstScenario.name}</h3>
              <p className="text-sm mt-1" style={{ color: C.muted }}>{firstScenario.description}</p>
            </div>
            <div className="flex items-center gap-1 text-sm flex-shrink-0" style={{ color: C.muted }}>
              <Clock className="h-4 w-4" />
              <span>~{firstScenario.estimatedDuration} min</span>
            </div>
          </div>

          <Button onClick={() => onStart(firstScenario.id)} className="w-full text-base py-5">
            Start Your First Simulation →
          </Button>
        </div>

        <p className="text-sm text-center" style={{ color: C.muted }}>
          You'll unlock all 8 training scenarios after your first session.
        </p>
      </div>
    </div>
  );
}
