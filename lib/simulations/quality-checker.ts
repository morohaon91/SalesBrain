/**
 * Simulation Quality Checker
 * Analyzes conversation quality and prevents extraction from incomplete simulations
 * Phase 3: Simulation Quality Detection
 */

export interface SimulationQualityReport {
  isComplete: boolean;
  completenessScore: number; // 0-100
  issues: QualityIssue[];
  unansweredQuestions: string[];
  hasResolution: boolean;
  resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none';
  messageCount: number;
  ownerMessageCount: number;
  customerMessageCount: number;
  recommendation: 'extract' | 'review' | 'continue' | 'redo';
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export interface QualityIssue {
  severity: 'critical' | 'warning' | 'info';
  type: 'unanswered_questions' | 'no_resolution' | 'too_short' | 'imbalanced' | 'avoided_scenario';
  message: string;
  details?: any;
}

/**
 * Analyze simulation conversation quality
 * Returns detailed report with recommendations
 */
export function checkSimulationQuality(
  messages: any[],
  scenarioType: string
): SimulationQualityReport {
  const issues: QualityIssue[] = [];
  const unansweredQuestions: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // Separate messages by role
  const customerMessages = messages.filter(m => m.role === 'AI_CLIENT');
  const ownerMessages = messages.filter(m => m.role === 'BUSINESS_OWNER');

  // ==========================================
  // CHECK 1: Minimum message count
  // ==========================================
  if (messages.length < 8) {
    issues.push({
      severity: 'critical',
      type: 'too_short',
      message: `Only ${messages.length} messages exchanged (recommended: 8+)`,
      details: { actual: messages.length, minimum: 8 }
    });
    weaknesses.push('Conversation ended too quickly');
    suggestions.push('Practice longer conversations to demonstrate more patterns');
  } else if (messages.length >= 12) {
    strengths.push('Good conversation length with multiple exchanges');
  }

  // ==========================================
  // CHECK 2: Identify unanswered questions
  // ==========================================
  customerMessages.forEach((customerMsg) => {
    // Check if this message contains a question
    if (customerMsg.content && customerMsg.content.includes('?')) {
      // Simple heuristic: look for owner response that addresses the topic
      const questionContent = customerMsg.content.toLowerCase();

      // Extract key question topics
      const questionTopics = extractQuestionTopics(questionContent);

      if (questionTopics.length > 0) {
        // Check if any owner message addresses these topics
        const lastOwnerMsg = ownerMessages[ownerMessages.length - 1];
        const isAnswered =
          lastOwnerMsg &&
          questionTopics.some(topic =>
            lastOwnerMsg.content.toLowerCase().includes(topic)
          );

        if (!isAnswered) {
          unansweredQuestions.push(customerMsg.content);
        }
      }
    }
  });

  if (unansweredQuestions.length > 0) {
    const severity = unansweredQuestions.length >= 5 ? 'critical' : 'warning';

    issues.push({
      severity,
      type: 'unanswered_questions',
      message: `${unansweredQuestions.length} customer question(s) went unanswered`,
      details: { count: unansweredQuestions.length }
    });

    weaknesses.push(`Left ${unansweredQuestions.length} questions unanswered`);
    suggestions.push('Practice addressing every customer question directly');
  } else if (customerMessages.length > 0) {
    strengths.push('Addressed all customer questions');
  }

  // ==========================================
  // CHECK 3: Resolution detection
  // ==========================================
  const lastOwnerMessage = ownerMessages[ownerMessages.length - 1];
  const lastContent = lastOwnerMessage?.content.toLowerCase() || '';

  let hasResolution = false;
  let resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none' =
    'none';

  // Check for acceptance
  const acceptanceKeywords = [
    "let's do it",
    'sounds good',
    "i'd love to",
    'we can do that',
    'that works',
    'perfect',
    'great'
  ];

  // Check for rejection
  const rejectionKeywords = [
    "can't do",
    "won't work",
    'not a fit',
    'unable to',
    "can't help",
    'below our minimum',
    'decline'
  ];

  // Check for follow-up
  const followupKeywords = [
    'schedule',
    'meeting',
    'call',
    'discuss',
    'next steps',
    'follow up',
    'get back to you'
  ];

  if (acceptanceKeywords.some(kw => lastContent.includes(kw))) {
    hasResolution = true;
    resolutionType = 'accepted';
    strengths.push('Clearly indicated willingness to work with client');
  } else if (rejectionKeywords.some(kw => lastContent.includes(kw))) {
    hasResolution = true;
    resolutionType = 'rejected';
    strengths.push('Clearly declined the client with explanation');
  } else if (followupKeywords.some(kw => lastContent.includes(kw))) {
    hasResolution = true;
    resolutionType = 'scheduled_followup';
    strengths.push('Moved conversation toward next steps');
  }

  if (!hasResolution) {
    issues.push({
      severity: 'critical',
      type: 'no_resolution',
      message:
        'Conversation ended without clear resolution (yes/no/next steps)',
      details: { lastMessage: lastContent.substring(0, 100) }
    });
    weaknesses.push('No clear decision or next steps at end');
    suggestions.push(
      'Practice ending with clear decision: accept, decline, or schedule follow-up'
    );
  }

  // ==========================================
  // CHECK 4: Conversation balance
  // ==========================================
  const ratio = ownerMessages.length / Math.max(customerMessages.length, 1);

  if (ratio < 0.5) {
    issues.push({
      severity: 'warning',
      type: 'imbalanced',
      message: 'Owner is not talking enough relative to customer',
      details: { ownerRatio: ratio.toFixed(2), recommended: '0.8-1.2' }
    });
    weaknesses.push('Talked too little compared to customer');
    suggestions.push(
      'Practice engaging more - ask questions, provide detailed responses'
    );
  } else if (ratio > 2) {
    issues.push({
      severity: 'warning',
      type: 'imbalanced',
      message: 'Owner is talking too much relative to customer',
      details: { ownerRatio: ratio.toFixed(2), recommended: '0.8-1.2' }
    });
    weaknesses.push('Dominated the conversation - gave customer little chance to talk');
    suggestions.push('Practice listening more and letting customer express concerns');
  } else {
    strengths.push('Good conversation balance between owner and customer');
  }

  // ==========================================
  // CHECK 5: Scenario-specific requirements
  // ==========================================
  const scenarioRequirements = getScenarioRequirements(scenarioType);

  scenarioRequirements.forEach(req => {
    const isAddressed = messages.some(msg =>
      msg.content.toLowerCase().includes(req.keyword)
    );

    if (!isAddressed) {
      issues.push({
        severity: 'warning',
        type: 'avoided_scenario',
        message: `Scenario requires addressing: ${req.requirement}`,
        details: { scenario: scenarioType, requirement: req.requirement }
      });
      weaknesses.push(`Didn't address ${req.requirement}`);
      suggestions.push(`For ${scenarioType}: practice handling ${req.requirement}`);
    } else {
      strengths.push(`Addressed ${req.requirement}`);
    }
  });

  // ==========================================
  // CALCULATE COMPLETENESS SCORE
  // ==========================================
  let score = 50; // Base score

  // Message count (max +20)
  if (messages.length >= 8) score += 5;
  if (messages.length >= 12) score += 10;
  if (messages.length >= 16) score += 5;

  // Answered questions (max +20)
  if (unansweredQuestions.length === 0 && customerMessages.length > 0) {
    score += 20;
  } else if (unansweredQuestions.length <= 2) {
    score += 10;
  }

  // Resolution (max +20)
  if (hasResolution) {
    score += 20;
  }

  // Balance (max +10)
  if (ratio >= 0.8 && ratio <= 1.2) {
    score += 10;
  }

  // Cap at 100
  const completenessScore = Math.min(100, score);

  // ==========================================
  // DETERMINE RECOMMENDATION
  // ==========================================
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  let recommendation: 'extract' | 'review' | 'continue' | 'redo' = 'extract';

  if (criticalCount >= 2) {
    recommendation = 'redo';
  } else if (criticalCount === 1) {
    recommendation = 'review';
  } else if (completenessScore < 60) {
    recommendation = 'continue';
  } else {
    recommendation = 'extract';
  }

  return {
    isComplete: recommendation === 'extract' && completenessScore >= 60,
    completenessScore,
    issues,
    unansweredQuestions,
    hasResolution,
    resolutionType,
    messageCount: messages.length,
    ownerMessageCount: ownerMessages.length,
    customerMessageCount: customerMessages.length,
    recommendation,
    feedback: {
      strengths,
      weaknesses,
      suggestions
    }
  };
}

/**
 * Get requirements for specific scenario type
 */
function getScenarioRequirements(
  scenarioType: string
): Array<{ keyword: string; requirement: string }> {
  const requirements: Record<string, Array<{ keyword: string; requirement: string }>> = {
    PRICE_SENSITIVE: [
      { keyword: 'budget', requirement: 'budget discussion' },
      { keyword: 'price', requirement: 'pricing objection handling' }
    ],
    DEMANDING: [
      { keyword: 'quality', requirement: 'quality/premium concerns' },
      { keyword: 'daily', requirement: 'demanding client requirements' }
    ],
    INDECISIVE: [
      { keyword: 'hesit', requirement: 'reassurance and confidence building' },
      { keyword: 'decis', requirement: 'decision support' }
    ],
    TIME_PRESSURED: [
      { keyword: 'timeline', requirement: 'timeline/urgency discussion' },
      { keyword: 'quick', requirement: 'fast turnaround capability' }
    ],
    HIGH_BUDGET: [
      { keyword: 'scope', requirement: 'scope and expectations discussion' },
      { keyword: 'partner', requirement: 'partnership/long-term thinking' }
    ]
  };

  return requirements[scenarioType] || [];
}

/**
 * Extract question topics from question text
 */
function extractQuestionTopics(questionText: string): string[] {
  const topics: Record<string, string[]> = {
    portfolio: [
      'portfolio',
      'examples',
      'projects',
      'work',
      'case studies'
    ],
    experience: ['experience', 'years', 'background', 'expertise'],
    timeline: [
      'timeline',
      'deadline',
      'how long',
      'duration',
      'schedule'
    ],
    budget: ['budget', 'cost', 'price', 'how much', 'investment'],
    process: ['process', 'how do you', 'methodology', 'approach'],
    communication: ['communicate', 'update', 'daily', 'frequency'],
    references: ['reference', 'testimonial', 'client'],
    quality: ['quality', 'premium', 'value', 'guarantee']
  };

  const foundTopics: string[] = [];

  Object.entries(topics).forEach(([category, keywords]) => {
    if (keywords.some(keyword => questionText.includes(keyword))) {
      foundTopics.push(category);
    }
  });

  return foundTopics;
}

/**
 * Format quality report for human readability
 */
export function formatQualityReport(report: SimulationQualityReport): string {
  let output = `\n📊 SIMULATION QUALITY REPORT\n`;
  output += `${'='.repeat(50)}\n\n`;

  output += `Completeness: ${report.completenessScore}/100\n`;
  output += `Status: ${report.isComplete ? '✅ COMPLETE' : '⚠️  INCOMPLETE'}\n`;
  output += `Recommendation: ${report.recommendation.toUpperCase()}\n\n`;

  if (report.issues.length > 0) {
    output += `Issues (${report.issues.length}):\n`;
    report.issues.forEach(issue => {
      const icon = issue.severity === 'critical' ? '🔴' : '🟡';
      output += `  ${icon} ${issue.message}\n`;
    });
    output += '\n';
  }

  if (report.feedback.strengths.length > 0) {
    output += `Strengths:\n`;
    report.feedback.strengths.forEach(s => (output += `  ✅ ${s}\n`));
    output += '\n';
  }

  if (report.feedback.weaknesses.length > 0) {
    output += `Areas to Improve:\n`;
    report.feedback.weaknesses.forEach(w => (output += `  🔧 ${w}\n`));
    output += '\n';
  }

  if (report.feedback.suggestions.length > 0) {
    output += `Suggestions:\n`;
    report.feedback.suggestions.forEach(s => (output += `  💡 ${s}\n`));
    output += '\n';
  }

  return output;
}
