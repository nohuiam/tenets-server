/**
 * Tenets Server MCP Tools
 * Exports all 8 tools and their definitions
 */
import { evaluateDecisionSchema, createEvaluateDecisionHandler, evaluateDecisionToolDefinition, type EvaluateDecisionInput } from './evaluate-decision.js';
import { checkCounterfeitSchema, createCheckCounterfeitHandler, checkCounterfeitToolDefinition, type CheckCounterfeitInput } from './check-counterfeit.js';
import { identifyBlindSpotsSchema, createIdentifyBlindSpotsHandler, identifyBlindSpotsToolDefinition, type IdentifyBlindSpotsInput } from './identify-blind-spots.js';
import { recordEvaluationSchema, createRecordEvaluationHandler, recordEvaluationToolDefinition, type RecordEvaluationInput } from './record-evaluation.js';
import { getEvaluationHistorySchema, createGetEvaluationHistoryHandler, getEvaluationHistoryToolDefinition, type GetEvaluationHistoryInput } from './get-evaluation-history.js';
import { getTenetSchema, createGetTenetHandler, getTenetToolDefinition, type GetTenetInput } from './get-tenet.js';
import { listTenetsSchema, createListTenetsHandler, listTenetsToolDefinition, type ListTenetsInput } from './list-tenets.js';
import { suggestRemediationSchema, createSuggestRemediationHandler, suggestRemediationToolDefinition, type SuggestRemediationInput } from './suggest-remediation.js';
export { evaluateDecisionSchema, createEvaluateDecisionHandler, evaluateDecisionToolDefinition, type EvaluateDecisionInput, checkCounterfeitSchema, createCheckCounterfeitHandler, checkCounterfeitToolDefinition, type CheckCounterfeitInput, identifyBlindSpotsSchema, createIdentifyBlindSpotsHandler, identifyBlindSpotsToolDefinition, type IdentifyBlindSpotsInput, recordEvaluationSchema, createRecordEvaluationHandler, recordEvaluationToolDefinition, type RecordEvaluationInput, getEvaluationHistorySchema, createGetEvaluationHistoryHandler, getEvaluationHistoryToolDefinition, type GetEvaluationHistoryInput, getTenetSchema, createGetTenetHandler, getTenetToolDefinition, type GetTenetInput, listTenetsSchema, createListTenetsHandler, listTenetsToolDefinition, type ListTenetsInput, suggestRemediationSchema, createSuggestRemediationHandler, suggestRemediationToolDefinition, type SuggestRemediationInput, };
export declare const allToolDefinitions: ({
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
})[];
