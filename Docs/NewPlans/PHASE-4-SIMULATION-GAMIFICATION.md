# PHASE 4: SIMULATION SYSTEM REFACTOR (GAMIFIED)

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 4 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Gamified simulation experience with live feedback, randomized personas, and completion flow  
**Dependencies**: Phase 1 (Database), Phase 2 (Scenarios), Phase 3 (Questionnaire)  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase transforms simulations from basic chat into an engaging, game-like training experience:
- Randomized personas from scenario templates
- Live feedback during simulation ("🎯 Nice! You demonstrated pricing flexibility")
- Real-time quality score (0-100%)
- Hybrid completion triggers (soft cap 10 exchanges, hard cap 15)
- Post-simulation gamified summary
- Profile completion progress visible

---

## 🎮 SIMULATION FLOW

```
User selects scenario → Teaser shown → Start Simulation
    ↓
AI generates random persona (name, age, budget, personality)
    ↓
AI sends opening message
    ↓
Owner responds ← Live feedback appears ("💡 Try asking about timeline")
    ↓
... conversation continues with live score updates ...
    ↓
Soft cap at 10 exchanges → AI naturally wraps up
OR Owner clicks "End Simulation"
OR Hard cap at 15 exchanges → Auto-end
    ↓
Gamified summary: "You demonstrated: X, Y, Z ✓"
Profile: 45% → 60%
"Next suggested scenario: Time-pressured client"
    ↓
Two buttons: "Continue" or "Review What We Learned"
```

---

## 📦 FILE STRUCTURE

```
app/(dashboard)/simulations/
  ├── new/
  │   └── page.tsx                    (REFACTOR - scenario selection)
  ├── [id]/
  │   └── page.tsx                    (REFACTOR - gamified chat)
  └── page.tsx                        (existing - list view)

app/api/v1/simulations/
  ├── start/route.ts                  (REFACTOR - persona generation)
  ├── [id]/
  │   ├── message/route.ts            (REFACTOR - live feedback)
  │   └── complete/route.ts           (REFACTOR - gamified summary)

components/simulation/
  ├── ScenarioSelection.tsx           (NEW)
  ├── ScenarioCard.tsx                (NEW)
  ├── SimulationChat.tsx              (REFACTOR)
  ├── LiveFeedback.tsx                (NEW)
  ├── LiveQualityScore.tsx            (NEW)
  ├── MessageBubble.tsx               (existing)
  ├── PostSimulationModal.tsx         (NEW - next phase)

lib/simulations/
  ├── persona-generator.ts            (from Phase 2)
  ├── live-feedback-generator.ts      (NEW)
  ├── quality-scorer.ts               (NEW)
  └── completion-detector.ts          (NEW)

lib/ai/prompts/
  └── simulation.ts                   (REFACTOR - persona-aware)
```

---

## 📄 DETAILED IMPLEMENTATION

### 4.1 Scenario Selection Page

