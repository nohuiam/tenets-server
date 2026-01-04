/**
 * list_tenets Tool
 * List all tenets with optional category filtering
 */
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { ListTenetsOutput } from '../types.js';
export declare const listTenetsSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["foundation", "action", "character", "community", "restoration"]>>;
}, "strip", z.ZodTypeAny, {
    category?: "foundation" | "action" | "character" | "community" | "restoration" | undefined;
}, {
    category?: "foundation" | "action" | "character" | "community" | "restoration" | undefined;
}>;
export type ListTenetsInput = z.infer<typeof listTenetsSchema>;
export declare function createListTenetsHandler(db: DatabaseManager): (input: ListTenetsInput) => Promise<ListTenetsOutput>;
export declare const listTenetsToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            category: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: never[];
    };
};
