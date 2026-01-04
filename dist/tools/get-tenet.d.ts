/**
 * get_tenet Tool
 * Retrieve full details of a specific tenet
 */
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { Tenet } from '../types.js';
export declare const getTenetSchema: z.ZodEffects<z.ZodObject<{
    tenet_name: z.ZodOptional<z.ZodString>;
    tenet_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tenet_id?: number | undefined;
    tenet_name?: string | undefined;
}, {
    tenet_id?: number | undefined;
    tenet_name?: string | undefined;
}>, {
    tenet_id?: number | undefined;
    tenet_name?: string | undefined;
}, {
    tenet_id?: number | undefined;
    tenet_name?: string | undefined;
}>;
export type GetTenetInput = z.infer<typeof getTenetSchema>;
export declare function createGetTenetHandler(db: DatabaseManager): (input: GetTenetInput) => Promise<Tenet>;
export declare const getTenetToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            tenet_name: {
                type: string;
                description: string;
            };
            tenet_id: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
};