**File**: `app/(dashboard)/simulations/new/page.tsx` (REFACTOR)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScenarioSelection from '@/components/simulation/ScenarioSelection';
import { IndustryScenario, ScenarioSuggestion } from '@/lib/types/scenarios';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function NewSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestedScenarioId = searchParams.get('scenario');

  const [scenarios, setScenarios] = useState<IndustryScenario[]>([]);
  const [suggestion, setSuggestion] = useState<ScenarioSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/v1/simulations/scenarios', {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load scenarios');

      const data = await response.json();
      setScenarios(data.scenarios);
      setSuggestion(data.suggestion);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setLoading(false);
    }
  };

  const handleStartSimulation = async (scenarioId: string) => {
    try {
      const response = await fetch('/api/v1/simulations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scenarioId })
      });

      if (!response.ok) throw new Error('Failed to start simulation');

      const data = await response.json();
      router.push(`/simulations/${data.simulationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Choose a Practice Scenario</h1>
        <p className="mt-2 text-gray-600">
          Each simulation trains your AI on different aspects of client interactions
        </p>
      </div>

      {/* Scenario Selection Component */}
      <ScenarioSelection
        scenarios={scenarios}
        suggestion={suggestion}
        onSelect={handleStartSimulation}
      />
    </div>
  );
}
```

---

### 4.2 Scenario Selection Component

**File**: `components/simulation/ScenarioSelection.tsx` (NEW)

```typescript
'use client';

import { IndustryScenario, ScenarioSuggestion } from '@/lib/types/scenarios';
import ScenarioCard from './ScenarioCard';
import { Lightbulb } from 'lucide-react';

interface ScenarioSelectionProps {
  scenarios: IndustryScenario[];
  suggestion: ScenarioSuggestion | null;
  onSelect: (scenarioId: string) => void;
}

export default function ScenarioSelection({ scenarios, suggestion, onSelect }: ScenarioSelectionProps) {
  return (
    <div className="space-y-6">
      {/* Suggested Scenario (if exists) */}
      {suggestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Recommended Next Scenario
              </h2>
              <p className="text-blue-800 mb-4">{suggestion.reason}</p>
              <ScenarioCard
                scenario={suggestion.scenario}
                onSelect={() => onSelect(suggestion.scenario.id)}
                isRecommended
              />
            </div>
          </div>
        </div>
      )}

      {/* All Available Scenarios */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Available Scenarios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios
            .filter(s => s.id !== suggestion?.scenario.id) // Hide suggested one if shown above
            .map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={() => onSelect(scenario.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 4.3 Scenario Card Component

**File**: `components/simulation/ScenarioCard.tsx` (NEW)

```typescript
'use client';

import { IndustryScenario } from '@/lib/types/scenarios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Target, TrendingUp } from 'lucide-react';

interface ScenarioCardProps {
  scenario: IndustryScenario;
  onSelect: () => void;
  isRecommended?: boolean;
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

export default function ScenarioCard({ scenario, onSelect, isRecommended }: ScenarioCardProps) {
  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${isRecommended ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
            Recommended
          </span>
        </div>
      )}

      {/* Scenario Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {scenario.name}
      </h3>

      {/* Teaser */}
      <p className="text-sm text-gray-600 mb-4">
        {scenario.teaser}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {scenario.estimatedDuration}
        </div>
        <div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${DIFFICULTY_COLORS[scenario.difficulty]}`}>
            {scenario.difficulty}
          </span>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Target className="h-4 w-4" />
          <span className="font-medium">What you'll practice:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {scenario.focusAreas.slice(0, 3).map((area, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {area.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={onSelect}
        className="w-full"
        variant={isRecommended ? 'default' : 'outline'}
      >
        Start Simulation
      </Button>
    </Card>
  );
}
```

---

### 4.4 Simulation Chat Page (Gamified)

**File**: `app/(dashboard)/simulations/[id]/page.tsx` (REFACTOR)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SimulationChat from '@/components/simulation/SimulationChat';
import LiveQualityScore from '@/components/simulation/LiveQualityScore';
import { Simulation, SimulationMessage } from '@/lib/types/simulation';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SimulationPage() {
  const params = useParams();
  const router = useRouter();
  const simulationId = params.id as string;

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimulation();
  }, [simulationId]);

  const loadSimulation = async () => {
    try {
      const response = await fetch(`/api/v1/simulations/${simulationId}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load simulation');

      const data = await response.json();
      setSimulation(data.simulation);
      setMessages(data.messages);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch(`/api/v1/simulations/${simulationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Update messages with owner message and AI response
      setMessages(data.messages);
      
      // Update simulation metadata (live score, demonstrated patterns)
      setSimulation(data.simulation);

    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleEndSimulation = async () => {
    try {
      const response = await fetch(`/api/v1/simulations/${simulationId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to end simulation');

      const data = await response.json();
      
      // Redirect to summary page or show modal
      router.push(`/simulations/${simulationId}/summary`);

    } catch (err) {
      console.error('End simulation error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || 'Simulation not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <SimulationChat
          simulation={simulation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEndSimulation={handleEndSimulation}
        />
      </div>

      {/* Sidebar - Live Quality Score */}
      <div className="w-80 border-l border-gray-200 bg-white p-6">
        <LiveQualityScore
          score={simulation.liveScore}
          demonstratedPatterns={simulation.demonstratedPatterns}
          messageCount={messages.length / 2} // Approximate (owner + AI = 2)
        />
      </div>
    </div>
  );
}
```

---

### 4.5 Simulation Chat Component (with Live Feedback)

**File**: `components/simulation/SimulationChat.tsx` (REFACTOR)

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Simulation, SimulationMessage } from '@/lib/types/simulation';
import MessageBubble from './MessageBubble';
import LiveFeedback from './LiveFeedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, StopCircle } from 'lucide-react';

interface SimulationChatProps {
  simulation: Simulation;
  messages: SimulationMessage[];
  onSendMessage: (content: string) => void;
  onEndSimulation: () => void;
}

export default function SimulationChat({
  simulation,
  messages,
  onSendMessage,
  onEndSimulation
}: SimulationChatProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveFeedback]);

  // Update live feedback from simulation metadata
  useEffect(() => {
    if (simulation.demonstratedPatterns.length > liveFeedback.length) {
      const newPatterns = simulation.demonstratedPatterns.slice(liveFeedback.length);
      const newFeedback = newPatterns.map(pattern => generateFeedbackMessage(pattern));
      setLiveFeedback(prev => [...prev, ...newFeedback]);
    }
  }, [simulation.demonstratedPatterns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    await onSendMessage(input.trim());
    setInput('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Check if soft cap or hard cap reached
  const ownerMessageCount = messages.filter(m => m.role === 'BUSINESS_OWNER').length;
  const softCapReached = ownerMessageCount >= 10;
  const hardCapReached = ownerMessageCount >= 15;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Simulation in Progress
            </h2>
            <p className="text-sm text-gray-600">
              {simulation.scenarioType} scenario
            </p>
          </div>
          <Button
            onClick={onEndSimulation}
            variant="outline"
            size="sm"
            disabled={messages.length < 4} // Require at least 2 exchanges
          >
            <StopCircle className="h-4 w-4 mr-2" />
            End Simulation
          </Button>
        </div>

        {/* Soft/Hard Cap Warnings */}
        {softCapReached && !hardCapReached && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            💡 You've reached a good conversation length. Feel free to wrap up naturally or continue.
          </div>
        )}
        {hardCapReached && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
            ⚠️ You've reached the maximum length. The AI will wrap up the conversation.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Live Feedback Items */}
        {liveFeedback.map((feedback, index) => (
          <LiveFeedback key={`feedback-${index}`} message={feedback} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            rows={2}
            disabled={isSending || hardCapReached}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isSending || hardCapReached}
            size="lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Helper function to generate feedback messages
function generateFeedbackMessage(pattern: string): string {
  const feedbackMap: Record<string, string> = {
    'pricing_flexibility': '🎯 Nice! You demonstrated pricing flexibility',
    'timeline_handling': '⏰ Great! You addressed timeline concerns',
    'objection_price': '💰 Well handled! You navigated the price objection',
    'qualification_budget': '✅ Good! You qualified their budget',
    'communication_educational': '📚 Excellent! You explained things clearly',
    'scope_boundaries': '📋 Perfect! You set clear scope boundaries',
  };

  return feedbackMap[pattern] || `✓ Pattern demonstrated: ${pattern.replace(/_/g, ' ')}`;
}
```

---

### 4.6 Live Feedback Component

**File**: `components/simulation/LiveFeedback.tsx` (NEW)

```typescript
'use client';

import { Sparkles } from 'lucide-react';

interface LiveFeedbackProps {
  message: string;
}

export default function LiveFeedback({ message }: LiveFeedbackProps) {
  return (
    <div className="flex justify-center my-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-800">
        <Sparkles className="h-4 w-4 text-green-600" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
```

---

### 4.7 Live Quality Score Component

**File**: `components/simulation/LiveQualityScore.tsx` (NEW)

```typescript
'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';

interface LiveQualityScoreProps {
  score: number;
  demonstratedPatterns: string[];
  messageCount: number;
}

export default function LiveQualityScore({ score, demonstratedPatterns, messageCount }: LiveQualityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 70) return 'Ready to Extract';
    if (score >= 50) return 'Getting There';
    return 'Keep Going';
  };

  return (
    <div className="space-y-6">
      {/* Quality Score */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Quality Score</span>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mb-2">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </span>
        </div>
        <Progress value={score} className="mb-2" />
        <p className="text-xs text-gray-600">{getScoreStatus(score)}</p>
      </Card>

      {/* Message Count */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Messages</span>
          <MessageSquare className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mb-1">
          <span className="text-2xl font-bold text-gray-900">{messageCount}</span>
        </div>
        <p className="text-xs text-gray-600">
          {messageCount < 6 ? 'Just getting started' : messageCount < 12 ? 'Good length' : 'Comprehensive'}
        </p>
      </Card>

      {/* Demonstrated Patterns */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Patterns Shown</span>
          <CheckCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {demonstratedPatterns.length === 0 ? (
            <p className="text-xs text-gray-500">No patterns demonstrated yet</p>
          ) : (
            demonstratedPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-700">{pattern.replace(/_/g, ' ')}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Helpful Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-medium text-blue-900 mb-2">💡 Tips</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Answer the customer's questions directly</li>
          <li>• Show how you handle price objections</li>
          <li>• Demonstrate your qualification process</li>
          <li>• Set clear expectations on timeline</li>
        </ul>
      </Card>
    </div>
  );
}
```

---

## 🔄 API ENDPOINT REFACTORS

### 4.8 Start Simulation (with Persona Generation)

**File**: `app/api/v1/simulations/start/route.ts` (REFACTOR)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getScenarioById } from '@/lib/templates/industry-scenarios';
import { generatePersona } from '@/lib/templates/persona-generator';
import { generateSimulationPrompt } from '@/lib/ai/prompts/simulation';
import prisma from '@/lib/prisma';
import anthropic from '@/lib/ai/client';

async function handleStartSimulation(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: { include: { profiles: true } } }
    });

    if (!user || !user.tenant.profiles[0]) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    const { scenarioId } = await req.json();

    // Get scenario from templates
    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json({ success: false, message: 'Scenario not found' }, { status: 404 });
    }

    // Generate randomized persona
    const persona = generatePersona(scenario);

    // Create simulation in database
    const simulation = await prisma.simulation.create({
      data: {
        tenantId: user.tenantId,
        scenarioType: scenario.id,
        status: 'IN_PROGRESS',
        personaDetails: persona as any, // JSON field
        demonstratedPatterns: [],
        liveScore: 0,
        aiPersona: {} // Legacy field
      }
    });

    // Create initial AI message using persona
    const systemPrompt = generateSimulationPrompt(scenario, persona, user.tenant.profiles[0]);
    
    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Start the simulation with your opening line.'
        }
      ]
    });

    const aiMessage = aiResponse.content[0].text;

    // Save AI's opening message
    await prisma.simulationMessage.create({
      data: {
        simulationId: simulation.id,
        role: 'AI_CLIENT',
        content: aiMessage
      }
    });

    return NextResponse.json({
      success: true,
      simulationId: simulation.id,
      persona: {
        name: persona.name,
        teaser: scenario.teaser
      }
    });

  } catch (error) {
    console.error('Start simulation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleStartSimulation);
```

---

### 4.9 Send Message (with Live Feedback)

**File**: `app/api/v1/simulations/[id]/message/route.ts` (REFACTOR)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { generateLiveFeedback } from '@/lib/simulations/live-feedback-generator';
import { calculateLiveQualityScore } from '@/lib/simulations/quality-scorer';
import { detectCompletionTrigger } from '@/lib/simulations/completion-detector';
import { generateSimulationPrompt } from '@/lib/ai/prompts/simulation';
import { getScenarioById } from '@/lib/templates/industry-scenarios';
import prisma from '@/lib/prisma';
import anthropic from '@/lib/ai/client';

async function handleSendMessage(req: NextRequest, context: any) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const simulationId = context.params.id;
    const { content } = await req.json();

    // Get simulation with messages
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        tenant: { include: { profiles: true } }
      }
    });

    if (!simulation) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    // Save owner's message
    const ownerMessage = await prisma.simulationMessage.create({
      data: {
        simulationId,
        role: 'BUSINESS_OWNER',
        content
      }
    });

    // Get scenario and persona
    const scenario = getScenarioById(simulation.scenarioType);
    const persona = simulation.personaDetails;

    // Build conversation history
    const conversationHistory = simulation.messages.map(msg => ({
      role: msg.role === 'BUSINESS_OWNER' ? 'user' : 'assistant',
      content: msg.content
    }));
    conversationHistory.push({ role: 'user', content });

    // Check if should trigger completion
    const ownerMessageCount = simulation.messages.filter(m => m.role === 'BUSINESS_OWNER').length + 1;
    const shouldWrapUp = detectCompletionTrigger(ownerMessageCount, conversationHistory);

    // Generate AI response
    const systemPrompt = generateSimulationPrompt(
      scenario,
      persona,
      simulation.tenant.profiles[0],
      shouldWrapUp
    );

    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0.8,
      system: systemPrompt,
      messages: conversationHistory
    });

    const aiMessage = await prisma.simulationMessage.create({
      data: {
        simulationId,
        role: 'AI_CLIENT',
        content: aiResponse.content[0].text
      }
    });

    // Generate live feedback
    const newPatterns = generateLiveFeedback(content, simulation.demonstratedPatterns);

    // Calculate live quality score
    const allMessages = [...simulation.messages, ownerMessage, aiMessage];
    const liveScore = calculateLiveQualityScore(allMessages, scenario);

    // Update simulation metadata
    const updatedSimulation = await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        demonstratedPatterns: [...simulation.demonstratedPatterns, ...newPatterns],
        liveScore
      }
    });

    // Return updated data
    const messages = await prisma.simulationMessage.findMany({
      where: { simulationId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      messages,
      simulation: updatedSimulation
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export const POST = withAuth(handleSendMessage);
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 4 Tasks

- [ ] **Refactor Scenario Selection**
  - [ ] Create `ScenarioSelection.tsx` component
  - [ ] Create `ScenarioCard.tsx` component
  - [ ] Update `/simulations/new/page.tsx`
  - [ ] Add scenario loading endpoint

- [ ] **Refactor Simulation Chat**
  - [ ] Update `SimulationChat.tsx` with live feedback
  - [ ] Create `LiveFeedback.tsx` component
  - [ ] Create `LiveQualityScore.tsx` component
  - [ ] Add soft/hard cap UI indicators
  - [ ] Add "End Simulation" button

- [ ] **Create Helper Libraries**
  - [ ] Create `live-feedback-generator.ts`
  - [ ] Create `quality-scorer.ts`
  - [ ] Create `completion-detector.ts`

- [ ] **Refactor API Endpoints**
  - [ ] Update `/start/route.ts` with persona generation
  - [ ] Update `/message/route.ts` with live feedback
  - [ ] Update completion detection logic

- [ ] **Update AI Prompts**
  - [ ] Refactor `simulation.ts` to use persona details
  - [ ] Add wrap-up instructions for soft/hard caps
  - [ ] Test prompt effectiveness

---

## ✅ COMPLETION CRITERIA

Phase 4 is complete when:
- ✅ Randomized personas generate correctly
- ✅ Live feedback appears during simulation
- ✅ Quality score updates in real-time
- ✅ Soft cap (10) and hard cap (15) work
- ✅ Gamified experience feels engaging
- ✅ Integration with Phase 2 scenarios works
- ✅ All tests passing

---

**Status**: Ready for Implementation  
**Estimated Time**: 8-10 hours  
**Dependencies**: Phase 1, 2, 3 Complete  
**Next Phase**: Phase 5 - Pattern Extraction Refactor
