#!/usr/bin/env node
/**
 * Tenets Server - MCP Entry Point
 * Ethical decision evaluation against 25 Gospel tenets
 *
 * Ports:
 * - MCP: stdio (stdin/stdout)
 * - InterLock: UDP 3027
 * - HTTP: 8027
 * - WebSocket: 9027
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from './database/schema.js';
import { seedTenets } from './database/seed.js';
import { Evaluator } from './services/evaluator.js';
import { CounterfeitDetector } from './services/counterfeit-detector.js';
import { allToolDefinitions, createEvaluateDecisionHandler, createCheckCounterfeitHandler, createIdentifyBlindSpotsHandler, createRecordEvaluationHandler, createGetEvaluationHistoryHandler, createGetTenetHandler, createListTenetsHandler, createSuggestRemediationHandler, evaluateDecisionSchema, checkCounterfeitSchema, identifyBlindSpotsSchema, recordEvaluationSchema, getEvaluationHistorySchema, getTenetSchema, listTenetsSchema, suggestRemediationSchema, } from './tools/index.js';
import { createHttpServer } from './http/server.js';
import { createWebSocketServer } from './websocket/server.js';
import { createInterLockMesh } from './interlock/index.js';
// =============================================================================
// Configuration
// =============================================================================
const DB_PATH = process.env.TENETS_DB_PATH || ':memory:';
const HTTP_PORT = parseInt(process.env.TENETS_HTTP_PORT || '8027', 10);
const WS_PORT = parseInt(process.env.TENETS_WS_PORT || '9027', 10);
const UDP_PORT = parseInt(process.env.TENETS_UDP_PORT || '3027', 10);
// =============================================================================
// Main
// =============================================================================
async function main() {
    // Initialize database
    const db = new DatabaseManager(DB_PATH);
    db.initialize();
    // Seed tenets
    const seededCount = seedTenets(db);
    console.error(`[tenets-server] Seeded ${seededCount} tenets`);
    // Initialize services
    const evaluator = new Evaluator(db);
    const counterfeitDetector = new CounterfeitDetector(db);
    // Create tool handlers (cast to unknown handlers for dynamic dispatch)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = {
        evaluate_decision: createEvaluateDecisionHandler(evaluator),
        check_counterfeit: createCheckCounterfeitHandler(counterfeitDetector),
        identify_blind_spots: createIdentifyBlindSpotsHandler(db),
        record_evaluation: createRecordEvaluationHandler(db),
        get_evaluation_history: createGetEvaluationHistoryHandler(db),
        get_tenet: createGetTenetHandler(db),
        list_tenets: createListTenetsHandler(db),
        suggest_remediation: createSuggestRemediationHandler(db),
    };
    // Schema validators
    const schemas = {
        evaluate_decision: evaluateDecisionSchema,
        check_counterfeit: checkCounterfeitSchema,
        identify_blind_spots: identifyBlindSpotsSchema,
        record_evaluation: recordEvaluationSchema,
        get_evaluation_history: getEvaluationHistorySchema,
        get_tenet: getTenetSchema,
        list_tenets: listTenetsSchema,
        suggest_remediation: suggestRemediationSchema,
    };
    // Create MCP server
    const server = new Server({
        name: 'tenets-server',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Register tool list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: allToolDefinitions,
    }));
    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const handler = handlers[name];
        const schema = schemas[name];
        if (!handler || !schema) {
            throw new Error(`Unknown tool: ${name}`);
        }
        try {
            const validatedArgs = schema.parse(args || {});
            const result = await handler(validatedArgs);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: message }),
                    },
                ],
                isError: true,
            };
        }
    });
    // Start HTTP server
    const httpServer = createHttpServer(db, evaluator, counterfeitDetector, HTTP_PORT);
    console.error(`[tenets-server] HTTP server listening on port ${HTTP_PORT}`);
    // Start WebSocket server
    const wsServer = createWebSocketServer(db, evaluator, WS_PORT);
    console.error(`[tenets-server] WebSocket server listening on port ${WS_PORT}`);
    // Start InterLock mesh
    const mesh = createInterLockMesh(db, evaluator, UDP_PORT);
    console.error(`[tenets-server] InterLock mesh listening on port ${UDP_PORT}`);
    // Connect MCP transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[tenets-server] MCP server connected via stdio');
    // Handle shutdown
    process.on('SIGINT', () => {
        console.error('[tenets-server] Shutting down...');
        httpServer.close();
        wsServer.close();
        mesh.close();
        db.close();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.error('[tenets-server] Shutting down...');
        httpServer.close();
        wsServer.close();
        mesh.close();
        db.close();
        process.exit(0);
    });
}
main().catch((error) => {
    console.error('[tenets-server] Fatal error:', error);
    process.exit(1);
});
