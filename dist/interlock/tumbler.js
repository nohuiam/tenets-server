/**
 * InterLock Tumbler - Whitelist filtering
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let whitelist = null;
/**
 * Load whitelist from config
 */
function loadWhitelist() {
    if (whitelist)
        return whitelist;
    try {
        const configPath = join(__dirname, '../../config/interlock.json');
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        whitelist = new Set(config.whitelist);
    }
    catch {
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
 * Check if a signal name is whitelisted
 */
export function isWhitelisted(signalName) {
    return loadWhitelist().has(signalName);
}
/**
 * Get the whitelist
 */
export function getWhitelist() {
    return Array.from(loadWhitelist());
}
