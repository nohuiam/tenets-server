/**
 * InterLock Signal Handlers
 */
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import type { Signal } from './protocol.js';
export interface HandlerContext {
    db: DatabaseManager;
    evaluator: Evaluator;
    emit: (signal: Signal) => void;
}
/**
 * Handle incoming signals
 */
export declare function handleSignal(signal: Signal, context: HandlerContext): void;
