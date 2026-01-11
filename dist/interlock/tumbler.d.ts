/**
 * InterLock Tumbler - Whitelist filtering with circuit breaker
 *
 * Circuit breaker features (Linus audit recommendation):
 * - Hop count limiting: Prevents infinite loops between servers
 * - TTL enforcement: Rejects stale signals
 * - Deduplication: Rejects recently-seen signals
 */
/**
 * Signal metadata for circuit breaker functionality
 */
export interface SignalMetadata {
    signalId: string;
    originServer: string;
    hopCount: number;
    parentSignalId?: string;
    timestamp: number;
}
/**
 * Start the periodic cleanup timer for deduplication cache
 */
export declare function startCleanupTimer(): void;
/**
 * Stop the cleanup timer (for graceful shutdown)
 */
export declare function stopCleanupTimer(): void;
/**
 * Check circuit breaker conditions
 * Returns reason string if rejected, null if accepted
 */
export declare function checkCircuitBreaker(metadata?: SignalMetadata): string | null;
/**
 * Check if a signal name is whitelisted (with optional circuit breaker check)
 */
export declare function isWhitelisted(signalName: string, metadata?: SignalMetadata): {
    allowed: boolean;
    reason?: string;
};
/**
 * Get the whitelist
 */
export declare function getWhitelist(): string[];
/**
 * Get tumbler statistics
 */
export declare function getTumblerStats(): {
    accepted: number;
    rejected: number;
    rejectedHopLimit: number;
    rejectedExpired: number;
    rejectedDuplicate: number;
    whitelist: string[];
};
