/**
 * Tenets Server Type Definitions
 * 25 Ethical Principles from Christ's Gospel Teachings
 */

// =============================================================================
// Tenet Types
// =============================================================================

export type TenetCategory = 'foundation' | 'action' | 'character' | 'community' | 'restoration';

/**
 * A single tenet with full details
 */
export interface Tenet {
  id: number;
  name: string;
  definition: string;
  scripture_anchors: string[];
  decision_criteria: string[];
  counterfeits: string[];
  sub_tenets: string[] | null;
  transformation_pattern: string;
  category: TenetCategory;
  created_at: number;
}

/**
 * Tenet summary for listing
 */
export interface TenetSummary {
  id: number;
  name: string;
  category: TenetCategory;
  core_test: string;
}

// =============================================================================
// Evaluation Types
// =============================================================================

export type AssessmentLevel = 'affirm' | 'caution' | 'reject';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type EvaluationDepth = 'quick' | 'standard' | 'deep';

/**
 * Result of evaluating a decision against tenets
 */
export interface Evaluation {
  id: string;
  decision_text: string;
  context?: Record<string, unknown>;
  stakeholders?: string[];
  overall_assessment: AssessmentLevel;
  tenet_scores: Record<number, number>;  // tenet_id -> score (0-1)
  violations: Violation[];
  counterfeits_matched: CounterfeitMatch[];
  recommendations: string[];
  depth: EvaluationDepth;
  created_at: number;
}

/**
 * A specific violation of a tenet
 */
export interface Violation {
  id: string;
  evaluation_id: string;
  tenet_id: number;
  tenet_name?: string;
  severity: Severity;
  description: string;
  counterfeit_pattern?: string;
  remediation_applied?: string;
  resolved_at?: number;
  created_at: number;
}

/**
 * When an action matches a counterfeit pattern
 */
export interface CounterfeitMatch {
  tenet_id: number;
  tenet_name: string;
  counterfeit_pattern: string;
  confidence: number;
  explanation: string;
}

/**
 * An ethical blind spot in a plan
 */
export interface BlindSpot {
  area: string;
  description: string;
  severity: Severity;
  missing_tenet?: string;
  recommendation: string;
}

/**
 * A detected pattern in evaluations
 */
export interface Pattern {
  id: string;
  pattern_type: 'violation' | 'success' | 'counterfeit' | 'blind_spot';
  description: string;
  related_tenets: number[];
  frequency: number;
  last_seen: number;
  confidence: number;
  created_at: number;
}

// =============================================================================
// Tool Input Types
// =============================================================================

export interface EvaluateDecisionInput {
  decision_text: string;
  context?: Record<string, unknown>;
  stakeholders?: string[];
  depth?: EvaluationDepth;
}

export interface EvaluateDecisionOutput {
  evaluation_id: string;
  overall_assessment: AssessmentLevel;
  tenet_scores: Record<number, number>;
  violations: Violation[];
  counterfeits_matched: CounterfeitMatch[];
  recommendations: string[];
}

export interface CheckCounterfeitInput {
  action_description: string;
  claimed_tenet?: string;
}

export interface CheckCounterfeitOutput {
  is_counterfeit: boolean;
  matched_counterfeits: CounterfeitMatch[];
  authentic_alternative?: string;
  explanation: string;
}

export interface IdentifyBlindSpotsInput {
  plan_text: string;
  scope?: 'stakeholders' | 'harms' | 'tenets' | 'all';
}

export interface IdentifyBlindSpotsOutput {
  blind_spots: BlindSpot[];
  missing_stakeholders: string[];
  unaddressed_harms: string[];
  recommendations: string[];
}

export interface RecordEvaluationInput {
  decision_id: string;
  assessment: AssessmentLevel;
  violations?: string[];
  notes?: string;
}

export interface RecordEvaluationOutput {
  recorded: true;
  evaluation_id: string;
  patterns_triggered: string[];
}

export interface GetEvaluationHistoryInput {
  tenet_filter?: string;
  assessment_filter?: AssessmentLevel;
  time_range?: '24h' | '7d' | '30d' | 'all';
  limit?: number;
}

export interface GetEvaluationHistoryOutput {
  evaluations: Evaluation[];
  count: number;
  violation_patterns: Pattern[];
}

export interface GetTenetInput {
  tenet_name?: string;
  tenet_id?: number;
}

export interface ListTenetsInput {
  category?: TenetCategory;
}

export interface ListTenetsOutput {
  tenets: TenetSummary[];
  count: number;
}

export interface SuggestRemediationInput {
  violation_description: string;
  tenet_violated: string;
  context?: Record<string, unknown>;
}

