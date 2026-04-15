# ARTIFACT 3: Go-Live Gates & Competency Tracking
## Hard Requirements + Readiness Calculator

---

## Overview

**What this does:**
- Defines competency requirements (in code, no new DB tables)
- Validates Go-Live gates based on existing data
- Updates `profileApprovalStatus` automatically
- Updates `suggestedNextScenario` with smart recommendations
- Calculates when owner is truly ready to go live

**What you get:**
- Clear, enforced quality gates
- No guessing if profile is ready
- Automatic status progression
- Smart scenario recommendations

---

## File: `lib/learning/competencies.ts`

```typescript
/**
 * Competency Definitions
 * 
 * These define what must be learned before Go Live.
 * Stored in code, not database.
 */

export interface CompetencyRequirement {
  id: string;
  name: string;
  category: 'identity' | 'strategic' | 'qualification' | 'objection' | 'adaptation';
  description: string;
  
  // Requirements
  requiredForGoLive: boolean;
  minimumConfidence: number; // 0-100
  minimumEvidence: number; // How many examples needed
  
  // Validation function
  validate: (profile: any) => CompetencyStatus;
}

export interface CompetencyStatus {
  competencyId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED';
  currentConfidence: number;
  evidenceCount: number;
  blockingReasons: string[];
}

/**
 * All V1 Competency Requirements
 */
export const COMPETENCIES: CompetencyRequirement[] = [
  // ============================================
  // IDENTITY COMPETENCIES (15%)
  // ============================================
  {
    id: 'communication_style_established',
    name: 'Communication Style Established',
    category: 'identity',
    description: 'AI has learned owner\'s tone, energy, and linguistic patterns',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 3,
    
    validate: (profile) => {
      const cs = profile.communicationStyle;
      if (!cs) {
        return {
          competencyId: 'communication_style_established',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No communication style data extracted yet']
        };
      }
      
      const hasBasics = cs.tone && cs.sentenceLength && cs.energyLevel;
      const hasFingerprint = (cs.commonPhrases?.length || 0) >= 5;
      const hasEvidence = (cs.evidenceCount || 0) >= 3;
      
      const confidence = cs.confidence || 0;
      const blocking = [];
      
      if (!hasBasics) blocking.push('Missing basic style attributes (tone/length/energy)');
      if (!hasFingerprint) blocking.push('Need at least 5 common phrases');
      if (!hasEvidence) blocking.push('Need evidence from at least 3 simulations');
      if (confidence < 70) blocking.push(`Confidence too low: ${confidence}% (need 70%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 90) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'communication_style_established',
        status,
        currentConfidence: confidence,
        evidenceCount: cs.evidenceCount || 0,
        blockingReasons: blocking
      };
    }
  },
  
  {
    id: 'linguistic_fingerprint_captured',
    name: 'Linguistic Fingerprint Captured',
    category: 'identity',
    description: 'Owner\'s distinctive language patterns documented',
    requiredForGoLive: true,
    minimumConfidence: 60,
    minimumEvidence: 3,
    
    validate: (profile) => {
      const voice = profile.ownerVoiceExamples;
      if (!voice) {
        return {
          competencyId: 'linguistic_fingerprint_captured',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No voice examples extracted yet']
        };
      }
      
      const hasOpenings = (voice.greetings?.length || 0) >= 3;
      const hasClosings = (voice.closingStatements?.length || 0) >= 3;
      const hasDiscovery = (voice.discoveryQuestions?.length || 0) >= 5;
      
      const totalExamples = 
        (voice.greetings?.length || 0) +
        (voice.closingStatements?.length || 0) +
        (voice.discoveryQuestions?.length || 0) +
        (voice.valueStatements?.length || 0);
      
      const confidence = Math.min(100, totalExamples * 3);
      const blocking = [];
      
      if (!hasOpenings) blocking.push('Need at least 3 opening examples');
      if (!hasClosings) blocking.push('Need at least 3 closing examples');
      if (!hasDiscovery) blocking.push('Need at least 5 discovery questions');
      if (confidence < 60) blocking.push(`Confidence too low: ${confidence}% (need 60%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 85) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'linguistic_fingerprint_captured',
        status,
        currentConfidence: confidence,
        evidenceCount: Math.floor(totalExamples / 5),
        blockingReasons: blocking
      };
    }
  },
  
  // ============================================
  // STRATEGIC COMPETENCIES (20%)
  // ============================================
  {
    id: 'discovery_mastery',
    name: 'Discovery Mastery',
    category: 'strategic',
    description: 'How owner uncovers lead pain and needs',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 3,
    
    validate: (profile) => {
      const dm = profile.decisionMakingPatterns;
      if (!dm?.discovery) {
        return {
          competencyId: 'discovery_mastery',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No discovery patterns extracted yet']
        };
      }
      
      const discovery = dm.discovery;
      const hasQuestions = (discovery.firstQuestions?.length || 0) >= 3;
      const hasOrder = (discovery.discoveryOrder?.length || 0) >= 2;
      const hasTransition = !!discovery.moveToValueTrigger;
      
      const confidence = dm.overallConfidence || 0;
      const blocking = [];
      
      if (!hasQuestions) blocking.push('Need at least 3 discovery questions');
      if (!hasOrder) blocking.push('Need discovery order pattern');
      if (!hasTransition) blocking.push('Need transition to value trigger');
      if (confidence < 70) blocking.push(`Confidence too low: ${confidence}% (need 70%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 90) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'discovery_mastery',
        status,
        currentConfidence: confidence,
        evidenceCount: (discovery.firstQuestions?.length || 0),
        blockingReasons: blocking
      };
    }
  },
  
  {
    id: 'value_positioning_established',
    name: 'Value Positioning Established',
    category: 'strategic',
    description: 'How owner frames and communicates value',
    requiredForGoLive: true,
    minimumConfidence: 65,
    minimumEvidence: 2,
    
    validate: (profile) => {
      const dm = profile.decisionMakingPatterns;
      if (!dm?.valuePositioning) {
        return {
          competencyId: 'value_positioning_established',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No value positioning extracted yet']
        };
      }
      
      const vp = dm.valuePositioning;
      const hasPrimary = !!vp.primaryValueLens;
      const hasProof = (vp.proofSignalsUsed?.length || 0) >= 1;
      
      const confidence = dm.overallConfidence || 0;
      const blocking = [];
      
      if (!hasPrimary) blocking.push('Need primary value lens identified');
      if (!hasProof) blocking.push('Need at least 1 proof signal');
      if (confidence < 65) blocking.push(`Confidence too low: ${confidence}% (need 65%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 85) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'value_positioning_established',
        status,
        currentConfidence: confidence,
        evidenceCount: (vp.proofSignalsUsed?.length || 0) + (hasPrimary ? 1 : 0),
        blockingReasons: blocking
      };
    }
  },
  
  {
    id: 'closing_strategy_defined',
    name: 'Closing Strategy Defined',
    category: 'strategic',
    description: 'When and how owner asks for next steps',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 2,
    
    validate: (profile) => {
      const dm = profile.decisionMakingPatterns;
      if (!dm?.closing) {
        return {
          competencyId: 'closing_strategy_defined',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No closing patterns extracted yet']
        };
      }
      
      const closing = dm.closing;
      const hasNextStep = closing.asksForNextStep;
      const hasTiming = !!closing.ctaTiming;
      const hasPreference = !!closing.preferredNextStep;
      
      const confidence = dm.overallConfidence || 0;
      const blocking = [];
      
      if (!hasNextStep) blocking.push('Owner must ask for next step');
      if (!hasTiming) blocking.push('Need CTA timing pattern');
      if (!hasPreference) blocking.push('Need preferred next step identified');
      if (confidence < 70) blocking.push(`Confidence too low: ${confidence}% (need 70%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 90) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'closing_strategy_defined',
        status,
        currentConfidence: confidence,
        evidenceCount: [hasNextStep, hasTiming, hasPreference].filter(Boolean).length,
        blockingReasons: blocking
      };
    }
  },
  
  // ============================================
  // QUALIFICATION COMPETENCIES (20%)
  // ============================================
  {
    id: 'green_flags_identified',
    name: 'Green Flags Identified',
    category: 'qualification',
    description: 'Owner can recognize quality leads',
    requiredForGoLive: true,
    minimumConfidence: 65,
    minimumEvidence: 2,
    
    validate: (profile) => {
      const qc = profile.qualificationCriteria;
      if (!qc) {
        return {
          competencyId: 'green_flags_identified',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No qualification criteria extracted yet']
        };
      }
      
      const greenCount = qc.greenFlags?.length || 0;
      const hasEnough = greenCount >= 3;
      
      const confidence = qc.overallConfidence || 0;
      const blocking = [];
      
      if (!hasEnough) blocking.push(`Need at least 3 green flags (have ${greenCount})`);
      if (confidence < 65) blocking.push(`Confidence too low: ${confidence}% (need 65%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 85) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'green_flags_identified',
        status,
        currentConfidence: confidence,
        evidenceCount: greenCount,
        blockingReasons: blocking
      };
    }
  },
  
  {
    id: 'deal_breakers_validated',
    name: 'Deal Breakers Validated',
    category: 'qualification',
    description: 'Clear disqualification criteria demonstrated',
    requiredForGoLive: true,
    minimumConfidence: 75,
    minimumEvidence: 1,
    
    validate: (profile) => {
      const qc = profile.qualificationCriteria;
      if (!qc?.dealBreakers) {
        return {
          competencyId: 'deal_breakers_validated',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No deal breakers extracted yet']
        };
      }
      
      const dealBreakers = qc.dealBreakers;
      const hasValidated = dealBreakers.filter(db => db.confidence >= 75).length;
      const hasAtLeastOne = hasValidated >= 1;
      
      const avgConfidence = dealBreakers.length > 0
        ? dealBreakers.reduce((sum, db) => sum + db.confidence, 0) / dealBreakers.length
        : 0;
      
      const blocking = [];
      
      if (!hasAtLeastOne) blocking.push('Need at least 1 deal breaker with 75%+ confidence');
      if (dealBreakers.length === 0) blocking.push('No deal breakers identified yet');
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && avgConfidence >= 90) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'deal_breakers_validated',
        status,
        currentConfidence: avgConfidence,
        evidenceCount: hasValidated,
        blockingReasons: blocking
      };
    }
  },
  
  // ============================================
  // OBJECTION COMPETENCIES (25%)
  // ============================================
  {
    id: 'price_objection_handling',
    name: 'Price Objection Handling',
    category: 'objection',
    description: 'How owner defends value when price is challenged',
    requiredForGoLive: true,
    minimumConfidence: 75,
    minimumEvidence: 1,
    
    validate: (profile) => {
      const oh = profile.objectionHandling;
      if (!oh?.playbooks) {
        return {
          competencyId: 'price_objection_handling',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No objection handling extracted yet']
        };
      }
      
      const pricePlaybook = oh.playbooks.find(p => p.objectionType === 'price');
      if (!pricePlaybook) {
        return {
          competencyId: 'price_objection_handling',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['Price objection scenario not completed yet']
        };
      }
      
      const confidence = pricePlaybook.confidenceScore || 0;
      const hasStrategy = !!pricePlaybook.responseStrategy;
      const hasExamples = (pricePlaybook.responseExamples?.length || 0) >= 1;
      
      const blocking = [];
      
      if (!hasStrategy) blocking.push('Need price defense strategy');
      if (!hasExamples) blocking.push('Need at least 1 price response example');
      if (confidence < 75) blocking.push(`Confidence too low: ${confidence}% (need 75%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 90) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'price_objection_handling',
        status,
        currentConfidence: confidence,
        evidenceCount: pricePlaybook.evidenceCount || 0,
        blockingReasons: blocking
      };
    }
  },
  
  {
    id: 'trust_objection_handling',
    name: 'Trust/Skepticism Handling',
    category: 'objection',
    description: 'How owner builds credibility with skeptical leads',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 1,
    
    validate: (profile) => {
      const oh = profile.objectionHandling;
      if (!oh?.playbooks) {
        return {
          competencyId: 'trust_objection_handling',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No objection handling extracted yet']
        };
      }
      
      const trustPlaybook = oh.playbooks.find(p => p.objectionType === 'trust');
      if (!trustPlaybook) {
        return {
          competencyId: 'trust_objection_handling',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['Trust/skepticism scenario not completed yet']
        };
      }
      
      const confidence = trustPlaybook.confidenceScore || 0;
      const hasStrategy = !!trustPlaybook.responseStrategy;
      
      const blocking = [];
      
      if (!hasStrategy) blocking.push('Need trust-building strategy');
      if (confidence < 70) blocking.push(`Confidence too low: ${confidence}% (need 70%)`);
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED' = 'IN_PROGRESS';
      if (blocking.length === 0 && confidence >= 90) status = 'MASTERED';
      else if (blocking.length === 0) status = 'ACHIEVED';
      
      return {
        competencyId: 'trust_objection_handling',
        status,
        currentConfidence: confidence,
        evidenceCount: trustPlaybook.evidenceCount || 0,
        blockingReasons: blocking
      };
    }
  }
];

