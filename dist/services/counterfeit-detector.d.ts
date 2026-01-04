/**
 * Counterfeit Detector Service
 * Identifies when actions match counterfeit patterns instead of authentic tenets
 */
import type { DatabaseManager } from '../database/schema.js';
import type { Tenet, CounterfeitMatch } from '../types.js';
export declare class CounterfeitDetector {
    private db;
    constructor(db: DatabaseManager);
    private static readonly AUTHENTIC_INDICATORS;
    /**
     * Check if an action matches counterfeit patterns
     */
    check(actionDescription: string, claimedTenet?: string): {
        is_counterfeit: boolean;
        matched_counterfeits: CounterfeitMatch[];
        authentic_alternative?: string;
        explanation: string;
    };
    /**
     * Check a specific tenet's counterfeits
     */
    private checkTenetCounterfeits;
    /**
     * Check universal counterfeit patterns
     */
    private checkUniversalPatterns;
    /**
     * Check all tenet counterfeits
     */
    private checkAllTenetCounterfeits;
    /**
     * Calculate how closely text matches a counterfeit pattern
     */
    private calculateMatchConfidence;
    /**
     * Extract significant words from a phrase
     */
    private extractSignificantWords;
    /**
     * Remove duplicate matches, keeping highest confidence
     */
    private deduplicateMatches;
    /**
     * Generate an authentic alternative to the counterfeit
     */
    private generateAuthenticAlternative;
    /**
     * Generate a comprehensive explanation
     */
    private generateExplanation;
    /**
     * Get all counterfeits for a specific tenet
     */
    getCounterfeitsForTenet(tenetName: string): string[];
    /**
     * Get tenets most vulnerable to a specific counterfeit pattern
     */
    getTenetsAffectedByPattern(patternKeyword: string): Tenet[];
    /**
     * Analyze a pattern's frequency across evaluations
     */
    analyzePatternFrequency(patternKeyword: string): {
        pattern: string;
        occurrences: number;
        affected_tenets: string[];
        severity_distribution: Record<string, number>;
    };
}
