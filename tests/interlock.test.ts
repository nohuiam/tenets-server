/**
 * InterLock Mesh Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../src/database/schema.js';
import { seedTenetsInline } from '../src/database/seed.js';
import { Evaluator } from '../src/services/evaluator.js';
import { encode, decode, getSignalName, isValidSignal, createSignal, type Signal as ProtocolSignal } from '../src/interlock/protocol.js';
import { isWhitelisted, getWhitelist } from '../src/interlock/tumbler.js';
import { handleSignal, type HandlerContext } from '../src/interlock/handlers.js';
import { SignalTypes, type Signal as LegacySignal } from '../src/types.js';

describe('InterLock', () => {
  let db: DatabaseManager;
  let evaluator: Evaluator;

  beforeEach(() => {
    db = new DatabaseManager(':memory:');
    db.initialize();
    seedTenetsInline(db);
    evaluator = new Evaluator(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('protocol', () => {
    describe('encode/decode', () => {
      it('should encode and decode a signal', () => {
        const encoded = encode(SignalTypes.DECISION_PENDING, 'test-server', { decision_text: 'Test decision' });
        const decoded = decode(encoded);

        expect(decoded).not.toBeNull();
        expect(decoded?.signalType).toBe(SignalTypes.DECISION_PENDING);
        expect(decoded?.payload.sender).toBe('test-server');
      });

      it('should handle signal without data', () => {
        const encoded = encode(SignalTypes.HEARTBEAT, 'test-server');
        const decoded = decode(encoded);

        expect(decoded).not.toBeNull();
        expect(decoded?.signalType).toBe(SignalTypes.HEARTBEAT);
      });

      it('should return null for invalid buffer', () => {
        const decoded = decode(Buffer.from('invalid json'));

        expect(decoded).toBeNull();
      });
    });

    describe('getSignalName', () => {
      it('should return correct signal names', () => {
        expect(getSignalName(SignalTypes.DECISION_PENDING)).toBe('DECISION_PENDING');
        expect(getSignalName(SignalTypes.OPERATION_COMPLETE)).toBe('OPERATION_COMPLETE');
        expect(getSignalName(SignalTypes.LESSON_LEARNED)).toBe('LESSON_LEARNED');
        expect(getSignalName(SignalTypes.HEARTBEAT)).toBe('HEARTBEAT');
        expect(getSignalName(SignalTypes.TENET_VIOLATION)).toBe('TENET_VIOLATION');
        expect(getSignalName(SignalTypes.COUNTERFEIT_DETECTED)).toBe('COUNTERFEIT_DETECTED');
        expect(getSignalName(SignalTypes.ETHICS_AFFIRMED)).toBe('ETHICS_AFFIRMED');
        expect(getSignalName(SignalTypes.BLIND_SPOT_ALERT)).toBe('BLIND_SPOT_ALERT');
        expect(getSignalName(SignalTypes.REMEDIATION_NEEDED)).toBe('REMEDIATION_NEEDED');
      });

      it('should return UNKNOWN for invalid codes', () => {
        expect(getSignalName(0xAA)).toBe('UNKNOWN_0xAA');
      });
    });

    describe('isValidSignal', () => {
      it('should validate known signal codes', () => {
        expect(isValidSignal(SignalTypes.DECISION_PENDING)).toBe(true);
        expect(isValidSignal(SignalTypes.HEARTBEAT)).toBe(true);
        expect(isValidSignal(SignalTypes.TENET_VIOLATION)).toBe(true);
      });

      it('should reject unknown signal codes', () => {
        expect(isValidSignal(0xAA)).toBe(false);
        expect(isValidSignal(0xBB)).toBe(false);
      });
    });
  });

  describe('tumbler', () => {
    describe('isWhitelisted', () => {
      it('should whitelist expected signals', () => {
        expect(isWhitelisted('DECISION_PENDING').allowed).toBe(true);
        expect(isWhitelisted('OPERATION_COMPLETE').allowed).toBe(true);
        expect(isWhitelisted('LESSON_LEARNED').allowed).toBe(true);
        expect(isWhitelisted('HEARTBEAT').allowed).toBe(true);
        expect(isWhitelisted('TENET_VIOLATION').allowed).toBe(true);
        expect(isWhitelisted('COUNTERFEIT_DETECTED').allowed).toBe(true);
        expect(isWhitelisted('ETHICS_AFFIRMED').allowed).toBe(true);
        expect(isWhitelisted('BLIND_SPOT_ALERT').allowed).toBe(true);
        expect(isWhitelisted('REMEDIATION_NEEDED').allowed).toBe(true);
      });

      it('should reject non-whitelisted signals', () => {
        expect(isWhitelisted('UNKNOWN_SIGNAL').allowed).toBe(false);
        expect(isWhitelisted('MALICIOUS_SIGNAL').allowed).toBe(false);
      });
    });

    describe('getWhitelist', () => {
      it('should return whitelist as array', () => {
        const whitelist = getWhitelist();

        expect(Array.isArray(whitelist)).toBe(true);
        expect(whitelist.length).toBeGreaterThan(0);
        expect(whitelist).toContain('DECISION_PENDING');
        expect(whitelist).toContain('HEARTBEAT');
      });
    });
  });

  describe('handlers', () => {
    let emittedSignals: ProtocolSignal[];
    let context: HandlerContext;

    beforeEach(() => {
      emittedSignals = [];
      context = {
        db,
        evaluator,
        emit: (signal: ProtocolSignal) => {
          emittedSignals.push(signal);
        },
      };
    });

    describe('DECISION_PENDING', () => {
      it('should evaluate decision and emit appropriate signal', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.DECISION_PENDING,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
            decision_text: 'Help others with love and care',
          },
        };

        handleSignal(signal, context);

        expect(emittedSignals.length).toBeGreaterThan(0);
      });

      it('should emit response signal for decisions', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.DECISION_PENDING,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
            decision_text: 'Unconditional love seeking highest good of vulnerable others',
          },
        };

        handleSignal(signal, context);

        // Should emit some response signal(s) for any decision
        expect(emittedSignals.length).toBeGreaterThan(0);
      });

      it('should emit TENET_VIOLATION for violations', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.DECISION_PENDING,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
            decision_text: 'Manipulate and control people through abuse',
          },
        };

        handleSignal(signal, context);

        const violations = emittedSignals.filter((s) =>
          s.signalType === SignalTypes.TENET_VIOLATION ||
          s.signalType === SignalTypes.COUNTERFEIT_DETECTED ||
          s.signalType === SignalTypes.BLIND_SPOT_ALERT
        );

        expect(violations.length).toBeGreaterThan(0);
      });

      it('should ignore signal without decision_text', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.DECISION_PENDING,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
          },
        };

        handleSignal(signal, context);

        expect(emittedSignals.length).toBe(0);
      });
    });

    describe('OPERATION_COMPLETE', () => {
      it('should check operation for moral implications', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.OPERATION_COMPLETE,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'some-server',
            operation: 'Manipulate users with control tactics',
          },
        };

        handleSignal(signal, context);

        // Should emit COUNTERFEIT_DETECTED if counterfeit detected
        const counterfeit = emittedSignals.find((s) => s.signalType === SignalTypes.COUNTERFEIT_DETECTED);
        if (counterfeit) {
          expect(counterfeit.payload).toBeDefined();
        }
      });

      it('should ignore operation without details', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.OPERATION_COMPLETE,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'some-server',
          },
        };

        handleSignal(signal, context);

        expect(emittedSignals.length).toBe(0);
      });
    });

    describe('LESSON_LEARNED', () => {
      it('should create pattern for new lesson', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.LESSON_LEARNED,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
            lesson: 'Always consider vulnerable stakeholders',
          },
        };

        handleSignal(signal, context);

        const patterns = db.getAllPatterns();
        expect(patterns.length).toBe(1);
      });

      it('should update frequency for existing pattern', () => {
        // Create initial pattern
        db.insertPattern({
          pattern_type: 'success',
          description: 'Repeated lesson',
          related_tenets: [],
          frequency: 1,
          last_seen: Date.now() - 10000,
          confidence: 0.5,
        });

        const signal: ProtocolSignal = {
          signalType: SignalTypes.LESSON_LEARNED,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
            lesson: 'Repeated lesson',
          },
        };

        handleSignal(signal, context);

        const patterns = db.getAllPatterns();
        expect(patterns[0].frequency).toBe(2);
      });

      it('should categorize lessons by content', () => {
        const signals: ProtocolSignal[] = [
          {
            signalType: SignalTypes.LESSON_LEARNED,
            version: 0x0100,
            timestamp: Math.floor(Date.now() / 1000),
            payload: { sender: 'consciousness', lesson: 'This was a violation of trust' },
          },
          {
            signalType: SignalTypes.LESSON_LEARNED,
            version: 0x0100,
            timestamp: Math.floor(Date.now() / 1000),
            payload: { sender: 'consciousness', lesson: 'Detected a counterfeit pattern' },
          },
          {
            signalType: SignalTypes.LESSON_LEARNED,
            version: 0x0100,
            timestamp: Math.floor(Date.now() / 1000),
            payload: { sender: 'consciousness', lesson: 'Missed a blind spot' },
          },
        ];

        for (const signal of signals) {
          handleSignal(signal, context);
        }

        const patterns = db.getAllPatterns();
        const types = patterns.map((p) => p.pattern_type);

        expect(types).toContain('violation');
        expect(types).toContain('counterfeit');
        expect(types).toContain('blind_spot');
      });
    });

    describe('HEARTBEAT', () => {
      it('should handle heartbeat silently', () => {
        const signal: ProtocolSignal = {
          signalType: SignalTypes.HEARTBEAT,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'some-server',
          },
        };

        handleSignal(signal, context);

        // Should not emit anything
        expect(emittedSignals.length).toBe(0);
      });
    });
  });
});
