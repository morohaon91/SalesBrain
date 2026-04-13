'use client';

import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/lib/api/auth-fetch';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Eye, Loader2 } from 'lucide-react';
import PatternDemonstrated from './PatternDemonstrated';
import ProfileProgressAnimation from './ProfileProgressAnimation';
import ValidationModal from './ValidationModal';

interface SimulationSummaryProps {
  simulationId: string;
  demonstratedPatterns: string[];
  liveScore: number;
  previousCompletion: number;
  currentCompletion: number;
  suggestedNextScenario?: string | null;
}

export default function SimulationSummary({
  simulationId,
  demonstratedPatterns,
  liveScore,
  previousCompletion,
  currentCompletion,
  suggestedNextScenario,
}: SimulationSummaryProps) {
  const router = useRouter();
  const [showValidation, setShowValidation] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'extracting' | 'ready' | 'failed'>('extracting');
  const [extractedPatterns, setExtractedPatterns] = useState<Record<string, unknown> | null>(null);

  const pollStatus = useCallback(async () => {
    try {
      const res = await authFetch(`/api/v1/simulations/${simulationId}/validation-status`);
      const data = await res.json();
      const s = data.status;
      setExtractionStatus(
        s === 'ready' || s === 'approved' ? 'ready' : s === 'failed' ? 'failed' : 'extracting'
      );
      if (data.extractedPatterns) setExtractedPatterns(data.extractedPatterns);
    } catch {
      // ignore poll errors
    }
  }, [simulationId]);

  useEffect(() => {
    if (extractionStatus === 'ready' || extractionStatus === 'failed') return;
    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [pollStatus, extractionStatus]);

  const handleContinue = () => {
    router.push(
      suggestedNextScenario
        ? `/simulations/new?scenario=${suggestedNextScenario}`
        : '/simulations/new'
    );
  };

  const handleReview = () => {
    if (extractionStatus === 'extracting') return;
    setShowValidation(true);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-3">
            <Sparkles className="h-8 w-8" />
            <Sparkles className="h-6 w-6" />
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Great job!</h1>
          <p className="text-gray-600 mt-2">Simulation complete. Your AI is learning from this conversation.</p>
        </div>

        {/* Profile Progress */}
        <Card className="p-6">
          <ProfileProgressAnimation
            previousPercentage={previousCompletion}
            currentPercentage={currentCompletion}
          />
        </Card>

        {/* Patterns Demonstrated */}
        {demonstratedPatterns.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">You demonstrated:</h2>
            <PatternDemonstrated patterns={demonstratedPatterns} />
          </Card>
        )}

        {/* Extraction Status */}
        <div className="flex items-center gap-3 text-sm">
          {extractionStatus === 'extracting' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-gray-600">Extracting patterns from your conversation...</span>
            </>
          )}
          {extractionStatus === 'ready' && (
            <span className="text-green-600 font-medium">Patterns extracted and ready for review</span>
          )}
          {extractionStatus === 'failed' && (
            <span className="text-red-600">Extraction failed — patterns will be saved on next simulation</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleContinue} className="flex-1 inline-flex items-center justify-center gap-2" size="lg">
            <span>Continue to Next Simulation</span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </Button>
          <Button
            variant="outline"
            onClick={handleReview}
            disabled={extractionStatus === 'extracting'}
            className="flex-1 inline-flex items-center justify-center gap-2"
            size="lg"
          >
            <Eye className="h-5 w-5 shrink-0" aria-hidden />
            <span>Review What We Learned</span>
          </Button>
        </div>
      </div>

      {showValidation && (
        <ValidationModal
          simulationId={simulationId}
          extractedPatterns={extractedPatterns}
          onClose={() => setShowValidation(false)}
          onValidated={() => {
            setShowValidation(false);
            handleContinue();
          }}
        />
      )}
    </>
  );
}
