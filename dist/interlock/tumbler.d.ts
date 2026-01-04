/**
 * InterLock Tumbler - Whitelist filtering
 */
/**
 * Check if a signal name is whitelisted
 */
export declare function isWhitelisted(signalName: string): boolean;
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
    whitelist: string[];
};