/**
 * Get all competencies
 */
export function getAllCompetencies(): CompetencyRequirement[] {
  return COMPETENCIES;
}

/**
 * Get competencies by category
 */
export function getCompetenciesByCategory(
  category: 'identity' | 'strategic' | 'qualification' | 'objection' | 'adaptation'
): CompetencyRequirement[] {
  return COMPETENCIES.filter(c => c.category === category);
}

/**
 * Get only mandatory competencies
 */
export function getMandatoryCompetencies(): CompetencyRequirement[] {
  return COMPETENCIES.filter(c => c.requiredForGoLive);
}

/**
 * Evaluate all competencies for a profile
 */
export function evaluateAllCompetencies(profile: any): CompetencyStatus[] {
  return COMPETENCIES.map(comp => comp.validate(profile));
}

/**
 * Check if all mandatory competencies are achieved
 */
export function allMandatoryCompetenciesAchieved(profile: any): boolean {
  const mandatory = getMandatoryCompetencies();
  const statuses = mandatory.map(comp => comp.validate(profile));
  
  return statuses.every(status => 
    status.status === 'ACHIEVED' || status.status === 'MASTERED'
  );
}
```

---

## File: `lib/learning/go-live-gates.ts`

```typescript
/**
 * Go-Live Gate Validation
 * 
 * Hard gates that must pass before profile can go live
 */

