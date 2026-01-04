/**
 * Tenets Server HTTP REST API
 * Port 8027
 */
import type { Server } from 'http';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import type { CounterfeitDetector } from '../services/counterfeit-detector.js';
export declare function createHttpServer(db: DatabaseManager, evaluator: Evaluator, counterfeitDetector: CounterfeitDetector, port: number): Server;
