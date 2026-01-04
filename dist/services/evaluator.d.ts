/**
 * Tenets Evaluator Service
 * Core evaluation logic for scoring decisions against the 25 tenets
 */
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluation, AssessmentLevel, EvaluationDepth } from '../types.js';
export declare class Evaluator {
    private db;
    constructor(db: DatabaseManager);
    /**
     * Evaluate a decision against all tenets
     */
    evaluate(decisionText: string, options?: {
        context?: Record<string, unknown>;
        stakeholders?: string[];
        depth?: EvaluationDepth;
    }): Evaluation;
    /**
     * Score a single tenet against the decision text
     */
    private scoreTenet;
    /**
     * Run the 5 primary ethical tests
     */
    private runPrimaryTests;
    /**
     * Calculate overall assessment from scores and violations
     */
    private calculateAssessment;
    /**
     * Generate recommendations based on violations and scores
     */
    private generateRecommendations;
    /**
     * Extract keywords from a phrase for matching
     */
    private extractKeywords;
    /**
     * Check if text matches keywords
     */
    private matchesKeywords;
    /**
     * Calculate confidence score for counterfeit match
     */
    private calculateCounterfeitConfidence;
    /**
     * Determine if a tenet is relevant to the decision
     */
    private isTenetRelevant;
    /**
     * Calculate severity based on confidence and tenet category
     */
    private calculateSeverity;
    /**
     * Deep scoring for more nuanced evaluation
     */
    private deepScore;
    /**
     * Quick evaluation for simple decisions
     */
    quickEvaluate(decisionText: string): {
        assessment: AssessmentLevel;
        loveTestPassed: boolean;
        vulnerabilityTestPassed: boolean;
        counterfeitDetected: boolean;
    };
    /**
     * Evaluate against a specific tenet
     */
    evaluateAgainstTenet(decisionText: string, tenetId: number): {
        score: number;
        matches_criteria: string[];
        counterfeit_detected?: string;
        recommendation: string;
    };
}
