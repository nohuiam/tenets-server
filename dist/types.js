/**
 * Tenets Server Type Definitions
 * 25 Ethical Principles from Christ's Gospel Teachings
 */
// =============================================================================
// InterLock Signal Types
// =============================================================================
export const SignalTypes = {
    // Incoming signals
    DECISION_PENDING: 0xD0,
    OPERATION_COMPLETE: 0xFF,
    LESSON_LEARNED: 0xE5,
    HEARTBEAT: 0x00,
    // Outgoing signals
    TENET_VIOLATION: 0xB0,
    COUNTERFEIT_DETECTED: 0xB1,
    ETHICS_AFFIRMED: 0xB2,
    BLIND_SPOT_ALERT: 0xB3,
    REMEDIATION_NEEDED: 0xB4,
};
// =============================================================================
// Configuration
// =============================================================================
export const TENETS_CONFIG = {
    // Assessment thresholds
    AFFIRM_THRESHOLD: 0.7,
    CAUTION_THRESHOLD: 0.4,
    // Counterfeit detection
    COUNTERFEIT_CONFIDENCE_THRESHOLD: 0.6,
    MAX_COUNTERFEITS_BEFORE_REJECT: 2,
    // Scoring weights
    CRITERIA_MATCH_BONUS: 0.1,
    COUNTERFEIT_PENALTY: 0.2,
    GAP_PENALTY: 0.15,
    // Primary evaluation tests
    PRIMARY_TESTS: [
        'love',
        'vulnerability',
        'counterfeit',
        'systemic',
        'transformation'
    ]
};
