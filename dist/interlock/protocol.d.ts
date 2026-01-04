/**
 * InterLock Protocol - BaNano encoding/decoding
 */
export interface Signal {
    code: number;
    name: string;
    sender: string;
    timestamp: number;
    data?: Record<string, unknown>;
}
/**
 * Encode a signal to buffer
 */
export declare function encode(signal: Signal): Buffer;
/**
 * Decode a buffer to signal
 */
export declare function decode(buffer: Buffer): Signal | null;
/**
 * Get signal name from code
 */
export declare function getSignalName(code: number): string;
/**
 * Check if a signal code is valid
 */
export declare function isValidSignal(code: number): boolean;
/**
 * Create a signal
 */
export declare function createSignal(code: number, data?: Record<string, unknown>): Signal;