import { allMandatoryScenariosCompleted } from '@/lib/scenarios/mandatory-scenarios';
import { allMandatoryCompetenciesAchieved, evaluateAllCompetencies } from './competencies';

export interface GateValidationResult {
  gateId: string;
  name: string;
  status: 'PASSED' | 'BLOCKED';
  progress: number; // 0-100
  blockingReasons: string[];
}

/**
 * Gate 1: Mandatory Scenarios Completed
 */
export function validateMandatoryScenariosGate(
  completedScenarioIds: string[]
): GateValidationResult {
  
  const allCompleted = allMandatoryScenariosCompleted(completedScenarioIds);
  const totalMandatory = 8; // From mandatory-scenarios.ts
  const completed = completedScenarioIds.length;
  
  return {
    gateId: 'mandatory_scenarios',
    name: 'Complete All 8 Mandatory Scenarios',
    status: allCompleted ? 'PASSED' : 'BLOCKED',
    progress: Math.min(100, (completed / totalMandatory) * 100),
    blockingReasons: allCompleted ? [] : [
      `Only ${completed}/8 mandatory scenarios completed`
    ]
  };
}

/**
 * Gate 2: Competency Coverage
 */
export function validateCompetencyCoverageGate(
  profile: any
): GateValidationResult {
  
  const allAchieved = allMandatoryCompetenciesAchieved(profile);
  const statuses = evaluateAllCompetencies(profile);
  
  const achieved = statuses.filter(s => 
    s.status === 'ACHIEVED' || s.status === 'MASTERED'
  ).length;
  
  const total = statuses.length;
  const blocking = statuses
    .filter(s => s.status !== 'ACHIEVED' && s.status !== 'MASTERED')
    .flatMap(s => s.blockingReasons);
  
  return {
    gateId: 'competency_coverage',
    name: 'All Mandatory Competencies Achieved',
    status: allAchieved ? 'PASSED' : 'BLOCKED',
    progress: Math.min(100, (achieved / total) * 100),
    blockingReasons: blocking
  };
}

