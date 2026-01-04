/**
 * suggest_remediation Tool
 * Get specific guidance to address violations
 */
import { z } from 'zod';
export const suggestRemediationSchema = z.object({
    violation_description: z.string().describe('Description of the violation to address'),
    tenet_violated: z.string().describe('Name of the tenet that was violated'),
    context: z.record(z.unknown()).optional().describe('Additional context about the situation'),
});
// Remediation templates by tenet category
const REMEDIATION_TEMPLATES = {
    foundation: [
        'Start by asking: "What does the vulnerable person need from me?"',
        'Replace transactional thinking with unconditional action',
        'Ensure actions cross boundaries to include strangers, not just friends',
    ],
    action: [
        'Address root causes, not just symptoms',
        'Combine care with empowerment - avoid creating dependency',
        'Ensure actions protect the vulnerable from exploitation',
    ],
    character: [
        'Speak truth with compassion, not as a weapon',
        'Acknowledge limitations honestly and remain teachable',
        'Apply principles consistently, not tribally',
    ],
    community: [
        'Build bridges across divisions while maintaining truth',
        'Create inclusive spaces that welcome the marginalized',
        'Give without expectation of return or recognition',
    ],
    restoration: [
        'Break cycles of harm through release of resentment with accountability',
        'Offer acceptance before performance while maintaining truth',
        'Create genuine pathways to restoration after accountability',
    ],
};
// Related tenet mappings
const RELATED_TENETS = {
    'LOVE': ['SERVICE', 'SACRIFICE', 'COMPASSION'],
    'HEALING': ['COMPASSION', 'MERCY', 'DIGNITY'],
    'COMPASSION': ['LOVE', 'MERCY', 'SERVICE'],
    'FORGIVENESS': ['MERCY', 'GRACE', 'REDEMPTION'],
    'PEACE': ['UNITY', 'RECONCILIATION', 'MERCY'],
    'MERCY': ['GRACE', 'FORGIVENESS', 'COMPASSION'],
    'JUSTICE': ['RIGHTEOUSNESS', 'MERCY', 'DIGNITY'],
    'SERVICE': ['LOVE', 'HUMILITY', 'SACRIFICE'],
    'TRUTH': ['WISDOM', 'RIGHTEOUSNESS', 'LOVE'],
    'HUMILITY': ['TRUTH', 'TEACHABILITY', 'SERVICE'],
    'FAITH': ['HOPE', 'FAITHFULNESS', 'TRUST'],
    'HOPE': ['FAITH', 'JOY', 'PERSEVERANCE'],
    'SACRIFICE': ['LOVE', 'SERVICE', 'GENEROSITY'],
    'UNITY': ['PEACE', 'FELLOWSHIP', 'LOVE'],
    'GENEROSITY': ['SACRIFICE', 'LOVE', 'SERVICE'],
    'WISDOM': ['TRUTH', 'DISCERNMENT', 'HUMILITY'],
    'GRACE': ['MERCY', 'FORGIVENESS', 'LOVE'],
    'RIGHTEOUSNESS': ['JUSTICE', 'TRUTH', 'COURAGE'],
    'FELLOWSHIP': ['UNITY', 'LOVE', 'COMMUNITY'],
    'DISCIPLESHIP': ['TEACHING', 'SERVICE', 'MULTIPLICATION'],
    'REPENTANCE': ['FORGIVENESS', 'REDEMPTION', 'HONESTY'],
    'REDEMPTION': ['FORGIVENESS', 'GRACE', 'RESTORATION'],
    'FAITHFULNESS': ['FAITH', 'CONSISTENCY', 'LOYALTY'],
    'JOY': ['HOPE', 'CONTENTMENT', 'SERVICE'],
    'DIGNITY': ['LOVE', 'RESPECT', 'JUSTICE'],
};
export function createSuggestRemediationHandler(db) {
    return async (input) => {
        // Find the violated tenet
        const tenet = db.getTenetByName(input.tenet_violated);
        if (!tenet) {
            throw new Error(`Tenet not found: ${input.tenet_violated}`);
        }
        // Build remediation steps
        const remediationSteps = [];
        // Add tenet-specific first step from decision criteria
        const primaryCriterion = tenet.decision_criteria[0];
        if (primaryCriterion) {
            remediationSteps.push(`Step 1: Apply the test - "${primaryCriterion}"`);
        }
        // Add category-based remediation steps
        const categorySteps = REMEDIATION_TEMPLATES[tenet.category] || [];
        categorySteps.forEach((step, i) => {
            remediationSteps.push(`Step ${i + 2}: ${step}`);
        });
        // Add violation-specific step
        remediationSteps.push(`Step ${remediationSteps.length + 1}: Directly address "${input.violation_description}" by reviewing against counterfeit patterns`);
        // Get scripture guidance
        const scriptureGuidance = tenet.scripture_anchors.length > 0
            ? `Meditate on: ${tenet.scripture_anchors[0]}`
            : `Study the ${tenet.name} tenet deeply`;
        // Get transformation path
        const transformationPath = tenet.transformation_pattern ||
            `Transform this violation into authentic ${tenet.name}`;
        // Get related tenets
        const relatedTenets = RELATED_TENETS[tenet.name.toUpperCase()] || [];
        return {
            remediation_steps: remediationSteps,
            scripture_guidance: scriptureGuidance,
            transformation_path: transformationPath,
            related_tenets: relatedTenets,
        };
    };
}
export const suggestRemediationToolDefinition = {
    name: 'suggest_remediation',
    description: 'Get specific guidance to address an ethical violation. Provides step-by-step remediation, scripture guidance, transformation path, and related tenets to consider.',
    inputSchema: {
        type: 'object',
        properties: {
            violation_description: {
                type: 'string',
                description: 'Description of the violation to address',
            },
            tenet_violated: {
                type: 'string',
                description: 'Name of the tenet that was violated (e.g., "LOVE", "JUSTICE")',
            },
            context: {
                type: 'object',
                description: 'Additional context about the situation',
            },
        },
        required: ['violation_description', 'tenet_violated'],
    },
};
