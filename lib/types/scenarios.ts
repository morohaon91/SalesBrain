/**
 * Industry Scenario Types
 * Used for the 10-industry × 4-scenario simulation system
 */

export interface PersonaTemplate {
  budgetRange: { min: number; max: number };
  ageRange: { min: number; max: number };
  personalityOptions: string[];
  painPointOptions: string[];
  timelineOptions: string[];
}

export interface IndustryScenario {
  id: string;
  industry: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;
  teaser: string;
  focusAreas: string[];
  personaTemplate: PersonaTemplate;
}

export interface SimulationPersona {
  name: string;
  age: number;
  budget: {
    min: number;
    max: number;
    flexibility: 'rigid' | 'moderate' | 'flexible';
  };
  timeline: string;
  painPoints: string[];
  personality: string[];
  openingLine: string;
  backstory: string;
}

export interface ScenarioSuggestion {
  scenario: IndustryScenario;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  fillsGaps: string[];
}
