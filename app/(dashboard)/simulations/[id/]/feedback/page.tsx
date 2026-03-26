'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import instance from '@/lib/api/client';

interface SimulationFeedback {
  simulationId: string;
  scenarioType: string;
  qualityScore: number;
  completenessScore: number;
  recommendation: string;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  extractionStatus: 'success' | 'blocked' | 'pending';
  extractionMessage?: string;
}

export default function SimulationFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id as string;

  const [feedback, setFeedback] = useState<SimulationFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [simulationId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/simulations/${simulationId}`);
      const simulation = response.data.data;

      // Extract feedback from simulation data
      const feedbackData: SimulationFeedback = {
        simulationId: simulation.id,
        scenarioType: simulation.scenarioType,
        qualityScore: simulation.qualityScore || 0,
        completenessScore: simulation.qualityScore || 0,
        recommendation: simulation.qualityScore >= 60 ? 'Ready for Pattern Extraction' : 'Continue Improving',
        feedback: {
          strengths: [],
          weaknesses: [],
          suggestions: []
        },
        extractionStatus: simulation.extractedPatterns ? 'success' : 'pending',
        extractionMessage: simulation.extractedPatterns
          ? 'Patterns extracted and ready for validation'
          : 'Simulation quality too low for pattern extraction'
      };

      setFeedback(feedbackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error || 'Failed to load feedback'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceColor = feedback.qualityScore >= 80
    ? 'text-green-600'
    : feedback.qualityScore >= 60
    ? 'text-blue-600'
    : 'text-orange-600';

  const recommendationColor = feedback.qualityScore >= 60
    ? 'bg-green-50 border-green-200'
    : 'bg-orange-50 border-orange-200';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Simulation Complete! 🎉</h1>
        <p className="text-gray-600">
          Here's how you performed in this <Badge variant="outline">{feedback.scenarioType}</Badge> scenario
        </p>
      </div>

      {/* Performance Score */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-center">Your Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className={`text-6xl font-bold ${performanceColor}`}>
            {feedback.qualityScore}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                feedback.qualityScore >= 80
                  ? 'bg-green-600'
                  : feedback.qualityScore >= 60
                  ? 'bg-blue-600'
                  : 'bg-orange-600'
              }`}
              style={{ width: `${feedback.qualityScore}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {feedback.qualityScore >= 80 && '🌟 Outstanding performance!'}
            {feedback.qualityScore >= 60 && feedback.qualityScore < 80 && '✨ Great job! Keep practicing.'}
            {feedback.qualityScore < 60 && '📈 Keep improving to unlock pattern extraction.'}
          </p>
        </CardContent>
      </Card>

      {/* Extraction Status */}
      <Card className={recommendationColor}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {feedback.extractionStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Patterns Extracted
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Extraction Pending
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {feedback.extractionStatus === 'success'
              ? 'Your patterns have been extracted and are ready for review. Go to your profile to validate them.'
              : 'Your simulation quality is below the threshold for pattern extraction. Continue practicing to improve.'}
          </p>
        </CardContent>
      </Card>

      {/* Strengths */}
      {feedback.feedback.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              What You Did Well
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedback.feedback.strengths.length > 0 ? (
              feedback.feedback.strengths.map((strength, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Keep practicing to unlock detailed feedback</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Areas to Improve */}
      {feedback.feedback.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedback.feedback.weaknesses.map((weakness, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-orange-600 flex-shrink-0">⚠</span>
                <span className="text-gray-700">{weakness}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {feedback.feedback.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Tips for Next Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedback.feedback.suggestions.map((suggestion, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-blue-600 flex-shrink-0">💡</span>
                <span className="text-gray-700">{suggestion}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <div className="flex gap-3 justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => router.push('/simulations')}
        >
          View All Simulations
        </Button>
        {feedback.extractionStatus === 'success' && (
          <Button
            onClick={() => router.push('/profile/validate')}
            className="bg-green-600 hover:bg-green-700"
          >
            Review Patterns <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {feedback.extractionStatus !== 'success' && (
          <Button
            onClick={() => router.push('/simulations/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Another Simulation <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