/**
 * Gate 3: Objection Coverage
 */
export function validateObjectionCoverageGate(
  profile: any
): GateValidationResult {
  
  const oh = profile.objectionHandling;
  if (!oh?.playbooks) {
    return {
      gateId: 'objection_coverage',
      name: 'Key Objections Handled',
      status: 'BLOCKED',
      progress: 0,
      blockingReasons: ['No objection handling data extracted yet']
    };
  }
  
  const requiredObjections = ['price', 'trust'];
  const covered = requiredObjections.filter(type =>
    oh.playbooks.some(p => p.objectionType === type && p.confidenceScore >= 70)
  );
  
  const blocking = requiredObjections
    .filter(type => !covered.includes(type))
    .map(type => `Missing high-confidence ${type} objection handling`);
  
  return {
    gateId: 'objection_coverage',
    name: 'Price & Trust Objections Handled',
    status: covered.length === requiredObjections.length ? 'PASSED' : 'BLOCKED',
    progress: (covered.length / requiredObjections.length) * 100,
    blockingReasons: blocking
  };
}

/**
 * Gate 4: Deal Breakers Identified
 */
export function validateDealBreakersGate(
  profile: any
): GateValidationResult {
  
  const qc = profile.qualificationCriteria;
  if (!qc?.dealBreakers) {
    return {
      gateId: 'deal_breakers',
      name: 'Deal Breakers Identified',
      status: 'BLOCKED',
      progress: 0,
      blockingReasons: ['No deal breakers extracted yet']
    };
  }
  
  const validated = qc.dealBreakers.filter(db => db.confidence >= 75);
  const hasMinimum = validated.length >= 1;
  
  return {
    gateId: 'deal_breakers',
    name: 'At Least 1 Deal Breaker Validated',
    status: hasMinimum ? 'PASSED' : 'BLOCKED',
    progress: hasMinimum ? 100 : Math.min(80, validated.length * 40),
    blockingReasons: hasMinimum ? [] : [
      'Need at least 1 deal breaker with 75%+ confidence'
    ]
  };
}

