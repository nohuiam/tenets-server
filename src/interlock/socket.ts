/**
 * InterLock UDP Socket
 * Port 3027
 */

import dgram from 'dgram';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import { encode, decode, type Signal } from './protocol.js';
import { handleSignal, type HandlerContext } from './handlers.js';
import { isWhitelisted } from './tumbler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Peer {
  name: string;
  port: number;
  address?: string;
}

interface InterlockConfig {
  peers: Peer[];
}

export interface InterLockMesh {
  socket: dgram.Socket;
  emit: (signal: Signal) => void;
  close: () => void;
}

/**
 * Load peer configuration
 */
function loadPeers(): Peer[] {
  try {
    const configPath = join(__dirname, '../../config/interlock.json');
    const config: InterlockConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.peers || [];
  } catch {
    return [];
  }
}

/**
 * Create the InterLock mesh
 */
export function createInterLockMesh(
  db: DatabaseManager,
  evaluator: Evaluator,
  port: number
): InterLockMesh {
  const socket = dgram.createSocket('udp4');
  const peers = loadPeers();

  // Emit function to broadcast to peers
  function emit(signal: Signal): void {
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
  const context: HandlerContext = {
    db,
    evaluator,
    emit,
  };

  // Handle incoming messages
  socket.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
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
