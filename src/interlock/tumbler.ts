/**
 * InterLock Tumbler - Whitelist filtering with circuit breaker
 *
 * Circuit breaker features (Linus audit recommendation):
 * - Hop count limiting: Prevents infinite loops between servers
 * - TTL enforcement: Rejects stale signals
 * - Deduplication: Rejects recently-seen signals
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Circuit Breaker Configuration (Linus audit recommendation)
const MAX_HOP_COUNT = 3;           // Maximum signal hops before rejection
const SIGNAL_TTL_MS = 30000;       // 30 seconds TTL for signals
const DEDUP_CLEANUP_INTERVAL = 60000; // Cleanup every 60 seconds

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

interface InterlockConfig {
  whitelist: string[];
}

let whitelist: Set<string> | null = null;

// Track tumbler statistics
const tumblerStats = {
  accepted: 0,
  rejected: 0,
  rejectedHopLimit: 0,
  rejectedExpired: 0,
  rejectedDuplicate: 0,
};

// Circuit breaker: Track recently-seen signal IDs
const recentSignals: Map<string, number> = new Map();
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Load whitelist from config
 */
function loadWhitelist(): Set<string> {
  if (whitelist) return whitelist;

  try {
    const configPath = join(__dirname, '../../config/interlock.json');
    const config: InterlockConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    whitelist = new Set(config.whitelist);
  } catch {
    // Default whitelist
    whitelist = new Set([
      'DECISION_PENDING',
      'OPERATION_COMPLETE',
      'LESSON_LEARNED',
      'HEARTBEAT',
      'TENET_VIOLATION',
      'COUNTERFEIT_DETECTED',
      'ETHICS_AFFIRMED',
      'BLIND_SPOT_ALERT',
      'REMEDIATION_NEEDED',
    ]);
  }

  return whitelist;
}

/**
 * Start the periodic cleanup timer for deduplication cache
 */
export function startCleanupTimer(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    cleanupExpiredSignals();
  }, DEDUP_CLEANUP_INTERVAL);
}

/**
 * Stop the cleanup timer (for graceful shutdown)
 */
export function stopCleanupTimer(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Clean up expired entries from the deduplication cache
 */
function cleanupExpiredSignals(): void {
  const cutoff = Date.now() - SIGNAL_TTL_MS;
  let cleaned = 0;
  for (const [signalId, timestamp] of recentSignals) {
    if (timestamp < cutoff) {
      recentSignals.delete(signalId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.error(`[Tumbler] Cleaned ${cleaned} expired signals from dedup cache`);
  }
}

/**
 * Check circuit breaker conditions
 * Returns reason string if rejected, null if accepted
 */
export function checkCircuitBreaker(metadata?: SignalMetadata): string | null {
  // If no metadata, signal is from legacy sender - allow but log warning
  if (!metadata) {
    return null;
  }

  // 1. Check hop count
  if (metadata.hopCount >= MAX_HOP_COUNT) {
    tumblerStats.rejectedHopLimit++;
    return `hop_limit_exceeded (${metadata.hopCount} >= ${MAX_HOP_COUNT})`;
  }

  // 2. Check signal age (TTL)
  if (metadata.timestamp && Date.now() - metadata.timestamp > SIGNAL_TTL_MS) {
    tumblerStats.rejectedExpired++;
    return `signal_expired (age=${Date.now() - metadata.timestamp}ms > ${SIGNAL_TTL_MS}ms)`;
  }

  // 3. Check deduplication
  if (metadata.signalId && recentSignals.has(metadata.signalId)) {
    tumblerStats.rejectedDuplicate++;
    return `duplicate_signal (id=${metadata.signalId})`;
  }

  // 4. Track this signal for deduplication
  if (metadata.signalId) {
    recentSignals.set(metadata.signalId, Date.now());
  }

  return null;
}

/**
 * Check if a signal name is whitelisted (with optional circuit breaker check)
 */
export function isWhitelisted(signalName: string, metadata?: SignalMetadata): { allowed: boolean; reason?: string } {
  // Circuit breaker check first (Linus audit recommendation)
  const circuitBreakerReason = checkCircuitBreaker(metadata);
  if (circuitBreakerReason) {
    tumblerStats.rejected++;
    return { allowed: false, reason: `Circuit breaker: ${circuitBreakerReason}` };
  }

  // Whitelist check
  const allowed = loadWhitelist().has(signalName);
  if (allowed) {
    tumblerStats.accepted++;
    return { allowed: true };
  } else {
    tumblerStats.rejected++;
    return { allowed: false, reason: `Signal ${signalName} not in whitelist` };
  }
}

/**
 * Get the whitelist
 */
export function getWhitelist(): string[] {
  return Array.from(loadWhitelist());
}

/**
 * Get tumbler statistics
 */
export function getTumblerStats(): {
  accepted: number;
  rejected: number;
  rejectedHopLimit: number;
  rejectedExpired: number;
  rejectedDuplicate: number;
  whitelist: string[];
} {
  return {
    accepted: tumblerStats.accepted,
    rejected: tumblerStats.rejected,
    rejectedHopLimit: tumblerStats.rejectedHopLimit,
    rejectedExpired: tumblerStats.rejectedExpired,
    rejectedDuplicate: tumblerStats.rejectedDuplicate,
    whitelist: getWhitelist(),
  };
}

// Start cleanup timer when module loads
startCleanupTimer();