/**
 * Gate 5: Linguistic Fingerprint
 */
export function validateLinguisticFingerprintGate(
  profile: any
): GateValidationResult {
  
  const cs = profile.communicationStyle;
  const voice = profile.ownerVoiceExamples;
  
  if (!cs || !voice) {
    return {
      gateId: 'linguistic_fingerprint',
      name: 'Linguistic Fingerprint Captured',
      status: 'BLOCKED',
      progress: 0,
      blockingReasons: ['No communication data extracted yet']
    };
  }
  
  const hasStyle = cs.tone && cs.sentenceLength;
  const hasPhrases = (cs.commonPhrases?.length || 0) >= 5;
  const hasVoice = (voice.greetings?.length || 0) >= 3 &&
                  (voice.closingStatements?.length || 0) >= 3;
  
  const checks = [hasStyle, hasPhrases, hasVoice];
  const passed = checks.filter(Boolean).length;
  
  const blocking = [];
  if (!hasStyle) blocking.push('Need tone and sentence patterns');
  if (!hasPhrases) blocking.push('Need at least 5 common phrases');
  if (!hasVoice) blocking.push('Need greetings and closing examples');
  
  return {
    gateId: 'linguistic_fingerprint',
    name: 'Linguistic Fingerprint Captured',
    status: blocking.length === 0 ? 'PASSED' : 'BLOCKED',
    progress: (passed / checks.length) * 100,
    blockingReasons: blocking
  };
}

/**
 * Validate ALL Gates
 */
export function validateAllGates(profile: any): GateValidationResult[] {
  return [
    validateMandatoryScenariosGate(profile.completedScenarios || []),
    validateCompetencyCoverageGate(profile),
    validateObjectionCoverageGate(profile),
    validateDealBreakersGate(profile),
    validateLinguisticFingerprintGate(profile)
  ];
}

/**
 * Check if profile can go live
 */
export function canGoLive(profile: any): boolean {
  const gates = validateAllGates(profile);
  return gates.every(gate => gate.status === 'PASSED');
}

/**
 * Get all blocking reasons across gates
 */
export function getAllBlockingReasons(profile: any): string[] {
  const gates = validateAllGates(profile);
  return gates.flatMap(gate => gate.blockingReasons);
}
```

---

## File: `lib/learning/readiness-calculator.ts`

```typescript
/**
 * Readiness Calculator
 * 
 * Updates profileApprovalStatus and suggestedNextScenario
 */

import { prisma } from '@/lib/db/prisma';
import { ProfileApprovalStatus } from '@prisma/client';
import { canGoLive, validateAllGates } from './go-live-gates';
import { getNextRecommendedScenario } from '@/lib/scenarios/mandatory-scenarios';
import { evaluateAllCompetencies } from './competencies';

