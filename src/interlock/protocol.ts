/**
 * InterLock Protocol - Official BaNano Binary Format
 *
 * 12-byte header:
 * Bytes 0-1:   Signal Type (uint16, big-endian)
 * Bytes 2-3:   Protocol Version (uint16, big-endian)
 * Bytes 4-7:   Payload Length (uint32, big-endian)
 * Bytes 8-11:  Timestamp (uint32, Unix seconds)
 * Bytes 12+:   Payload (JSON, UTF-8)
 */

import { SignalTypes } from '../types.js';

// Protocol version 1.0
const PROTOCOL_VERSION = 0x0100;

// Signal name mappings
const SIGNAL_NAMES: Record<number, string> = {
  [SignalTypes.DECISION_PENDING]: 'DECISION_PENDING',
  [SignalTypes.OPERATION_COMPLETE]: 'OPERATION_COMPLETE',
  [SignalTypes.LESSON_LEARNED]: 'LESSON_LEARNED',
  [SignalTypes.HEARTBEAT]: 'HEARTBEAT',
  [SignalTypes.TENET_VIOLATION]: 'TENET_VIOLATION',
  [SignalTypes.COUNTERFEIT_DETECTED]: 'COUNTERFEIT_DETECTED',
  [SignalTypes.ETHICS_AFFIRMED]: 'ETHICS_AFFIRMED',
  [SignalTypes.BLIND_SPOT_ALERT]: 'BLIND_SPOT_ALERT',
  [SignalTypes.REMEDIATION_NEEDED]: 'REMEDIATION_NEEDED',
};

export interface Signal {
  signalType: number;
  version: number;
  timestamp: number;
  payload: {
    sender: string;
    [key: string]: unknown;
  };
}

/**
 * Encode a signal to BaNano binary format
 */
export function encode(signalType: number, sender: string, data?: Record<string, unknown>): Buffer {
  const payload = JSON.stringify({ sender, ...data });
  const payloadBuffer = Buffer.from(payload, 'utf8');

  const header = Buffer.alloc(12);
  header.writeUInt16BE(signalType, 0);
  header.writeUInt16BE(PROTOCOL_VERSION, 2);
  header.writeUInt32BE(payloadBuffer.length, 4);
  header.writeUInt32BE(Math.floor(Date.now() / 1000), 8);

  return Buffer.concat([header, payloadBuffer]);
}

/**
 * Decode a BaNano binary buffer to Signal
 * Returns null if buffer is invalid
 */
export function decode(buffer: Buffer): Signal | null {
  // Minimum 12-byte header required
  if (!buffer || buffer.length < 12) {
    return null;
  }

  try {
    const signalType = buffer.readUInt16BE(0);
    const version = buffer.readUInt16BE(2);
    const payloadLength = buffer.readUInt32BE(4);
    const timestamp = buffer.readUInt32BE(8);

    // Validate payload length
    if (buffer.length < 12 + payloadLength) {
      return null;
    }

    // Parse JSON payload
    const payloadStr = buffer.slice(12, 12 + payloadLength).toString('utf8');
    const payload = JSON.parse(payloadStr);

    // Ensure payload has sender
    if (!payload.sender) {
      payload.sender = 'unknown';
    }

    return {
      signalType,
      version,
      timestamp,
      payload,
    };
  } catch {
    return null;
  }
}

/**
 * Get signal name from type code
 */
export function getSignalName(signalType: number): string {
  return SIGNAL_NAMES[signalType] || `UNKNOWN_0x${signalType.toString(16).toUpperCase()}`;
}

/**
 * Check if a signal type is valid (known)
 */
export function isValidSignal(signalType: number): boolean {
  return signalType in SIGNAL_NAMES;
}

/**
 * Create a Signal object for emitting
 */
export function createSignal(
  signalType: number,
  data?: Record<string, unknown>
): Signal {
  return {
    signalType,
    version: PROTOCOL_VERSION,
    timestamp: Math.floor(Date.now() / 1000),
    payload: {
      sender: 'tenets-server',
      ...data,
    },
  };
}
