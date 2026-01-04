/**
 * Tenets Server MCP Tools
 * Exports all 8 tools and their definitions
 */
import { evaluateDecisionSchema, createEvaluateDecisionHandler, evaluateDecisionToolDefinition, } from './evaluate-decision.js';
import { checkCounterfeitSchema, createCheckCounterfeitHandler, checkCounterfeitToolDefinition, } from './check-counterfeit.js';
import { identifyBlindSpotsSchema, createIdentifyBlindSpotsHandler, identifyBlindSpotsToolDefinition, } from './identify-blind-spots.js';
import { recordEvaluationSchema, createRecordEvaluationHandler, recordEvaluationToolDefinition, } from './record-evaluation.js';
import { getEvaluationHistorySchema, createGetEvaluationHistoryHandler, getEvaluationHistoryToolDefinition, } from './get-evaluation-history.js';
import { getTenetSchema, createGetTenetHandler, getTenetToolDefinition, } from './get-tenet.js';
import { listTenetsSchema, createListTenetsHandler, listTenetsToolDefinition, } from './list-tenets.js';
import { suggestRemediationSchema, createSuggestRemediationHandler, suggestRemediationToolDefinition, } from './suggest-remediation.js';
// Re-export everything
export { evaluateDecisionSchema, createEvaluateDecisionHandler, evaluateDecisionToolDefinition, checkCounterfeitSchema, createCheckCounterfeitHandler, checkCounterfeitToolDefinition, identifyBlindSpotsSchema, createIdentifyBlindSpotsHandler, identifyBlindSpotsToolDefinition, recordEvaluationSchema, createRecordEvaluationHandler, recordEvaluationToolDefinition, getEvaluationHistorySchema, createGetEvaluationHistoryHandler, getEvaluationHistoryToolDefinition, getTenetSchema, createGetTenetHandler, getTenetToolDefinition, listTenetsSchema, createListTenetsHandler, listTenetsToolDefinition, suggestRemediationSchema, createSuggestRemediationHandler, suggestRemediationToolDefinition, };
// All tool definitions for MCP registration
export const allToolDefinitions = [
    evaluateDecisionToolDefinition,
    checkCounterfeitToolDefinition,
    identifyBlindSpotsToolDefinition,
    recordEvaluationToolDefinition,
    getEvaluationHistoryToolDefinition,
    getTenetToolDefinition,
    listTenetsToolDefinition,
    suggestRemediationToolDefinition,
];