/**
 * Calculate and update profile readiness
 * Call this after each simulation extraction
 */
export async function updateProfileReadiness(profileId: string): Promise<void> {
  
  const profile = await prisma.businessProfile.findUnique({
    where: { id: profileId }
  });
  
  if (!profile) throw new Error('Profile not found');
  
  // Check if can go live
  const isReady = canGoLive(profile);
  
  // Get next scenario recommendation
  const nextScenario = getNextRecommendedScenario(profile.completedScenarios || []);
  
  // Determine status
  let newStatus: ProfileApprovalStatus = profile.profileApprovalStatus;
  
  if (isReady && profile.profileApprovalStatus !== 'APPROVED' && profile.profileApprovalStatus !== 'LIVE') {
    newStatus = 'READY'; // Ready for owner approval
  } else if (!isReady && profile.completedScenarios.length >= 3) {
    newStatus = 'PENDING'; // In progress
  }
  
  // Update profile
  await prisma.businessProfile.update({
    where: { id: profileId },
    data: {
      profileApprovalStatus: newStatus,
      suggestedNextScenario: nextScenario?.id || null
    }
  });
  
  console.log(`[Readiness] Profile ${profileId} updated:`, {
    status: newStatus,
    canGoLive: isReady,
    nextScenario: nextScenario?.name
  });
}

/**
 * Get detailed readiness report
 */
export function getReadinessReport(profile: any) {
  
  const gates = validateAllGates(profile);
  const competencies = evaluateAllCompetencies(profile);
  const nextScenario = getNextRecommendedScenario(profile.completedScenarios || []);
  
  const gatesPassed = gates.filter(g => g.status === 'PASSED').length;
  const competenciesAchieved = competencies.filter(c => 
    c.status === 'ACHIEVED' || c.status === 'MASTERED'
  ).length;
  
  return {
    canGoLive: gates.every(g => g.status === 'PASSED'),
    overallReadiness: profile.completionPercentage || 0,
    
    gates: {
      total: gates.length,
      passed: gatesPassed,
      details: gates
    },
    
    competencies: {
      total: competencies.length,
      achieved: competenciesAchieved,
      details: competencies
    },
    
    scenarios: {
      completed: profile.completedScenarios?.length || 0,
      total: 8,
      nextRecommended: nextScenario ? {
        id: nextScenario.id,
        name: nextScenario.name,
        reason: nextScenario.purpose
      } : null
    },
    
    blockingReasons: gates.flatMap(g => g.blockingReasons)
  };
}
```

---

## File: `app/api/v1/profiles/[tenantId]/readiness/route.ts`

```typescript
/**
 * Get Profile Readiness Report
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { getReadinessReport } from '@/lib/learning/readiness-calculator';

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId: params.tenantId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const report = getReadinessReport(profile);

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error getting readiness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Update Extraction Engine

Add to `lib/extraction/extraction-engine.ts` at the end of `extractPatternsFromSimulation`:

```typescript
// After updating profile, recalculate readiness
import { updateProfileReadiness } from '@/lib/learning/readiness-calculator';

// At end of extractPatternsFromSimulation function:
await updateProfileReadiness(profile.id);
```

---

## Testing

```bash
# Complete a few simulations
# Then check readiness:

GET /api/v1/profiles/{tenantId}/readiness

# Response:
{
  "canGoLive": false,
  "overallReadiness": 45,
  "gates": {
    "total": 5,
    "passed": 2,
    "details": [...]
  },
  "competencies": {
    "total": 9,
    "achieved": 4,
    "details": [...]
  },
  "blockingReasons": [
    "Only 3/8 mandatory scenarios completed",
    "Missing high-confidence price objection handling"
  ]
}
```

---

## Completion Checklist

- [ ] Competency definitions created
- [ ] Gate validation logic implemented
- [ ] Readiness calculator working
- [ ] API route for readiness report
- [ ] Extraction triggers readiness update
- [ ] `profileApprovalStatus` updates automatically
- [ ] `suggestedNextScenario` updates correctly
- [ ] Tested full flow: simulations → extraction → readiness

---

**Next:** Artifact 4 - Readiness Dashboard UI
