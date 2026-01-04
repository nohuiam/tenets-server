/**
 * check_counterfeit Tool
 * Check if an action matches known counterfeit patterns
 */
import { z } from 'zod';
import type { CounterfeitDetector } from '../services/counterfeit-detector.js';
import type { CheckCounterfeitOutput } from '../types.js';
export declare const checkCounterfeitSchema: z.ZodObject<{
    action_description: z.ZodString;
    claimed_tenet: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action_description: string;
    claimed_tenet?: string | undefined;
}, {
    action_description: string;
    claimed_tenet?: string | undefined;
}>;
export type CheckCounterfeitInput = z.infer<typeof checkCounterfeitSchema>;
export declare function createCheckCounterfeitHandler(detector: CounterfeitDetector): (input: CheckCounterfeitInput) => Promise<CheckCounterfeitOutput>;
export declare const checkCounterfeitToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            action_description: {
                type: string;
                description: string;
            };
            claimed_tenet: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
