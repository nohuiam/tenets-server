/**
 * get_evaluation_history Tool
 * Retrieve past evaluations for learning
 */
import { z } from 'zod';
export const getEvaluationHistorySchema = z.object({
    tenet_filter: z.string().optional().describe('Filter by tenet name'),
    assessment_filter: z.enum(['affirm', 'caution', 'reject']).optional()
        .describe('Filter by assessment type'),
    time_range: z.enum(['24h', '7d', '30d', 'all']).optional().default('all')
        .describe('Time range for history'),
    limit: z.number().optional().default(50).describe('Maximum number of results'),
});
const TIME_RANGES = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    'all': 0,
};
export function createGetEvaluationHistoryHandler(db) {
    return async (rawInput) => {
        const input = getEvaluationHistorySchema.parse(rawInput);
        // Calculate time filter
        const since = input.time_range && input.time_range !== 'all'
            ? Date.now() - TIME_RANGES[input.time_range]
            : undefined;
        // Get evaluations
        let evaluations = db.getEvaluations({
            assessment: input.assessment_filter,
            limit: input.limit,
            since,
        });
        // Filter by tenet if specified
        if (input.tenet_filter) {
            const tenet = db.getTenetByName(input.tenet_filter);
            if (tenet) {
                evaluations = evaluations.filter(e => {
                    // Check if this tenet has a significant score in the evaluation
                    const score = e.tenet_scores[tenet.id];
                    return score !== undefined && score !== 0.5; // Non-neutral score
                });
            }
        }
        // Get violation patterns
        const patterns = db.getPatternsByType('violation');
        return {
            evaluations,
            count: evaluations.length,
            violation_patterns: patterns,
        };
    };
}
export const getEvaluationHistoryToolDefinition = {
    name: 'get_evaluation_history',
    description: 'Retrieve past ethical evaluations for learning and analysis. Can filter by tenet, assessment type, and time range. Returns evaluations along with detected violation patterns.',
    inputSchema: {
        type: 'object',
        properties: {
            tenet_filter: {
                type: 'string',
                description: 'Filter by tenet name (e.g., "LOVE", "JUSTICE")',
            },
            assessment_filter: {
                type: 'string',
                enum: ['affirm', 'caution', 'reject'],
                description: 'Filter by assessment type',
            },
            time_range: {
                type: 'string',
                enum: ['24h', '7d', '30d', 'all'],
                default: 'all',
                description: 'Time range for history',
            },
            limit: {
                type: 'number',
                default: 50,
                description: 'Maximum number of results',
            },
        },
        required: [],
    },
};
