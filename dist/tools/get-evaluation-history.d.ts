/**
 * get_evaluation_history Tool
 * Retrieve past evaluations for learning
 */
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { GetEvaluationHistoryOutput } from '../types.js';
export declare const getEvaluationHistorySchema: z.ZodObject<{
    tenet_filter: z.ZodOptional<z.ZodString>;
    assessment_filter: z.ZodOptional<z.ZodEnum<["affirm", "caution", "reject"]>>;
    time_range: z.ZodDefault<z.ZodOptional<z.ZodEnum<["24h", "7d", "30d", "all"]>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    time_range: "all" | "24h" | "7d" | "30d";
    limit: number;
    tenet_filter?: string | undefined;
    assessment_filter?: "affirm" | "caution" | "reject" | undefined;
}, {
    tenet_filter?: string | undefined;
    assessment_filter?: "affirm" | "caution" | "reject" | undefined;
    time_range?: "all" | "24h" | "7d" | "30d" | undefined;
    limit?: number | undefined;
}>;
export type GetEvaluationHistoryInput = z.input<typeof getEvaluationHistorySchema>;
export declare function createGetEvaluationHistoryHandler(db: DatabaseManager): (rawInput: GetEvaluationHistoryInput) => Promise<GetEvaluationHistoryOutput>;
export declare const getEvaluationHistoryToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            tenet_filter: {
                type: string;
                description: string;
            };
            assessment_filter: {
                type: string;
                enum: string[];
                description: string;
            };
            time_range: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            limit: {
                type: string;
                default: number;
                description: string;
            };
        };
        required: never[];
    };
};
