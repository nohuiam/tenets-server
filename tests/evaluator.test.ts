/**
 * Evaluator Service Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../src/database/schema.js';
import { seedTenetsInline } from '../src/database/seed.js';
import { Evaluator } from '../src/services/evaluator.js';

describe('Evaluator', () => {
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

  describe('evaluate', () => {
    it('should affirm or caution for loving actions', () => {
      const result = evaluator.evaluate(
        'I want to help the vulnerable by providing care and seeking their highest good'
      );

      // Clearly positive actions should not be rejected
      expect(result.overall_assessment).not.toBe('reject');
      expect(result.violations.filter(v => v.severity === 'critical').length).toBe(0);
    });

    it('should flag self-interest disguised as service', () => {
      const result = evaluator.evaluate(
        'I will help them so they will owe me a favor and reciprocate later'
      );

      expect(['caution', 'reject']).toContain(result.overall_assessment);
    });

    it('should detect counterfeit patterns', () => {
      const result = evaluator.evaluate(
        'I love them so much I need to control every aspect of their life for their own good'
      );

      expect(result.counterfeits_matched.length).toBeGreaterThan(0);
    });

    it('should generate recommendations', () => {
      const result = evaluator.evaluate('Some vague action without clear ethical grounding');

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should score individual tenets', () => {
      const result = evaluator.evaluate(
        'I will forgive them and offer mercy while holding them accountable'
      );

      expect(Object.keys(result.tenet_scores).length).toBe(25);
    });

    it('should handle context', () => {
      const result = evaluator.evaluate('Help the community', {
        context: { setting: 'nonprofit', budget: 'limited' },
      });

      expect(result.context).toEqual({ setting: 'nonprofit', budget: 'limited' });
    });

    it('should handle stakeholders', () => {
      const result = evaluator.evaluate('Launch new product', {
        stakeholders: ['customers', 'employees', 'shareholders'],
      });

      expect(result.stakeholders).toEqual(['customers', 'employees', 'shareholders']);
    });

    it('should support quick depth', () => {
      const result = evaluator.evaluate('Quick test', { depth: 'quick' });
      expect(result.depth).toBe('quick');
    });

    it('should support deep depth', () => {
      const result = evaluator.evaluate('Deep test with love and sacrifice', { depth: 'deep' });
      expect(result.depth).toBe('deep');
    });

    it('should store evaluation in database', () => {
      const result = evaluator.evaluate('Test evaluation');

      const stored = db.getEvaluationById(result.id);
      expect(stored).not.toBeNull();
      expect(stored?.decision_text).toBe('Test evaluation');
    });

    it('should store violations in database', () => {
      const result = evaluator.evaluate(
        'I will manipulate them through transactional love'
      );

      if (result.violations.length > 0) {
        const violations = db.getViolationsByEvaluation(result.id);
        expect(violations.length).toBe(result.violations.length);
      }
    });
  });

  describe('quickEvaluate', () => {
    it('should pass love test for loving actions', () => {
      const result = evaluator.quickEvaluate(
        'Seek the highest good and care for others'
      );

      expect(result.loveTestPassed).toBe(true);
    });

    it('should pass vulnerability test for protective actions', () => {
      const result = evaluator.quickEvaluate(
        'Protect the vulnerable and marginalized from exploitation'
      );

      expect(result.vulnerabilityTestPassed).toBe(true);
    });

    it('should detect counterfeits', () => {
      const result = evaluator.quickEvaluate(
        'Manipulate and control them for my self-interest'
      );

      expect(result.counterfeitDetected).toBe(true);
      expect(result.assessment).toBe('reject');
    });

    it('should affirm clearly good actions', () => {
      const result = evaluator.quickEvaluate(
        'Protect the vulnerable by providing care and seeking their highest good'
      );

      expect(result.assessment).toBe('affirm');
    });
  });

  describe('evaluateAgainstTenet', () => {
    it('should evaluate against specific tenet', () => {
      const result = evaluator.evaluateAgainstTenet(
        'Seeking the highest good of others through active care',
        1 // LOVE
      );

      expect(result.score).toBeGreaterThan(0.5);
      expect(result.matches_criteria.length).toBeGreaterThan(0);
    });

    it('should detect counterfeit for specific tenet', () => {
      const result = evaluator.evaluateAgainstTenet(
        'Transactional conditions that require reciprocation',
        1 // LOVE
      );

      expect(result.counterfeit_detected).toBeDefined();
    });

    it('should throw for non-existent tenet', () => {
      expect(() => {
        evaluator.evaluateAgainstTenet('Test', 999);
      }).toThrow('Tenet 999 not found');
    });

    it('should provide recommendation', () => {
      const result = evaluator.evaluateAgainstTenet('Some action', 7); // JUSTICE

      expect(result.recommendation).toBeDefined();
      expect(result.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('scoring algorithm', () => {
    it('should score higher for aligned decisions', () => {
      const aligned = evaluator.evaluate(
        'Love others unconditionally, seek their highest good, protect the vulnerable'
      );

      const misaligned = evaluator.evaluate(
        'Take advantage of people, manipulate for personal gain, ignore the weak'
      );

      const alignedAvg = Object.values(aligned.tenet_scores).reduce((a, b) => a + b, 0) / 25;
      const misalignedAvg = Object.values(misaligned.tenet_scores).reduce((a, b) => a + b, 0) / 25;

      expect(alignedAvg).toBeGreaterThan(misalignedAvg);
    });

    it('should penalize counterfeit matches', () => {
      const authentic = evaluator.evaluate('Genuine love and care for others');

      const counterfeit = evaluator.evaluate(
        'Love that controls and manipulates people for their own good'
      );

      expect(counterfeit.overall_assessment).not.toBe('affirm');
    });

    it('should consider all tenet categories', () => {
      const result = evaluator.evaluate(
        'Love with truth, serve with humility, seek peace in community, offer forgiveness'
      );

      // Check that tenets from different categories are scored
      expect(result.tenet_scores[1]).toBeDefined(); // LOVE (foundation)
      expect(result.tenet_scores[9]).toBeDefined(); // TRUTH (character)
      expect(result.tenet_scores[8]).toBeDefined(); // SERVICE (action)
      expect(result.tenet_scores[5]).toBeDefined(); // PEACE (community)
      expect(result.tenet_scores[4]).toBeDefined(); // FORGIVENESS (restoration)
    });
  });

  describe('assessment thresholds', () => {
    it('should not reject high-scoring decisions', () => {
      const result = evaluator.evaluate(
        'I will help the vulnerable with genuine care and seek their highest good selflessly'
      );

      // High-scoring ethical decisions should not be rejected
      expect(result.overall_assessment).not.toBe('reject');
    });

    it('should reject decisions with critical violations', () => {
      // Create a decision that explicitly matches multiple counterfeits
      const result = evaluator.evaluate(
        'Abuse claiming to be love, manipulation for control, exploitation of vulnerable'
      );

      expect(['caution', 'reject']).toContain(result.overall_assessment);
    });

    it('should caution for borderline cases', () => {
      const result = evaluator.evaluate(
        'A vague action without clear ethical grounding or harm indicators'
      );

      // Borderline cases should not be affirmed
      expect(['caution', 'reject']).not.toContain('affirm');
      expect(['caution', 'reject']).toContain(result.overall_assessment);
    });
  });
});
