/**
 * Simulation Types
 * Extended types for the gamified simulation system
 */

import { SimulationPersona } from './scenarios';

export type SimulationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type MessageRole = 'BUSINESS_OWNER' | 'AI_CLIENT' | 'SYSTEM';
export type SimulationApprovalStatus = 'PENDING' | 'EXTRACTED' | 'APPROVED' | 'PARTIAL' | 'REJECTED';

export interface SimulationMessage {
  id: string;
  simulationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  tokensUsed?: number | null;
  latencyMs?: number | null;
}

export interface Simulation {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  validatedAt?: Date | null;

  scenarioType: string;
  duration: number;
  status: SimulationStatus;

  // Legacy
  aiPersona: Record<string, unknown>;

  // Gamified fields (Phase 4+)
  personaDetails?: SimulationPersona | null;
  demonstratedPatterns: string[];
  liveScore: number;

  // Owner review
  ownerReviewedAt?: Date | null;
  ownerApprovalStatus: SimulationApprovalStatus;

  // Analysis
  extractedPatterns?: Record<string, unknown> | null;
  qualityScore?: number | null;
}

export interface LiveFeedbackItem {
  pattern: string;
  message: string;
  timestamp: Date;
}

export interface SimulationQualityScore {
  score: number;           // 0-100
  messageCount: number;
  demonstratedPatterns: string[];
  status: 'starting' | 'getting_there' | 'good' | 'ready_to_extract';
}
