/**
 * Tenets Evaluator Service
 * Core evaluation logic for scoring decisions against the 25 tenets
 */
// =============================================================================
// Constants
// =============================================================================
const CONFIG = {
    AFFIRM_THRESHOLD: 0.65, // Slightly lower to account for averaging
    CAUTION_THRESHOLD: 0.4,
    COUNTERFEIT_CONFIDENCE_THRESHOLD: 0.45, // Balanced for detection
    MAX_COUNTERFEITS_BEFORE_REJECT: 2,
    CRITERIA_MATCH_BONUS: 0.1,
    COUNTERFEIT_PENALTY: 0.15, // Reduced penalty to avoid over-rejection
    GAP_PENALTY: 0.08, // Reduced from 0.15
};
// Primary test keywords for quick scoring
const PRIMARY_TESTS = {
    love: ['highest good', 'others', 'care', 'sacrifice', 'vulnerable', 'love'],
    vulnerability: ['protect', 'exploit', 'vulnerable', 'marginalized', 'powerless'],
    counterfeit: ['manipulate', 'control', 'transactional', 'strings attached', 'self-interest'],
    systemic: ['root cause', 'system', 'structural', 'address', 'underlying'],
    transformation: ['empower', 'dependency', 'enable', 'transform', 'agency'],
};
// Positive indicator keywords that boost scores
const POSITIVE_KEYWORDS = [
    'love', 'help', 'care', 'serve', 'protect', 'heal', 'forgive', 'mercy',
    'compassion', 'justice', 'truth', 'humble', 'faith', 'hope', 'generous',
    'peace', 'unity', 'grace', 'dignity', 'empower', 'sacrifice', 'good',
];
// Negative indicator keywords that reduce scores
const NEGATIVE_KEYWORDS = [
    'exploit', 'manipulate', 'control', 'deceive', 'harm', 'selfish',
    'greedy', 'destroy', 'corrupt', 'oppress', 'abuse', 'trick', 'betray',
];
// =============================================================================
// Evaluator Class
// =============================================================================
export class Evaluator {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Evaluate a decision against all tenets
     */
    evaluate(decisionText, options = {}) {
        const depth = options.depth || 'standard';
        const tenets = this.db.getAllTenets();
        const textLower = decisionText.toLowerCase();
        // Score each tenet
        const tenetScores = {};
        const violations = [];
        const counterfeitMatches = [];
        for (const tenet of tenets) {
            const result = this.scoreTenet(tenet, textLower, depth);
            tenetScores[tenet.id] = result.score;
            if (result.violation) {
                violations.push(result.violation);
            }
            if (result.counterfeitMatch) {
                counterfeitMatches.push(result.counterfeitMatch);
            }
        }
        // Run primary tests
        const primaryTestResults = this.runPrimaryTests(textLower);
        // Calculate overall assessment
        const assessment = this.calculateAssessment(tenetScores, violations, counterfeitMatches, primaryTestResults);
        // Generate recommendations
        const recommendations = this.generateRecommendations(violations, counterfeitMatches, tenetScores, tenets);
        // Store the evaluation
        const evaluation = this.db.insertEvaluation({
            decision_text: decisionText,
            context: options.context,
            stakeholders: options.stakeholders,
            overall_assessment: assessment,
            tenet_scores: tenetScores,
            violations,
            counterfeits_matched: counterfeitMatches,
            recommendations,
            depth,
        });
        // Store violations in separate table for tracking
        for (const violation of violations) {
            this.db.insertViolation({
                evaluation_id: evaluation.id,
                tenet_id: violation.tenet_id,
                severity: violation.severity,
                description: violation.description,
                counterfeit_pattern: violation.counterfeit_pattern,
            });
        }
        return evaluation;
    }
    /**
     * Score a single tenet against the decision text
     */
    scoreTenet(tenet, textLower, depth) {
        let score = 0.5; // Start neutral
        let violation;
        let counterfeitMatch;
        // Apply positive/negative indicator modifiers
        const positiveCount = POSITIVE_KEYWORDS.filter(kw => textLower.includes(kw)).length;
        const negativeCount = NEGATIVE_KEYWORDS.filter(kw => textLower.includes(kw)).length;
        score += positiveCount * 0.03; // Small boost per positive word
        score -= negativeCount * 0.05; // Slightly larger penalty per negative word
        // Check decision criteria alignment
        let criteriaMatches = 0;
        for (const criterion of tenet.decision_criteria) {
            const keywords = this.extractKeywords(criterion);
            if (this.matchesKeywords(textLower, keywords)) {
                criteriaMatches++;
                score += CONFIG.CRITERIA_MATCH_BONUS;
            }
        }
        // Check for counterfeit patterns
        for (const counterfeit of tenet.counterfeits) {
            const counterfeitLower = counterfeit.toLowerCase();
            const keywords = this.extractKeywords(counterfeit);
            const confidence = this.calculateCounterfeitConfidence(textLower, keywords, counterfeitLower);
            if (confidence >= CONFIG.COUNTERFEIT_CONFIDENCE_THRESHOLD) {
                score -= CONFIG.COUNTERFEIT_PENALTY;
                counterfeitMatch = {
                    tenet_id: tenet.id,
                    tenet_name: tenet.name,
                    counterfeit_pattern: counterfeit,
                    confidence,
                    explanation: `Decision text matches counterfeit pattern: "${counterfeit}"`,
                };
                // Create violation for counterfeit match
                violation = {
                    id: '',
                    evaluation_id: '',
                    tenet_id: tenet.id,
                    tenet_name: tenet.name,
                    severity: this.calculateSeverity(confidence, tenet.category),
                    description: `Counterfeit pattern detected for ${tenet.name}: ${counterfeit}`,
                    counterfeit_pattern: counterfeit,
                    created_at: Date.now(),
                };
                break; // Only report first counterfeit match per tenet
            }
        }
        // Apply gap penalty if no criteria matched and tenet is relevant
        if (criteriaMatches === 0 && this.isTenetRelevant(tenet, textLower)) {
            score -= CONFIG.GAP_PENALTY;
        }
        // Deep evaluation adds more nuanced scoring
        if (depth === 'deep') {
            score = this.deepScore(tenet, textLower, score);
        }
        // Clamp score between 0 and 1
        score = Math.max(0, Math.min(1, score));
        return { score, violation, counterfeitMatch };
    }
    /**
     * Run the 5 primary ethical tests
     */
    runPrimaryTests(textLower) {
        const results = {};
        for (const [testName, keywords] of Object.entries(PRIMARY_TESTS)) {
            // Check for positive indicators
            const hasPositive = keywords.some(kw => textLower.includes(kw));
            // For counterfeit test, true means counterfeit detected (bad)
            if (testName === 'counterfeit') {
                results[testName] = hasPositive;
            }
            else {
                results[testName] = hasPositive;
            }
        }
        return results;
    }
    /**
     * Calculate overall assessment from scores and violations
     */
    calculateAssessment(tenetScores, violations, counterfeitMatches, primaryTests) {
        // Check for critical violations
        const criticalViolations = violations.filter(v => v.severity === 'critical');
        if (criticalViolations.length > 0) {
            return 'reject';
        }
        // Check counterfeit threshold
        if (counterfeitMatches.length >= CONFIG.MAX_COUNTERFEITS_BEFORE_REJECT) {
            return 'reject';
        }
        // Check for high-severity violations
        const highViolations = violations.filter(v => v.severity === 'high');
        if (highViolations.length > 0) {
            return 'caution';
        }
        // Calculate average score
        const scores = Object.values(tenetScores);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        // Count how many primary tests passed (positive indicators)
        const passedTests = Object.entries(primaryTests)
            .filter(([key, value]) => key !== 'counterfeit' && value)
            .length;
        // If love and vulnerability tests pass AND no violations, affirm even with lower avgScore
        if (primaryTests.love && primaryTests.vulnerability && violations.length === 0 && !primaryTests.counterfeit) {
            return 'affirm';
        }
        // If most primary tests pass and no counterfeit, affirm
        if (passedTests >= 3 && !primaryTests.counterfeit && violations.length === 0) {
            return 'affirm';
        }
        if (avgScore >= CONFIG.AFFIRM_THRESHOLD && violations.length === 0) {
            return 'affirm';
        }
        if (avgScore < CONFIG.CAUTION_THRESHOLD) {
            return 'caution';
        }
        // Default to caution for borderline cases
        return 'caution';
    }
    /**
     * Generate recommendations based on violations and scores
     */
    generateRecommendations(violations, counterfeitMatches, tenetScores, tenets) {
        const recommendations = [];
        // Address violations first
        for (const violation of violations) {
            const tenet = tenets.find(t => t.id === violation.tenet_id);
            if (tenet) {
                recommendations.push(`Address ${tenet.name} violation: Review decision against "${tenet.decision_criteria[0]}"`);
            }
        }
        // Address counterfeit patterns
        for (const match of counterfeitMatches) {
            recommendations.push(`Avoid counterfeit pattern "${match.counterfeit_pattern}". Consider authentic ${match.tenet_name} instead.`);
        }
        // Suggest improvement for low-scoring tenets
        const lowScoreTenets = tenets.filter(t => tenetScores[t.id] < 0.4);
        for (const tenet of lowScoreTenets.slice(0, 3)) {
            recommendations.push(`Strengthen ${tenet.name}: ${tenet.transformation_pattern}`);
        }
        return recommendations;
    }
    /**
     * Extract keywords from a phrase for matching
     */
    extractKeywords(phrase) {
        const stopWords = new Set([
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'this', 'that',
            'does', 'do', 'did', 'to', 'for', 'of', 'in', 'on', 'with',
            'and', 'or', 'not', 'be', 'been', 'being', 'have', 'has', 'had',
            'it', 'its', 'they', 'them', 'their', 'you', 'your', 'we', 'our',
        ]);
        return phrase
            .toLowerCase()
            .replace(/[?.,!'"()]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
    }
    /**
     * Check if text matches keywords
     */
    matchesKeywords(text, keywords) {
        const matchCount = keywords.filter(kw => text.includes(kw)).length;
        return matchCount >= Math.ceil(keywords.length * 0.3); // 30% keyword match
    }
    /**
     * Calculate confidence score for counterfeit match
     */
    calculateCounterfeitConfidence(text, keywords, patternLower) {
        const matchCount = keywords.filter(kw => text.includes(kw)).length;
        if (keywords.length === 0)
            return 0;
        let confidence = matchCount / keywords.length;
        // Boost for specific counterfeit phrases
        const counterfeitPhrases = [
            'control', 'for their own good', 'for your own good',
            'manipulate', 'make them', 'every aspect',
            'in return', 'reciprocate', 'strings attached',
            'belong to me', 'cannot let them go',
        ];
        for (const phrase of counterfeitPhrases) {
            if (text.includes(phrase)) {
                confidence = Math.min(confidence + 0.2, 1);
            }
        }
        // Check if pattern phrase itself appears
        if (text.includes(patternLower.slice(0, 20))) { // First 20 chars of pattern
            confidence = Math.min(confidence + 0.3, 1);
        }
        return confidence;
    }
    /**
     * Determine if a tenet is relevant to the decision
     */
    isTenetRelevant(tenet, textLower) {
        // Foundation tenet (LOVE) is always relevant
        if (tenet.category === 'foundation')
            return true;
        // Check if any decision criteria keywords appear
        for (const criterion of tenet.decision_criteria) {
            const keywords = this.extractKeywords(criterion);
            if (keywords.some(kw => textLower.includes(kw))) {
                return true;
            }
        }
        // Check if tenet name or category appears
        if (textLower.includes(tenet.name.toLowerCase()))
            return true;
        if (textLower.includes(tenet.category))
            return true;
        return false;
    }
    /**
     * Calculate severity based on confidence and tenet category
     */
    calculateSeverity(confidence, category) {
        // Foundation violations are always higher severity
        if (category === 'foundation') {
            return confidence > 0.8 ? 'critical' : 'high';
        }
        if (confidence > 0.85)
            return 'critical';
        if (confidence > 0.7)
            return 'high';
        if (confidence > 0.5)
            return 'medium';
        return 'low';
    }
    /**
     * Deep scoring for more nuanced evaluation
     */
    deepScore(tenet, textLower, baseScore) {
        let score = baseScore;
        // Check transformation pattern alignment
        const transformKeywords = this.extractKeywords(tenet.transformation_pattern);
        if (this.matchesKeywords(textLower, transformKeywords)) {
            score += 0.1;
        }
        // Check sub-tenets if present
        if (tenet.sub_tenets) {
            for (const subTenet of tenet.sub_tenets) {
                const subKeywords = this.extractKeywords(subTenet);
                if (this.matchesKeywords(textLower, subKeywords)) {
                    score += 0.05;
                }
            }
        }
        // Check scripture anchor themes (simplified)
        for (const anchor of tenet.scripture_anchors) {
            const anchorKeywords = this.extractKeywords(anchor);
            if (this.matchesKeywords(textLower, anchorKeywords)) {
                score += 0.05;
            }
        }
        return score;
    }
    /**
     * Quick evaluation for simple decisions
     */
    quickEvaluate(decisionText) {
        const textLower = decisionText.toLowerCase();
        const tests = this.runPrimaryTests(textLower);
        const loveTestPassed = tests.love;
        const vulnerabilityTestPassed = tests.vulnerability;
        const counterfeitDetected = tests.counterfeit;
        let assessment = 'caution';
        if (counterfeitDetected) {
            assessment = 'reject';
        }
        else if (loveTestPassed && vulnerabilityTestPassed) {
            assessment = 'affirm';
        }
        return {
            assessment,
            loveTestPassed,
            vulnerabilityTestPassed,
            counterfeitDetected,
        };
    }
    /**
     * Evaluate against a specific tenet
     */
    evaluateAgainstTenet(decisionText, tenetId) {
        const tenet = this.db.getTenetById(tenetId);
        if (!tenet) {
            throw new Error(`Tenet ${tenetId} not found`);
        }
        const textLower = decisionText.toLowerCase();
        const result = this.scoreTenet(tenet, textLower, 'standard');
        const matchesCriteria = [];
        for (const criterion of tenet.decision_criteria) {
            const keywords = this.extractKeywords(criterion);
            if (this.matchesKeywords(textLower, keywords)) {
                matchesCriteria.push(criterion);
            }
        }
        let recommendation = '';
        if (result.score < 0.5) {
            recommendation = `Consider: ${tenet.decision_criteria[0]}`;
        }
        else if (result.score >= 0.7) {
            recommendation = `Strong alignment with ${tenet.name}`;
        }
        else {
            recommendation = `Review against ${tenet.name} transformation pattern: ${tenet.transformation_pattern}`;
        }
        return {
            score: result.score,
            matches_criteria: matchesCriteria,
            counterfeit_detected: result.counterfeitMatch?.counterfeit_pattern,
            recommendation,
        };
    }
}
