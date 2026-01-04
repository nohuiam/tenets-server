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
import { isWhitelisted } from './tumbler.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    // Emit function to broadcast to peers
    function emit(signal) {
        if (!isWhitelisted(signal.name)) {
            console.error(`[tenets-server] Signal ${signal.name} not whitelisted, not emitting`);
            return;
        }
        const buffer = encode(signal);
        for (const peer of peers) {
            const address = peer.address || '127.0.0.1';
            socket.send(buffer, 0, buffer.length, peer.port, address, (err) => {
                if (err) {
                    console.error(`[tenets-server] Error sending to ${peer.name}:`, err.message);
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
            return;
        }
        if (!isWhitelisted(signal.name)) {
            console.error(`[tenets-server] Signal ${signal.name} not whitelisted, ignoring`);
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
    return {
        socket,
        emit,
        close: () => {
            socket.close();
        },
    };
}
