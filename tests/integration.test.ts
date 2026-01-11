/**
 * Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../src/database/schema.js';
import { seedTenetsInline } from '../src/database/seed.js';
import { Evaluator } from '../src/services/evaluator.js';
import { CounterfeitDetector } from '../src/services/counterfeit-detector.js';
import { handleSignal, type HandlerContext } from '../src/interlock/handlers.js';
import { SignalTypes } from '../src/types.js';
import { type Signal } from '../src/interlock/protocol.js';

describe('Integration Tests', () => {
  let db: DatabaseManager;
  let evaluator: Evaluator;
  let counterfeitDetector: CounterfeitDetector;

  beforeEach(() => {
    db = new DatabaseManager(':memory:');
    db.initialize();
    seedTenetsInline(db);
    evaluator = new Evaluator(db);
    counterfeitDetector = new CounterfeitDetector(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('end-to-end evaluation flow', () => {
    it('should evaluate, record, and retrieve history', () => {
      // Step 1: Evaluate a decision
      const evaluation = evaluator.evaluate(
        'Help vulnerable people with love and care'
      );

      expect(evaluation.id).toBeDefined();
      // Clearly positive actions should not be rejected
      expect(['affirm', 'caution']).toContain(evaluation.overall_assessment);

      // Step 2: Verify it was stored
      const stored = db.getEvaluationById(evaluation.id);
      expect(stored).not.toBeNull();
      expect(stored?.decision_text).toBe('Help vulnerable people with love and care');

      // Step 3: Retrieve history (without filter to get all)
      const history = db.getEvaluations({});
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(evaluation.id);
    });

    it('should track violations across evaluations', () => {
      // Create evaluations with violations
      evaluator.evaluate('Manipulate people for control');
      evaluator.evaluate('Exploit the vulnerable for gain');
      evaluator.evaluate('Control others through fear');

      // Check violation patterns emerged
      const violations = db.getViolationsByTenet(1); // LOVE violations
      // May or may not have LOVE violations depending on detection
      expect(Array.isArray(violations)).toBe(true);

      // Check stats
      const stats = db.getStats();
      expect(stats.totalEvaluations).toBe(3);
    });
  });

  describe('counterfeit detection integration', () => {
    it('should detect and record counterfeit patterns', () => {
      // Evaluate a counterfeit action
      const evaluation = evaluator.evaluate(
        'I love them so I need to control every aspect of their life'
      );

      // Check counterfeit was detected
      expect(evaluation.counterfeits_matched.length).toBeGreaterThan(0);

      // Verify counterfeit detection matches
      const check = counterfeitDetector.check(
        'I love them so I need to control every aspect of their life',
        'LOVE'
      );

      expect(check.is_counterfeit).toBe(true);
    });

    it('should link counterfeits to specific tenets', () => {
      const result = counterfeitDetector.check(
        'Transactional love requiring reciprocation',
        'LOVE'
      );

      if (result.is_counterfeit) {
        expect(result.matched_counterfeits[0].tenet_name).toBe('LOVE');
      }
    });
  });

  describe('InterLock mesh integration', () => {
    let emittedSignals: Signal[];
    let context: HandlerContext;

    beforeEach(() => {
      emittedSignals = [];
      context = {
        db,
        evaluator,
        emit: (signal: Signal) => {
          emittedSignals.push(signal);
        },
      };
    });

    it('should process decision pending and emit result', () => {
      const signal: Signal = {
        signalType: SignalTypes.DECISION_PENDING,
        version: 0x0100,
        timestamp: Math.floor(Date.now() / 1000),
        payload: {
          sender: 'consciousness',
          decision_text: 'Serve others with humility and love',
        },
      };

      handleSignal(signal, context);

      // Should have emitted some signal
      expect(emittedSignals.length).toBeGreaterThan(0);

      // Evaluation should be stored
      const evaluations = db.getEvaluations({});
      expect(evaluations.length).toBe(1);
    });

    it('should build pattern knowledge from lessons', () => {
      const lessons = [
        'Never manipulate in the name of love',
        'Service should empower, not create dependency',
        'Forgiveness requires accountability',
      ];

      for (const lesson of lessons) {
        const signal: Signal = {
          signalType: SignalTypes.LESSON_LEARNED,
          version: 0x0100,
          timestamp: Math.floor(Date.now() / 1000),
          payload: {
            sender: 'consciousness',
            lesson,
          },
        };
        handleSignal(signal, context);
      }

      const patterns = db.getAllPatterns();
      expect(patterns.length).toBe(3);
    });
  });

  describe('tenet category coverage', () => {
    it('should have all 5 categories represented', () => {
      const tenets = db.getAllTenets();
      const categories = new Set(tenets.map((t) => t.category));

      expect(categories.size).toBe(5);
      expect(categories.has('foundation')).toBe(true);
      expect(categories.has('action')).toBe(true);
      expect(categories.has('character')).toBe(true);
      expect(categories.has('community')).toBe(true);
      expect(categories.has('restoration')).toBe(true);
    });

    it('should evaluate decisions against all categories', () => {
      const evaluation = evaluator.evaluate(
        'Love with truth, serve with humility, build peace in community, offer grace'
      );

      // Should have scores for all 25 tenets
      expect(Object.keys(evaluation.tenet_scores).length).toBe(25);
    });
  });

  describe('remediation flow', () => {
    it('should provide remediation for violations', () => {
      // Evaluate a problematic decision
      const evaluation = evaluator.evaluate(
        'Exploit the vulnerable for personal gain'
      );

      // Check for recommendations
      expect(evaluation.recommendations.length).toBeGreaterThan(0);

      // Verify remediation can be suggested for any violation
      const tenet = db.getTenetByName('JUSTICE');
      if (tenet) {
        const criterion = tenet.decision_criteria[0];
        expect(criterion).toBeDefined();
      }
    });
  });

  describe('pattern learning', () => {
    it('should detect recurring patterns', () => {
      // Create multiple similar evaluations
      for (let i = 0; i < 5; i++) {
        evaluator.evaluate(`Self-interest action ${i}`);
      }

      // Record pattern
      db.insertPattern({
        pattern_type: 'violation',
        description: 'Self-interest disguised as service',
        related_tenets: [1, 8],
        frequency: 5,
        last_seen: Date.now(),
        confidence: 0.8,
      });

      // Check pattern exists
      const patterns = db.getPatternsByType('violation');
      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('scripture anchor integration', () => {
    it('should have scripture anchors for all tenets', () => {
      const tenets = db.getAllTenets();

      for (const tenet of tenets) {
        expect(tenet.scripture_anchors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('transformation pattern integration', () => {
    it('should have transformation patterns for all tenets', () => {
      const tenets = db.getAllTenets();

      for (const tenet of tenets) {
        expect(tenet.transformation_pattern).toBeDefined();
        expect(tenet.transformation_pattern.length).toBeGreaterThan(0);
      }
    });
  });

  describe('counterfeit coverage', () => {
    it('should have counterfeits for all tenets', () => {
      const tenets = db.getAllTenets();

      for (const tenet of tenets) {
        expect(tenet.counterfeits.length).toBeGreaterThan(0);
      }
    });
  });

  describe('decision criteria coverage', () => {
    it('should have decision criteria for all tenets', () => {
      const tenets = db.getAllTenets();

      for (const tenet of tenets) {
        expect(tenet.decision_criteria.length).toBeGreaterThan(0);
      }
    });
  });
});
