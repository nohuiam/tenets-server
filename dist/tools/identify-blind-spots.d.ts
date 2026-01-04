/**
 * identify_blind_spots Tool
 * Find ethical gaps in a plan or decision
 */
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { IdentifyBlindSpotsOutput } from '../types.js';
export declare const identifyBlindSpotsSchema: z.ZodObject<{
    plan_text: z.ZodString;
    scope: z.ZodDefault<z.ZodOptional<z.ZodEnum<["stakeholders", "harms", "tenets", "all"]>>>;
}, "strip", z.ZodTypeAny, {
    plan_text: string;
    scope: "stakeholders" | "harms" | "tenets" | "all";
}, {
    plan_text: string;
    scope?: "stakeholders" | "harms" | "tenets" | "all" | undefined;
}>;
export type IdentifyBlindSpotsInput = z.input<typeof identifyBlindSpotsSchema>;
export declare function createIdentifyBlindSpotsHandler(db: DatabaseManager): (rawInput: IdentifyBlindSpotsInput) => Promise<IdentifyBlindSpotsOutput>;
export declare const identifyBlindSpotsToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            plan_text: {
                type: string;
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
};
