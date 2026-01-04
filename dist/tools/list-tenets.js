/**
 * list_tenets Tool
 * List all tenets with optional category filtering
 */
import { z } from 'zod';
export const listTenetsSchema = z.object({
    category: z.enum(['foundation', 'action', 'character', 'community', 'restoration']).optional()
        .describe('Filter by tenet category'),
});
export function createListTenetsHandler(db) {
    return async (input) => {
        const tenets = db.listTenets(input.category);
        return {
            tenets,
            count: tenets.length,
        };
    };
}
export const listTenetsToolDefinition = {
    name: 'list_tenets',
    description: 'List all 25 ethical tenets with optional filtering by category. Categories are: foundation (LOVE), action (HEALING, COMPASSION, JUSTICE, SERVICE, SACRIFICE), character (TRUTH, HUMILITY, FAITH, HOPE, WISDOM, RIGHTEOUSNESS, FAITHFULNESS, JOY), community (PEACE, UNITY, GENEROSITY, FELLOWSHIP, DISCIPLESHIP), restoration (FORGIVENESS, MERCY, GRACE, REDEMPTION, REPENTANCE, DIGNITY).',
    inputSchema: {
        type: 'object',
        properties: {
            category: {
                type: 'string',
                enum: ['foundation', 'action', 'character', 'community', 'restoration'],
                description: 'Filter by tenet category',
            },
        },
        required: [],
    },
};
