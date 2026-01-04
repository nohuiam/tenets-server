/**
 * InterLock UDP Socket
 * Port 3027
 */
import dgram from 'dgram';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { encode, decode } from './protocol.js';
import { handleSignal } from './handlers.js';
import { isWhitelisted, getTumblerStats } from './tumbler.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Module-level stats
const stats = {
    sent: 0,
    received: 0,
    dropped: 0,
    startTime: Date.now(),
};
// Module-level peers map
let peersMap = new Map();
// Module-level instance for singleton pattern
let interlockInstance = null;
/**
 * Load peer configuration
 */
function loadPeers() {
    try {
        const configPath = join(__dirname, '../../config/interlock.json');
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        return config.peers || [];
    }
    catch {
        return [];
    }
}
/**
 * Create the InterLock mesh
 */
export function createInterLockMesh(db, evaluator, port) {
    const socket = dgram.createSocket('udp4');
    const peers = loadPeers();
    // Initialize peers map
    peersMap = new Map();
    for (const peer of peers) {
        peersMap.set(peer.name, {
            ...peer,
            status: 'unknown',
            lastSeen: 0,
        });
    }
    // Emit function to broadcast to peers
    function emit(signal) {
        if (!isWhitelisted(signal.name)) {
            console.error(`[tenets-server] Signal ${signal.name} not whitelisted, not emitting`);
            stats.dropped++;
            return;
        }
        const buffer = encode(signal);
        for (const peer of peers) {
            const address = peer.address || '127.0.0.1';
            socket.send(buffer, 0, buffer.length, peer.port, address, (err) => {
                if (err) {
                    console.error(`[tenets-server] Error sending to ${peer.name}:`, err.message);
                    stats.dropped++;
                }
                else {
                    stats.sent++;
                }
            });
        }
    }
    // Handler context
    const context = {
        db,
        evaluator,
        emit,
    };
    // Handle incoming messages
    socket.on('message', (msg, rinfo) => {
        const signal = decode(msg);
        if (!signal) {
            console.error(`[tenets-server] Invalid signal from ${rinfo.address}:${rinfo.port}`);
            stats.dropped++;
            return;
        }
        stats.received++;
        // Update peer status if we know this sender
        for (const [name, peer] of peersMap) {
            if (peer.port === rinfo.port) {
                peer.lastSeen = Date.now();
                peer.status = 'active';
                break;
            }
        }
        if (!isWhitelisted(signal.name)) {
            console.error(`[tenets-server] Signal ${signal.name} not whitelisted, ignoring`);
            stats.dropped++;
            return;
        }
        handleSignal(signal, context);
    });
    socket.on('error', (err) => {
        console.error('[tenets-server] UDP socket error:', err);
    });
    socket.on('listening', () => {
        const addr = socket.address();
        console.error(`[tenets-server] InterLock mesh listening on ${addr.address}:${addr.port}`);
    });
    // Bind to port
    socket.bind(port);
    const mesh = {
        socket,
        emit,
        close: () => {
            socket.close();
            interlockInstance = null;
        },
        getStats: () => ({
            sent: stats.sent,
            received: stats.received,
            dropped: stats.dropped,
            peers: peersMap.size,
            uptime: Date.now() - stats.startTime,
        }),
        getTumblerStats: () => getTumblerStats(),
        getPeers: () => Array.from(peersMap.values()),
    };
    interlockInstance = mesh;
    return mesh;
}
/**
 * Get the current InterLock instance
 */
export function getInterLock() {
    return interlockInstance;
}