export interface SuggestRemediationOutput {
  remediation_steps: string[];
  scripture_guidance: string;
  transformation_path: string;
  related_tenets: string[];
}

// =============================================================================
// InterLock Signal Types
// =============================================================================

export const SignalTypes = {
  // Core signals (ecosystem aligned)
  DOCK_REQUEST: 0x01,
  DOCK_APPROVE: 0x02,
  DOCK_REJECT: 0x03,
  HEARTBEAT: 0x04,
  DISCONNECT: 0x05,

  // Incoming signals
  DECISION_PENDING: 0xD0,
  OPERATION_COMPLETE: 0xDF,  // Moved from 0xFF to avoid conflict
  LESSON_LEARNED: 0xE5,

  // Cognitive-AstroSentry integration signals
  ASTROSENTRY_EVENT: 0xE6,        // AstroSentry → Cognitive: Report operation outcome
  COGNITIVE_INSIGHT: 0xE7,        // Cognitive → AstroSentry: Pattern/recommendation
  ETHICAL_CHECK_REQUEST: 0xE8,    // AstroSentry → tenets-server: Request ethical evaluation
  ETHICAL_CHECK_RESPONSE: 0xE9,   // tenets-server → AstroSentry: Ethical verdict
  EXPERIENCE_QUERY: 0xEA,         // Any → experience-layer: Query historical patterns
  EXPERIENCE_RESPONSE: 0xEB,      // experience-layer → Requester: Historical data response

  // Outgoing signals
  TENET_VIOLATION: 0xB0,
  COUNTERFEIT_DETECTED: 0xB1,
  ETHICS_AFFIRMED: 0xB2,
  BLIND_SPOT_ALERT: 0xB3,
  REMEDIATION_NEEDED: 0xB4,
} as const;

export type SignalCode = typeof SignalTypes[keyof typeof SignalTypes];

export interface Signal {
  code: number;
  name: string;
  sender: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// =============================================================================
// Database Row Types
// =============================================================================

export interface TenetRow {
  id: number;
  name: string;
  definition: string;
  scripture_anchors: string;  // JSON
  decision_criteria: string;  // JSON
  counterfeits: string;       // JSON
  sub_tenets: string | null;  // JSON
  transformation_pattern: string;
  category: string;
  created_at: number;
}

export interface EvaluationRow {
  id: string;
  decision_text: string;
  context: string | null;        // JSON
  stakeholders: string | null;   // JSON
  overall_assessment: string;
  tenet_scores: string;          // JSON
  violations: string | null;     // JSON
  counterfeits_matched: string | null;  // JSON
  recommendations: string | null;       // JSON
  depth: string;
  created_at: number;
}

export interface ViolationRow {
  id: string;
  evaluation_id: string;
  tenet_id: number;
  severity: string;
  description: string;
  counterfeit_pattern: string | null;
  remediation_applied: string | null;
  resolved_at: number | null;
  created_at: number;
}

export interface PatternRow {
  id: string;
  pattern_type: string;
  description: string;
  related_tenets: string | null;  // JSON
  frequency: number;
  last_seen: number;
  confidence: number;
  created_at: number;
}

// =============================================================================
// Configuration
// =============================================================================

export const TENETS_CONFIG = {
  // Assessment thresholds
  AFFIRM_THRESHOLD: 0.7,
  CAUTION_THRESHOLD: 0.4,

  // Counterfeit detection
  COUNTERFEIT_CONFIDENCE_THRESHOLD: 0.6,
  MAX_COUNTERFEITS_BEFORE_REJECT: 2,

  // Scoring weights
  CRITERIA_MATCH_BONUS: 0.1,
  COUNTERFEIT_PENALTY: 0.2,
  GAP_PENALTY: 0.15,

  // Primary evaluation tests
  PRIMARY_TESTS: [
    'love',
    'vulnerability',
    'counterfeit',
    'systemic',
    'transformation'
  ]
} as const;

// Confidence bounds (Linus audit recommendation)
export const MAX_CONFIDENCE = 0.95;
export const MIN_CONFIDENCE = 0.05;

/**
 * Clamp confidence to valid bounds [MIN_CONFIDENCE, MAX_CONFIDENCE]
 * Prevents unbounded confidence growth
 */
export function clampConfidence(value: number): number {
  return Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, value));
}

// =============================================================================
// Utility Types
// =============================================================================

export interface Stats {
  totalTenets: number;
  totalEvaluations: number;
  affirmCount: number;
  cautionCount: number;
  rejectCount: number;
  totalViolations: number;
  violationsByTenet: Record<string, number>;
  patternCount: number;
}
