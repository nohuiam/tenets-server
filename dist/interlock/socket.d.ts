/**
 * InterLock UDP Socket
 * Port 3027
 */
import dgram from 'dgram';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import { type Signal } from './protocol.js';
export interface InterLockMesh {
    socket: dgram.Socket;
    emit: (signal: Signal) => void;
    close: () => void;
}
/**
 * Create the InterLock mesh
 */
export declare function createInterLockMesh(db: DatabaseManager, evaluator: Evaluator, port: number): InterLockMesh;
