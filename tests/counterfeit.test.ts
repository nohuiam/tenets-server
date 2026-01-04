/**
 * Counterfeit Detector Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../src/database/schema.js';
import { seedTenetsInline } from '../src/database/seed.js';
import { CounterfeitDetector } from '../src/services/counterfeit-detector.js';

describe('CounterfeitDetector', () => {
  let db: DatabaseManager;
  let detector: CounterfeitDetector;

  beforeEach(() => {
    db = new DatabaseManager(':memory:');
    db.initialize();
    seedTenetsInline(db);
    detector = new CounterfeitDetector(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('check', () => {
    it('should detect transactional love', () => {
      const result = detector.check(
        'I love you if you do this for me in return'
      );

      expect(result.is_counterfeit).toBe(true);
      expect(result.matched_counterfeits.length).toBeGreaterThan(0);
    });

    it('should detect control masquerading as care', () => {
      const result = detector.check(
        'You must do this or else. It is for your own good.'
      );

      expect(result.is_counterfeit).toBe(true);
    });

    it('should detect performance for recognition', () => {
      const result = detector.check(
        'I gave to charity so people would see and give me credit'
      );

      expect(result.is_counterfeit).toBe(true);
    });

    it('should detect tribalism claiming unity', () => {
      const result = detector.check(
        'Our kind needs to stick together against those people who are not one of us'
      );

      expect(result.is_counterfeit).toBe(true);
    });

    it('should detect punishment as justice', () => {
      const result = detector.check(
        'They deserve payback. We need to make them pay for what they did.'
      );

      expect(result.is_counterfeit).toBe(true);
    });

    it('should not flag authentic actions', () => {
      const result = detector.check(
        'I want to help them recover and become independent'
      );

      expect(result.is_counterfeit).toBe(false);
    });

    it('should provide authentic alternative', () => {
      const result = detector.check(
        'I love you if you meet my conditions',
        'LOVE'
      );

      expect(result.authentic_alternative).toBeDefined();
      expect(result.authentic_alternative?.length).toBeGreaterThan(0);
    });

    it('should provide explanation', () => {
      const result = detector.check('Some action');

      expect(result.explanation).toBeDefined();
      expect(result.explanation.length).toBeGreaterThan(0);
    });

    it('should check against specific claimed tenet', () => {
      const result = detector.check(
        'I will control every aspect of their life',
        'LOVE'
      );

      if (result.is_counterfeit) {
        const loveMatch = result.matched_counterfeits.find((m) => m.tenet_name === 'LOVE');
        expect(loveMatch).toBeDefined();
      }
    });

    it('should return confidence scores', () => {
      const result = detector.check(
        'Transactional conditions require reciprocation in return'
      );

      if (result.is_counterfeit) {
        result.matched_counterfeits.forEach((match) => {
          expect(match.confidence).toBeGreaterThanOrEqual(0);
          expect(match.confidence).toBeLessThanOrEqual(1);
        });
      }
    });
  });

  describe('specific counterfeit patterns', () => {
    describe('LOVE counterfeits', () => {
      it('should detect possessiveness', () => {
        const result = detector.check(
          'I cannot let them go, they belong to me',
          'LOVE'
        );

        expect(result.is_counterfeit).toBe(true);
      });

      it('should detect manipulation through flattery', () => {
        const result = detector.check(
          'I tell them what they want to hear to control them',
          'LOVE'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('HEALING counterfeits', () => {
      it('should detect dependency creation', () => {
        const result = detector.check(
          'I fix all their problems so they need me and rely only on me',
          'HEALING'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('COMPASSION counterfeits', () => {
      it('should detect sentiment without action', () => {
        const result = detector.check(
          'I feel sorry for them but won\'t actually help',
          'COMPASSION'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('FORGIVENESS counterfeits', () => {
      it('should detect cheap grace', () => {
        const result = detector.check(
          'Just forgive them with no consequences, forget it happened',
          'FORGIVENESS'
        );

        expect(result.is_counterfeit).toBe(true);
      });

      it('should detect revenge disguised as justice', () => {
        const result = detector.check(
          'I will get revenge and call it justice',
          'FORGIVENESS'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('SERVICE counterfeits', () => {
      it('should detect self-promotion disguised as service', () => {
        const result = detector.check(
          'I serve others so people notice and give me recognition',
          'SERVICE'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('HUMILITY counterfeits', () => {
      it('should detect false humility', () => {
        const result = detector.check(
          'I pretend to be meek while secretly seeking praise',
          'HUMILITY'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('GRACE counterfeits', () => {
      it('should detect conditional grace', () => {
        const result = detector.check(
          'You can earn my acceptance if you perform well',
          'GRACE'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });

    describe('UNITY counterfeits', () => {
      it('should detect forced uniformity', () => {
        const result = detector.check(
          'Everyone must think alike or they are not welcome',
          'UNITY'
        );

        expect(result.is_counterfeit).toBe(true);
      });
    });
  });

  describe('getCounterfeitsForTenet', () => {
    it('should return counterfeits for LOVE', () => {
      const counterfeits = detector.getCounterfeitsForTenet('LOVE');

      expect(counterfeits.length).toBeGreaterThan(0);
    });

    it('should return empty for non-existent tenet', () => {
      const counterfeits = detector.getCounterfeitsForTenet('NONEXISTENT');

      expect(counterfeits.length).toBe(0);
    });
  });

  describe('getTenetsAffectedByPattern', () => {
    it('should find tenets affected by "manipulation" pattern', () => {
      // Using "manipulation" since it appears in LOVE counterfeits in inline seed data
      const affected = detector.getTenetsAffectedByPattern('manipulation');

      expect(affected.length).toBeGreaterThan(0);
    });

    it('should return empty for unrelated pattern', () => {
      const affected = detector.getTenetsAffectedByPattern('xyznonexistent123');

      expect(affected.length).toBe(0);
    });
  });

  describe('analyzePatternFrequency', () => {
    it('should analyze pattern frequency', () => {
      // Add some violations first
      const evaluation = db.insertEvaluation({
        decision_text: 'Test',
        overall_assessment: 'reject',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      db.insertViolation({
        evaluation_id: evaluation.id,
        tenet_id: 1,
        severity: 'high',
        description: 'Test',
        counterfeit_pattern: 'control pattern detected',
      });

      const analysis = detector.analyzePatternFrequency('control');

      expect(analysis.pattern).toBe('control');
      expect(analysis.occurrences).toBeGreaterThanOrEqual(0);
      expect(analysis.affected_tenets).toBeDefined();
      expect(analysis.severity_distribution).toBeDefined();
    });
  });

  describe('universal patterns', () => {
    it('should detect self-interest disguised as service', () => {
      const result = detector.check(
        'I will help them for my benefit, expecting what I get in return'
      );

      expect(result.is_counterfeit).toBe(true);
    });

    it('should detect enabling disguised as compassion', () => {
      const result = detector.check(
        'I can\'t say no and always give in to avoid conflict'
      );

      expect(result.is_counterfeit).toBe(true);
    });

    it('should detect cheap grace without accountability', () => {
      const result = detector.check(
        'Just forgive, move on, no consequences, doesn\'t matter'
      );

      expect(result.is_counterfeit).toBe(true);
    });
  });
});
