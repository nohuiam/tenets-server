/**
 * suggest_remediation Tool
 * Get specific guidance to address violations
 */
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { SuggestRemediationOutput } from '../types.js';
export declare const suggestRemediationSchema: z.ZodObject<{
    violation_description: z.ZodString;
    tenet_violated: z.ZodString;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    violation_description: string;
    tenet_violated: string;
    context?: Record<string, unknown> | undefined;
}, {
    violation_description: string;
    tenet_violated: string;
    context?: Record<string, unknown> | undefined;
}>;
export type SuggestRemediationInput = z.infer<typeof suggestRemediationSchema>;
export declare function createSuggestRemediationHandler(db: DatabaseManager): (input: SuggestRemediationInput) => Promise<SuggestRemediationOutput>;
export declare const suggestRemediationToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            violation_description: {
                type: string;
                description: string;
            };
            tenet_violated: {
                type: string;
                description: string;
            };
            context: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
