/**
 * identify_blind_spots Tool
 * Find ethical gaps in a plan or decision
 */
import { z } from 'zod';
export const identifyBlindSpotsSchema = z.object({
    plan_text: z.string().min(1).describe('The plan or decision to analyze'),
    scope: z.enum(['stakeholders', 'harms', 'tenets', 'all']).optional().default('all')
        .describe('Focus area: stakeholders, harms, tenets, or all'),
});
// Stakeholder categories that should be considered
const STAKEHOLDER_CATEGORIES = [
    { name: 'direct beneficiaries', keywords: ['user', 'customer', 'client', 'patient'] },
    { name: 'vulnerable populations', keywords: ['poor', 'elderly', 'disabled', 'marginalized', 'minority'] },
    { name: 'employees/workers', keywords: ['staff', 'worker', 'employee', 'team'] },
    { name: 'community members', keywords: ['neighbor', 'community', 'local', 'resident'] },
    { name: 'future generations', keywords: ['children', 'future', 'next generation', 'long-term'] },
    { name: 'environment', keywords: ['environment', 'nature', 'ecosystem', 'climate'] },
    { name: 'suppliers/partners', keywords: ['supplier', 'vendor', 'partner', 'contractor'] },
];
// Common harms to check for
const POTENTIAL_HARMS = [
    { harm: 'exploitation', indicators: ['cheap labor', 'unpaid', 'take advantage'] },
    { harm: 'exclusion', indicators: ['only for', 'exclude', 'not for', 'select'] },
    { harm: 'dependency creation', indicators: ['need us', 'rely on', 'can\'t without'] },
    { harm: 'privacy violation', indicators: ['data', 'track', 'monitor', 'collect'] },
    { harm: 'environmental damage', indicators: ['waste', 'pollution', 'resource', 'extract'] },
    { harm: 'financial burden', indicators: ['cost', 'fee', 'charge', 'price'] },
    { harm: 'dignity reduction', indicators: ['degrade', 'shame', 'humiliate', 'expose'] },
    { harm: 'manipulation', indicators: ['persuade', 'influence', 'nudge', 'trick'] },
];
// Tenet categories for gap analysis
const TENET_CATEGORIES = {
    foundation: ['LOVE'],
    action: ['HEALING', 'COMPASSION', 'JUSTICE', 'SERVICE', 'SACRIFICE'],
    character: ['TRUTH', 'HUMILITY', 'FAITH', 'HOPE', 'WISDOM', 'RIGHTEOUSNESS', 'FAITHFULNESS', 'JOY'],
    community: ['PEACE', 'UNITY', 'GENEROSITY', 'FELLOWSHIP', 'DISCIPLESHIP'],
    restoration: ['FORGIVENESS', 'MERCY', 'GRACE', 'REDEMPTION', 'REPENTANCE', 'DIGNITY'],
};
export function createIdentifyBlindSpotsHandler(db) {
    return async (rawInput) => {
        const input = identifyBlindSpotsSchema.parse(rawInput);
        const textLower = input.plan_text.toLowerCase();
        const blindSpots = [];
        const missingStakeholders = [];
        const unaddressedHarms = [];
        const recommendations = [];
        // Check stakeholders
        if (input.scope === 'all' || input.scope === 'stakeholders') {
            for (const category of STAKEHOLDER_CATEGORIES) {
                const mentioned = category.keywords.some(kw => textLower.includes(kw));
                if (!mentioned) {
                    missingStakeholders.push(category.name);
                    blindSpots.push({
                        area: 'Stakeholder consideration',
                        description: `Plan does not mention ${category.name}`,
                        severity: category.name === 'vulnerable populations' ? 'high' : 'medium',
                        recommendation: `Consider how this plan affects ${category.name}`,
                    });
                }
            }
        }
        // Check potential harms
        if (input.scope === 'all' || input.scope === 'harms') {
            for (const { harm, indicators } of POTENTIAL_HARMS) {
                const hasRisk = indicators.some(ind => textLower.includes(ind));
                const hasMitigation = textLower.includes('prevent') ||
                    textLower.includes('protect') ||
                    textLower.includes('ensure') ||
                    textLower.includes('avoid ' + harm);
                if (hasRisk && !hasMitigation) {
                    unaddressedHarms.push(harm);
                    blindSpots.push({
                        area: 'Potential harm',
                        description: `Plan may cause ${harm} without mitigation`,
                        severity: 'high',
                        recommendation: `Add explicit measures to prevent ${harm}`,
                    });
                }
            }
        }
        // Check tenet coverage
        if (input.scope === 'all' || input.scope === 'tenets') {
            const tenets = db.getAllTenets();
            const mentionedCategories = new Set();
            for (const tenet of tenets) {
                const tenetLower = tenet.name.toLowerCase();
                if (textLower.includes(tenetLower)) {
                    mentionedCategories.add(tenet.category);
                }
            }
            // Check for missing tenet categories
            for (const [category, tenetNames] of Object.entries(TENET_CATEGORIES)) {
                if (!mentionedCategories.has(category)) {
                    const representativeTenet = tenetNames[0];
                    blindSpots.push({
                        area: 'Tenet gap',
                        description: `Plan does not address ${category} tenets (e.g., ${representativeTenet})`,
                        severity: category === 'foundation' ? 'critical' : 'medium',
                        missing_tenet: representativeTenet,
                        recommendation: `Consider ${category} aspects: ${tenetNames.slice(0, 3).join(', ')}`,
                    });
                }
            }
            // Special check for LOVE (foundation) - always required
            if (!textLower.includes('love') &&
                !textLower.includes('highest good') &&
                !textLower.includes('care for')) {
                blindSpots.push({
                    area: 'Foundation',
                    description: 'Plan does not explicitly address the foundation tenet of LOVE',
                    severity: 'high',
                    missing_tenet: 'LOVE',
                    recommendation: 'Consider: Does this seek the highest good of others?',
                });
            }
        }
        // Generate overall recommendations
        if (missingStakeholders.length > 3) {
            recommendations.push('Consider a stakeholder mapping exercise to identify all affected parties');
        }
        if (unaddressedHarms.length > 0) {
            recommendations.push('Add a risk mitigation section addressing potential harms');
        }
        const criticalBlindSpots = blindSpots.filter(b => b.severity === 'critical');
        if (criticalBlindSpots.length > 0) {
            recommendations.push('Address critical gaps before proceeding: ' +
                criticalBlindSpots.map(b => b.area).join(', '));
        }
        if (blindSpots.length === 0) {
            recommendations.push('Plan appears comprehensive. Consider peer review for additional perspectives.');
        }
        return {
            blind_spots: blindSpots,
            missing_stakeholders: missingStakeholders,
            unaddressed_harms: unaddressedHarms,
            recommendations,
        };
    };
}
export const identifyBlindSpotsToolDefinition = {
    name: 'identify_blind_spots',
    description: 'Find ethical gaps and blind spots in a plan or decision. Analyzes missing stakeholder considerations, unaddressed potential harms, and tenet categories not covered. Returns a comprehensive list of blind spots with severity and recommendations.',
    inputSchema: {
        type: 'object',
        properties: {
            plan_text: {
                type: 'string',
                description: 'The plan or decision to analyze for blind spots',
            },
            scope: {
                type: 'string',
                enum: ['stakeholders', 'harms', 'tenets', 'all'],
                default: 'all',
                description: 'Focus area: stakeholders (who is affected), harms (what could go wrong), tenets (ethical principles), or all',
            },
        },
        required: ['plan_text'],
    },
};
