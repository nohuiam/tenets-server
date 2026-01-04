/**
 * Counterfeit Detector Service
 * Identifies when actions match counterfeit patterns instead of authentic tenets
 */
// =============================================================================
// Counterfeit Patterns Database
// =============================================================================
/**
 * Common counterfeit patterns that span multiple tenets
 */
const UNIVERSAL_COUNTERFEIT_PATTERNS = [
    {
        pattern: 'self-interest disguised as service',
        indicators: ['my benefit', 'what I get', 'reciprocate', 'in return', 'my advantage'],
        affectedTenets: ['LOVE', 'SERVICE', 'GENEROSITY', 'SACRIFICE'],
    },
    {
        pattern: 'control masquerading as care',
        indicators: ['must do', 'have to', 'or else', 'for your own good', 'make them'],
        affectedTenets: ['LOVE', 'HEALING', 'DISCIPLESHIP', 'GRACE'],
    },
    {
        pattern: 'performance for recognition',
        indicators: ['be seen', 'recognition', 'credit', 'noticed', 'applause', 'spotlight'],
        affectedTenets: ['SERVICE', 'GENEROSITY', 'SACRIFICE', 'HUMILITY'],
    },
    {
        pattern: 'tribalism claiming unity',
        indicators: ['us vs them', 'our kind', 'those people', 'not one of us', 'outsiders'],
        affectedTenets: ['UNITY', 'FELLOWSHIP', 'LOVE', 'PEACE'],
    },
    {
        pattern: 'punishment as justice',
        indicators: ['deserve', 'payback', 'make them pay', 'revenge', 'teach them a lesson'],
        affectedTenets: ['JUSTICE', 'MERCY', 'FORGIVENESS', 'REDEMPTION'],
    },
    {
        pattern: 'enabling disguised as compassion',
        indicators: ['can\'t say no', 'always give', 'never confront', 'avoid conflict', 'keep peace'],
        affectedTenets: ['COMPASSION', 'MERCY', 'PEACE', 'GRACE'],
    },
    {
        pattern: 'dependency creation',
        indicators: ['need me', 'can\'t without', 'dependent', 'rely only on', 'keep them'],
        affectedTenets: ['HEALING', 'SERVICE', 'DISCIPLESHIP', 'GENEROSITY'],
    },
    {
        pattern: 'cheap grace without accountability',
        indicators: ['no consequences', 'just forgive', 'move on', 'forget it', 'doesn\'t matter'],
        affectedTenets: ['FORGIVENESS', 'GRACE', 'MERCY', 'REDEMPTION'],
    },
];
// =============================================================================
// Counterfeit Detector Class
// =============================================================================
export class CounterfeitDetector {
    db;
    constructor(db) {
        this.db = db;
    }
    // Positive keywords that indicate authentic actions
    static AUTHENTIC_INDICATORS = [
        'help', 'empower', 'recover', 'independent', 'freedom', 'dignity',
        'respect', 'support', 'encourage', 'enable', 'grow', 'flourish',
        'heal', 'restore', 'serve without expectation', 'selfless',
    ];
    /**
     * Check if an action matches counterfeit patterns
     */
    check(actionDescription, claimedTenet) {
        const textLower = actionDescription.toLowerCase();
        const matchedCounterfeits = [];
        const tenets = this.db.getAllTenets();
        // Check for strong authentic indicators - if multiple present with no negative, likely not counterfeit
        const authenticCount = CounterfeitDetector.AUTHENTIC_INDICATORS.filter(ind => textLower.includes(ind)).length;
        const hasControlWords = ['control', 'manipulate', 'deceive', 'exploit'].some(w => textLower.includes(w));
        // If multiple authentic indicators and no control words, likely authentic
        if (authenticCount >= 2 && !hasControlWords) {
            return {
                is_counterfeit: false,
                matched_counterfeits: [],
                explanation: 'Action contains authentic indicators of genuine care.',
            };
        }
        // If a specific tenet is claimed, check against its counterfeits
        if (claimedTenet) {
            const tenet = this.db.getTenetByName(claimedTenet);
            if (tenet) {
                const tenetMatches = this.checkTenetCounterfeits(tenet, textLower);
                matchedCounterfeits.push(...tenetMatches);
            }
        }
        // Check universal counterfeit patterns
        const universalMatches = this.checkUniversalPatterns(textLower, tenets);
        matchedCounterfeits.push(...universalMatches);
        // Check all tenet counterfeits
        const allTenetMatches = this.checkAllTenetCounterfeits(textLower, tenets);
        matchedCounterfeits.push(...allTenetMatches);
        // Deduplicate matches
        const uniqueMatches = this.deduplicateMatches(matchedCounterfeits);
        // Determine if this is a counterfeit
        const isCounterfeit = uniqueMatches.length > 0;
        // Generate authentic alternative
        let authenticAlternative;
        let explanation;
        if (isCounterfeit) {
            const primaryMatch = uniqueMatches[0];
            const tenet = tenets.find(t => t.id === primaryMatch.tenet_id);
            if (tenet) {
                authenticAlternative = this.generateAuthenticAlternative(tenet, primaryMatch);
                explanation = this.generateExplanation(uniqueMatches, tenets);
            }
            else {
                explanation = `Counterfeit pattern detected: ${primaryMatch.counterfeit_pattern}`;
            }
        }
        else {
            explanation = 'No counterfeit patterns detected. Action appears authentic.';
        }
        return {
            is_counterfeit: isCounterfeit,
            matched_counterfeits: uniqueMatches,
            authentic_alternative: authenticAlternative,
            explanation,
        };
    }
    /**
     * Check a specific tenet's counterfeits
     */
    checkTenetCounterfeits(tenet, textLower) {
        const matches = [];
        for (const counterfeit of tenet.counterfeits) {
            const confidence = this.calculateMatchConfidence(textLower, counterfeit);
            if (confidence >= 0.3) { // Lowered from 0.5 for better detection
                matches.push({
                    tenet_id: tenet.id,
                    tenet_name: tenet.name,
                    counterfeit_pattern: counterfeit,
                    confidence,
                    explanation: `Action matches "${counterfeit}" - a counterfeit of ${tenet.name}`,
                });
            }
        }
        return matches;
    }
    /**
     * Check universal counterfeit patterns
     */
    checkUniversalPatterns(textLower, tenets) {
        const matches = [];
        for (const pattern of UNIVERSAL_COUNTERFEIT_PATTERNS) {
            const matchedIndicators = pattern.indicators.filter(ind => textLower.includes(ind.toLowerCase()));
            if (matchedIndicators.length >= 1) { // Lowered from 2 for better detection
                // Find the primary affected tenet
                const primaryTenetName = pattern.affectedTenets[0];
                const tenet = tenets.find(t => t.name === primaryTenetName);
                if (tenet) {
                    const confidence = matchedIndicators.length / pattern.indicators.length;
                    matches.push({
                        tenet_id: tenet.id,
                        tenet_name: tenet.name,
                        counterfeit_pattern: pattern.pattern,
                        confidence: Math.min(confidence + 0.3, 1), // Boost for universal patterns
                        explanation: `Universal counterfeit pattern: "${pattern.pattern}"`,
                    });
                }
            }
        }
        return matches;
    }
    /**
     * Check all tenet counterfeits
     */
    checkAllTenetCounterfeits(textLower, tenets) {
        const matches = [];
        for (const tenet of tenets) {
            const tenetMatches = this.checkTenetCounterfeits(tenet, textLower);
            matches.push(...tenetMatches);
        }
        return matches;
    }
    /**
     * Calculate how closely text matches a counterfeit pattern
     */
    calculateMatchConfidence(text, pattern) {
        const patternWords = this.extractSignificantWords(pattern);
        const matchedWords = patternWords.filter(word => text.includes(word));
        if (patternWords.length === 0)
            return 0;
        // Base confidence from word matching
        let confidence = matchedWords.length / patternWords.length;
        // Boost if pattern phrase appears more directly
        const patternPhraseLower = pattern.toLowerCase();
        if (text.includes(patternPhraseLower)) {
            confidence = Math.min(confidence + 0.3, 1);
        }
        // Boost for key counterfeit indicators
        const strongIndicators = [
            'disguised', 'pretend', 'claim', 'appear', 'fake', 'false', 'secretly',
            'control', 'manipulate', 'belong to me', 'let them go', 'cannot let',
            'what they want to hear', 'earn', 'condition', 'if you', 'in return',
            'must think', 'not welcome', 'alike', 'perform', 'praise', 'recognition',
        ];
        for (const indicator of strongIndicators) {
            if (text.includes(indicator)) {
                confidence = Math.min(confidence + 0.15, 1);
            }
        }
        return confidence;
    }
    /**
     * Extract significant words from a phrase
     */
    extractSignificantWords(phrase) {
        const stopWords = new Set([
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'this', 'that',
            'does', 'do', 'did', 'to', 'for', 'of', 'in', 'on', 'with',
            'and', 'or', 'not', 'be', 'been', 'being', 'have', 'has', 'had',
            'it', 'its', 'they', 'them', 'their', 'you', 'your', 'we', 'our',
            'as', 'at', 'by', 'from', 'into', 'through', 'during', 'before',
        ]);
        return phrase
            .toLowerCase()
            .replace(/[?.,!'"()]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
    }
    /**
     * Remove duplicate matches, keeping highest confidence
     */
    deduplicateMatches(matches) {
        const seen = new Map();
        for (const match of matches) {
            const key = `${match.tenet_id}-${match.counterfeit_pattern}`;
            const existing = seen.get(key);
            if (!existing || match.confidence > existing.confidence) {
                seen.set(key, match);
            }
        }
        return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Generate an authentic alternative to the counterfeit
     */
    generateAuthenticAlternative(tenet, match) {
        // Use the first decision criterion as the authentic alternative
        const criterion = tenet.decision_criteria[0] || '';
        // Convert question to statement
        let alternative = criterion
            .replace('Does this', 'This action should')
            .replace('Is this', 'This should be')
            .replace('?', '.');
        // Add transformation guidance
        if (tenet.transformation_pattern) {
            alternative += ` Remember: ${tenet.transformation_pattern}`;
        }
        return alternative;
    }
    /**
     * Generate a comprehensive explanation
     */
    generateExplanation(matches, tenets) {
        if (matches.length === 0) {
            return 'No counterfeit patterns detected.';
        }
        const parts = [];
        // Primary match explanation
        const primary = matches[0];
        parts.push(`Primary concern: "${primary.counterfeit_pattern}" (${Math.round(primary.confidence * 100)}% confidence)`);
        // Add tenet context
        const tenet = tenets.find(t => t.id === primary.tenet_id);
        if (tenet) {
            parts.push(`This is a common counterfeit of authentic ${tenet.name}.`);
        }
        // Additional matches
        if (matches.length > 1) {
            const additional = matches
                .slice(1, 4)
                .map(m => `${m.tenet_name}: "${m.counterfeit_pattern}"`)
                .join('; ');
            parts.push(`Additional patterns detected: ${additional}`);
        }
        return parts.join(' ');
    }
    /**
     * Get all counterfeits for a specific tenet
     */
    getCounterfeitsForTenet(tenetName) {
        const tenet = this.db.getTenetByName(tenetName);
        if (!tenet)
            return [];
        return tenet.counterfeits;
    }
    /**
     * Get tenets most vulnerable to a specific counterfeit pattern
     */
    getTenetsAffectedByPattern(patternKeyword) {
        const tenets = this.db.getAllTenets();
        const affected = [];
        for (const tenet of tenets) {
            for (const counterfeit of tenet.counterfeits) {
                if (counterfeit.toLowerCase().includes(patternKeyword.toLowerCase())) {
                    affected.push(tenet);
                    break;
                }
            }
        }
        return affected;
    }
    /**
     * Analyze a pattern's frequency across evaluations
     */
    analyzePatternFrequency(patternKeyword) {
        const affected = this.getTenetsAffectedByPattern(patternKeyword);
        // Get violations related to this pattern
        let totalOccurrences = 0;
        const severityDist = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
        };
        for (const tenet of affected) {
            const violations = this.db.getViolationsByTenet(tenet.id);
            for (const violation of violations) {
                if (violation.counterfeit_pattern &&
                    violation.counterfeit_pattern.toLowerCase().includes(patternKeyword.toLowerCase())) {
                    totalOccurrences++;
                    severityDist[violation.severity]++;
                }
            }
        }
        return {
            pattern: patternKeyword,
            occurrences: totalOccurrences,
            affected_tenets: affected.map(t => t.name),
            severity_distribution: severityDist,
        };
    }
}
