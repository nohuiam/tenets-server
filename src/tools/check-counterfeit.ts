/**
 * check_counterfeit Tool
 * Check if an action matches known counterfeit patterns
 */

import { z } from 'zod';
import type { CounterfeitDetector } from '../services/counterfeit-detector.js';
import type { CheckCounterfeitOutput } from '../types.js';

export const checkCounterfeitSchema = z.object({
  action_description: z.string().min(1).describe('Description of the action to check'),
  claimed_tenet: z.string().optional().describe('The tenet this action claims to embody'),
});

export type CheckCounterfeitInput = z.infer<typeof checkCounterfeitSchema>;

export function createCheckCounterfeitHandler(detector: CounterfeitDetector) {
  return async (input: CheckCounterfeitInput): Promise<CheckCounterfeitOutput> => {
    return detector.check(input.action_description, input.claimed_tenet);
  };
}

export const checkCounterfeitToolDefinition = {
  name: 'check_counterfeit',
  description: 'Check if an action matches known counterfeit patterns. Counterfeits are distortions of authentic tenets - actions that appear virtuous but actually serve self-interest, control, or harm. Returns whether the action is a counterfeit, matched patterns, and authentic alternatives.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action_description: {
        type: 'string',
        description: 'Description of the action to check',
      },
      claimed_tenet: {
        type: 'string',
        description: 'The tenet this action claims to embody (e.g., "LOVE", "SERVICE")',
      },
    },
    required: ['action_description'],
  },
};
