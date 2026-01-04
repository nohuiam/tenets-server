/**
 * record_evaluation Tool
 * Store an evaluation for learning and pattern detection
 */
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { RecordEvaluationOutput } from '../types.js';
export declare const recordEvaluationSchema: z.ZodObject<{
    decision_id: z.ZodString;
    assessment: z.ZodEnum<["affirm", "caution", "reject"]>;
    violations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    decision_id: string;
    assessment: "affirm" | "caution" | "reject";
    violations?: string[] | undefined;
    notes?: string | undefined;
}, {
    decision_id: string;
    assessment: "affirm" | "caution" | "reject";
    violations?: string[] | undefined;
    notes?: string | undefined;
}>;
export type RecordEvaluationInput = z.infer<typeof recordEvaluationSchema>;
export declare function createRecordEvaluationHandler(db: DatabaseManager): (input: RecordEvaluationInput) => Promise<RecordEvaluationOutput>;
export declare const recordEvaluationToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            decision_id: {
                type: string;
                description: string;
            };
            assessment: {
                type: string;
                enum: string[];
                description: string;
            };
            violations: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            notes: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
