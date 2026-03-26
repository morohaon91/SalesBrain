'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Target } from 'lucide-react';

interface ScenarioGuideProps {
  scenarioType: string;
  industry: string;
  guidelines: string[];
  keyTopics?: string[];
}

const SCENARIO_DESCRIPTIONS: Record<string, { title: string; description: string; focus: string[] }> = {
  PRICE_SENSITIVE: {
    title: 'Price-Sensitive Client',
    description: 'This customer is budget-conscious and will challenge your pricing. They want to understand value and may compare options.',
    focus: [
      'Demonstrate ROI and business impact',
      'Explain pricing structure clearly',
      'Show flexibility options where possible',
      'Address budget concerns directly'
    ]
  },
  DEMANDING: {
    title: 'Demanding Client',
    description: 'This customer has high expectations for quality and service. They want excellence and attention to detail.',
    focus: [
      'Emphasize quality and standards',
      'Show attention to detail in your approach',
      'Explain how you handle complex requirements',
      'Highlight expertise and track record'
    ]
  },
  INDECISIVE: {
    title: 'Indecisive Client',
    description: 'This customer struggles with decision-making and needs reassurance. They want confidence that choosing you is the right move.',
    focus: [
      'Provide clear recommendations',
      'Reduce uncertainty with guarantees or trials',
      'Show social proof and success stories',
      'Make the decision process easier'
    ]
  },
  TIME_PRESSURED: {
    title: 'Time-Pressured Client',
    description: 'This customer is under time pressure and needs quick solutions. They value efficiency and timely delivery.',
    focus: [
      'Understand their timeline',
      'Show you can deliver quickly',
      'Provide clear implementation timeline',
      'Address urgency appropriately'
    ]
  },
  HIGH_BUDGET: {
    title: 'High-Budget Client',
    description: 'This customer has budget available and is looking for premium solutions. They want comprehensive service and partnership.',
    focus: [
      'Discuss scope and full capabilities',
      'Build long-term partnership vision',
      'Emphasize strategic value, not just cost',
      'Explore extended services or features'
    ]
  }
};

export function ScenarioGuide({
  scenarioType,
  industry,
  guidelines,
  keyTopics = []
}: ScenarioGuideProps) {
  const scenario = SCENARIO_DESCRIPTIONS[scenarioType];

  if (!scenario) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          {scenario.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{scenario.description}</p>

        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            Key Focus Areas
          </h4>
          <ul className="space-y-2">
            {scenario.focus.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {keyTopics.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Topics to Discuss</h4>
            <div className="flex flex-wrap gap-2">
              {keyTopics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {guidelines.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Guidelines</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {guidelines.map((guideline, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
