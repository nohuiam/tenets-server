/**
 * get_tenet Tool
 * Retrieve full details of a specific tenet
 */

import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { Tenet } from '../types.js';

export const getTenetSchema = z.object({
  tenet_name: z.string().optional().describe('Name of the tenet (e.g., "LOVE", "JUSTICE")'),
  tenet_id: z.number().optional().describe('ID of the tenet (1-25)'),
}).refine(data => data.tenet_name || data.tenet_id, {
  message: 'Either tenet_name or tenet_id must be provided',
});

export type GetTenetInput = z.infer<typeof getTenetSchema>;

export function createGetTenetHandler(db: DatabaseManager) {
  return async (input: GetTenetInput): Promise<Tenet> => {
    let tenet: Tenet | null = null;

    if (input.tenet_id) {
      tenet = db.getTenetById(input.tenet_id);
    } else if (input.tenet_name) {
      tenet = db.getTenetByName(input.tenet_name);
    }

    if (!tenet) {
      throw new Error(`Tenet not found: ${input.tenet_name || input.tenet_id}`);
    }

    return tenet;
  };
}

export const getTenetToolDefinition = {
  name: 'get_tenet',
  description: 'Retrieve full details of a specific tenet including its definition, scripture anchors, decision criteria, counterfeit patterns, sub-tenets, and transformation pattern. Use either tenet_name (e.g., "LOVE") or tenet_id (1-25).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      tenet_name: {
        type: 'string',
        description: 'Name of the tenet (e.g., "LOVE", "JUSTICE", "MERCY")',
      },
      tenet_id: {
        type: 'number',
        description: 'ID of the tenet (1-25)',
      },
    },
    required: [],
  },
};
