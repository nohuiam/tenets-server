/**
 * evaluate_decision Tool
 * Assess a decision/action against all 25 tenets
 */
import { z } from 'zod';
export const evaluateDecisionSchema = z.object({
    decision_text: z.string().min(1).describe('The decision or action to evaluate'),
    context: z.record(z.unknown()).optional().describe('Additional context about the decision'),
    stakeholders: z.array(z.string()).optional().describe('People affected by this decision'),
    depth: z.enum(['quick', 'standard', 'deep']).optional().default('standard')
        .describe('Evaluation depth: quick (fast), standard (balanced), deep (thorough)'),
});
export function createEvaluateDecisionHandler(evaluator) {
    return async (rawInput) => {
        const input = evaluateDecisionSchema.parse(rawInput);
        const evaluation = evaluator.evaluate(input.decision_text, {
            context: input.context,
            stakeholders: input.stakeholders,
            depth: input.depth,
        });
        return {
            evaluation_id: evaluation.id,
            overall_assessment: evaluation.overall_assessment,
            tenet_scores: evaluation.tenet_scores,
            violations: evaluation.violations,
            counterfeits_matched: evaluation.counterfeits_matched,
            recommendations: evaluation.recommendations,
        };
    };
}
export const evaluateDecisionToolDefinition = {
    name: 'evaluate_decision',
    description: 'Evaluate a decision or action against the 25 ethical tenets derived from Christ\'s Gospel teachings. Returns an overall assessment (affirm/caution/reject), scores for each tenet, any violations detected, counterfeit patterns matched, and recommendations for improvement.',
    inputSchema: {
        type: 'object',
        properties: {
            decision_text: {
                type: 'string',
                description: 'The decision or action to evaluate',
            },
            context: {
                type: 'object',
                description: 'Additional context about the decision',
            },
            stakeholders: {
                type: 'array',
                items: { type: 'string' },
                description: 'People affected by this decision',
            },
            depth: {
                type: 'string',
                enum: ['quick', 'standard', 'deep'],
                default: 'standard',
                description: 'Evaluation depth: quick (fast), standard (balanced), deep (thorough)',
            },
        },
        required: ['decision_text'],
    },
};
