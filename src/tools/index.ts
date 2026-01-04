/**
 * Tenets Server MCP Tools
 * Exports all 8 tools and their definitions
 */

import {
  evaluateDecisionSchema,
  createEvaluateDecisionHandler,
  evaluateDecisionToolDefinition,
  type EvaluateDecisionInput,
} from './evaluate-decision.js';

import {
  checkCounterfeitSchema,
  createCheckCounterfeitHandler,
  checkCounterfeitToolDefinition,
  type CheckCounterfeitInput,
} from './check-counterfeit.js';

import {
  identifyBlindSpotsSchema,
  createIdentifyBlindSpotsHandler,
  identifyBlindSpotsToolDefinition,
  type IdentifyBlindSpotsInput,
} from './identify-blind-spots.js';

import {
  recordEvaluationSchema,
  createRecordEvaluationHandler,
  recordEvaluationToolDefinition,
  type RecordEvaluationInput,
} from './record-evaluation.js';

import {
  getEvaluationHistorySchema,
  createGetEvaluationHistoryHandler,
  getEvaluationHistoryToolDefinition,
  type GetEvaluationHistoryInput,
} from './get-evaluation-history.js';

import {
  getTenetSchema,
  createGetTenetHandler,
  getTenetToolDefinition,
  type GetTenetInput,
} from './get-tenet.js';

import {
  listTenetsSchema,
  createListTenetsHandler,
  listTenetsToolDefinition,
  type ListTenetsInput,
} from './list-tenets.js';

import {
  suggestRemediationSchema,
  createSuggestRemediationHandler,
  suggestRemediationToolDefinition,
  type SuggestRemediationInput,
} from './suggest-remediation.js';

// Re-export everything
export {
  evaluateDecisionSchema,
  createEvaluateDecisionHandler,
  evaluateDecisionToolDefinition,
  type EvaluateDecisionInput,
  checkCounterfeitSchema,
  createCheckCounterfeitHandler,
  checkCounterfeitToolDefinition,
  type CheckCounterfeitInput,
  identifyBlindSpotsSchema,
  createIdentifyBlindSpotsHandler,
  identifyBlindSpotsToolDefinition,
  type IdentifyBlindSpotsInput,
  recordEvaluationSchema,
  createRecordEvaluationHandler,
  recordEvaluationToolDefinition,
  type RecordEvaluationInput,
  getEvaluationHistorySchema,
  createGetEvaluationHistoryHandler,
  getEvaluationHistoryToolDefinition,
  type GetEvaluationHistoryInput,
  getTenetSchema,
  createGetTenetHandler,
  getTenetToolDefinition,
  type GetTenetInput,
  listTenetsSchema,
  createListTenetsHandler,
  listTenetsToolDefinition,
  type ListTenetsInput,
  suggestRemediationSchema,
  createSuggestRemediationHandler,
  suggestRemediationToolDefinition,
  type SuggestRemediationInput,
};

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
