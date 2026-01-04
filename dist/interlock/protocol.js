/**
 * InterLock Protocol - BaNano encoding/decoding
 */
import { SignalTypes } from '../types.js';
// Signal name mappings
const SIGNAL_NAMES = {
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
/**
 * Encode a signal to buffer
 */
export function encode(signal) {
    const json = JSON.stringify({
        c: signal.code,
        n: signal.name,
        s: signal.sender,
        t: signal.timestamp,
        d: signal.data,
    });
    return Buffer.from(json);
}
/**
 * Decode a buffer to signal
 */
export function decode(buffer) {
    try {
        const json = buffer.toString();
        const obj = JSON.parse(json);
        return {
            code: obj.c,
            name: obj.n,
            sender: obj.s,
            timestamp: obj.t,
            data: obj.d,
        };
    }
    catch {
        return null;
    }
}
/**
 * Get signal name from code
 */
export function getSignalName(code) {
    return SIGNAL_NAMES[code] || 'UNKNOWN';
}
/**
 * Check if a signal code is valid
 */
export function isValidSignal(code) {
    return code in SIGNAL_NAMES;
}
/**
 * Create a signal
 */
export function createSignal(code, data) {
    return {
        code,
        name: getSignalName(code),
        sender: 'tenets-server',
        timestamp: Date.now(),
        data,
    };
}
