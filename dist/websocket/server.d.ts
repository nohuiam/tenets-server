/**
 * Tenets Server WebSocket Server
 * Port 9027 - Real-time events
 */
import { WebSocketServer } from 'ws';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
export declare function createWebSocketServer(db: DatabaseManager, evaluator: Evaluator, port: number): WebSocketServer;
