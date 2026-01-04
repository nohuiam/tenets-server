/**
 * list_tenets Tool
 * List all tenets with optional category filtering
 */

import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { ListTenetsOutput, TenetCategory } from '../types.js';

export const listTenetsSchema = z.object({
  category: z.enum(['foundation', 'action', 'character', 'community', 'restoration']).optional()
    .describe('Filter by tenet category'),
});

export type ListTenetsInput = z.infer<typeof listTenetsSchema>;

export function createListTenetsHandler(db: DatabaseManager) {
  return async (input: ListTenetsInput): Promise<ListTenetsOutput> => {
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
    type: 'object' as const,
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
