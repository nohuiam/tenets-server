/**
 * evaluate_decision Tool
 * Assess a decision/action against all 25 tenets
 */
import { z } from 'zod';
import type { Evaluator } from '../services/evaluator.js';
import type { EvaluateDecisionOutput } from '../types.js';
export declare const evaluateDecisionSchema: z.ZodObject<{
    decision_text: z.ZodString;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    stakeholders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    depth: z.ZodDefault<z.ZodOptional<z.ZodEnum<["quick", "standard", "deep"]>>>;
}, "strip", z.ZodTypeAny, {
    decision_text: string;
    depth: "quick" | "standard" | "deep";
    stakeholders?: string[] | undefined;
    context?: Record<string, unknown> | undefined;
}, {
    decision_text: string;
    stakeholders?: string[] | undefined;
    context?: Record<string, unknown> | undefined;
    depth?: "quick" | "standard" | "deep" | undefined;
}>;
export type EvaluateDecisionInput = z.input<typeof evaluateDecisionSchema>;
export declare function createEvaluateDecisionHandler(evaluator: Evaluator): (rawInput: EvaluateDecisionInput) => Promise<EvaluateDecisionOutput>;
export declare const evaluateDecisionToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            decision_text: {
                type: string;
                description: string;
            };
            context: {
                type: string;
                description: string;
            };
            stakeholders: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            depth: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
};
