/**
 * Tenets Server Type Definitions
 * 25 Ethical Principles from Christ's Gospel Teachings
 */
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
    tenet_scores: Record<number, number>;
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
export declare const SignalTypes: {
    readonly DOCK_REQUEST: 1;
    readonly DOCK_APPROVE: 2;
    readonly DOCK_REJECT: 3;
    readonly HEARTBEAT: 4;
    readonly DISCONNECT: 5;
    readonly DECISION_PENDING: 208;
    readonly OPERATION_COMPLETE: 223;
    readonly LESSON_LEARNED: 229;
    readonly TENET_VIOLATION: 176;
    readonly COUNTERFEIT_DETECTED: 177;
    readonly ETHICS_AFFIRMED: 178;
    readonly BLIND_SPOT_ALERT: 179;
    readonly REMEDIATION_NEEDED: 180;
};
export type SignalCode = typeof SignalTypes[keyof typeof SignalTypes];
export interface Signal {
    code: number;
    name: string;
    sender: string;
    timestamp: number;
    data?: Record<string, unknown>;
}
export interface TenetRow {
    id: number;
    name: string;
    definition: string;
    scripture_anchors: string;
    decision_criteria: string;
    counterfeits: string;
    sub_tenets: string | null;
    transformation_pattern: string;
    category: string;
    created_at: number;
}
export interface EvaluationRow {
    id: string;
    decision_text: string;
    context: string | null;
    stakeholders: string | null;
    overall_assessment: string;
    tenet_scores: string;
    violations: string | null;
    counterfeits_matched: string | null;
    recommendations: string | null;
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
    related_tenets: string | null;
    frequency: number;
    last_seen: number;
    confidence: number;
    created_at: number;
}
export declare const TENETS_CONFIG: {
    readonly AFFIRM_THRESHOLD: 0.7;
    readonly CAUTION_THRESHOLD: 0.4;
    readonly COUNTERFEIT_CONFIDENCE_THRESHOLD: 0.6;
    readonly MAX_COUNTERFEITS_BEFORE_REJECT: 2;
    readonly CRITERIA_MATCH_BONUS: 0.1;
    readonly COUNTERFEIT_PENALTY: 0.2;
    readonly GAP_PENALTY: 0.15;
    readonly PRIMARY_TESTS: readonly ["love", "vulnerability", "counterfeit", "systemic", "transformation"];
};
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
