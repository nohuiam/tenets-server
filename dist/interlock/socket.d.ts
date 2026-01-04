/**
 * InterLock UDP Socket
 * Port 3027
 */
import dgram from 'dgram';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import { type Signal } from './protocol.js';
interface Peer {
    name: string;
    port: number;
    address?: string;
    lastSeen?: number;
    status?: 'active' | 'inactive' | 'unknown';
}
export interface InterlockStats {
    sent: number;
    received: number;
    dropped: number;
    peers: number;
    uptime: number;
}
export interface InterLockMesh {
    socket: dgram.Socket;
    emit: (signal: Signal) => void;
    close: () => void;
    getStats: () => InterlockStats;
    getTumblerStats: () => {
        accepted: number;
        rejected: number;
        whitelist: string[];
    };
    getPeers: () => Peer[];
}
/**
 * Create the InterLock mesh
 */
export declare function createInterLockMesh(db: DatabaseManager, evaluator: Evaluator, port: number): InterLockMesh;
/**
 * Get the current InterLock instance
 */
export declare function getInterLock(): InterLockMesh | null;
export {};
