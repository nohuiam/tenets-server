/**
 * MCP Tools Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../src/database/schema.js';
import { seedTenetsInline } from '../src/database/seed.js';
import { Evaluator } from '../src/services/evaluator.js';
import { CounterfeitDetector } from '../src/services/counterfeit-detector.js';

import {
  createEvaluateDecisionHandler,
  createCheckCounterfeitHandler,
  createIdentifyBlindSpotsHandler,
  createRecordEvaluationHandler,
  createGetEvaluationHistoryHandler,
  createGetTenetHandler,
  createListTenetsHandler,
  createSuggestRemediationHandler,
} from '../src/tools/index.js';

describe('MCP Tools', () => {
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

  describe('evaluate_decision', () => {
    it('should evaluate a decision', async () => {
      const handler = createEvaluateDecisionHandler(evaluator);
      const result = await handler({
        decision_text: 'Help others with love and care',
        depth: 'standard',
      });

      expect(result.evaluation_id).toBeDefined();
      expect(result.overall_assessment).toBeDefined();
      expect(result.tenet_scores).toBeDefined();
    });

    it('should support depth parameter', async () => {
      const handler = createEvaluateDecisionHandler(evaluator);
      const result = await handler({
        decision_text: 'Test decision',
        depth: 'deep',
      });

      expect(result.evaluation_id).toBeDefined();
    });

    it('should include context and stakeholders', async () => {
      const handler = createEvaluateDecisionHandler(evaluator);
      const result = await handler({
        decision_text: 'Business decision',
        context: { industry: 'tech' },
        stakeholders: ['employees', 'customers'],
        depth: 'standard',
      });

      expect(result.evaluation_id).toBeDefined();
    });

    it('should return violations when detected', async () => {
      const handler = createEvaluateDecisionHandler(evaluator);
      const result = await handler({
        decision_text: 'Manipulate and control people for my benefit',
        depth: 'standard',
      });

      expect(Array.isArray(result.violations)).toBe(true);
    });

    it('should return recommendations', async () => {
      const handler = createEvaluateDecisionHandler(evaluator);
      const result = await handler({
        decision_text: 'Some vague action',
        depth: 'standard',
      });

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('check_counterfeit', () => {
    it('should check for counterfeit patterns', async () => {
      const handler = createCheckCounterfeitHandler(counterfeitDetector);
      const result = await handler({
        action_description: 'Love them by controlling their life',
      });

      expect(result.is_counterfeit).toBeDefined();
      expect(result.matched_counterfeits).toBeDefined();
      expect(result.explanation).toBeDefined();
    });

    it('should check against claimed tenet', async () => {
      const handler = createCheckCounterfeitHandler(counterfeitDetector);
      const result = await handler({
        action_description: 'Transactional relationship',
        claimed_tenet: 'LOVE',
      });

      expect(result.is_counterfeit).toBe(true);
    });

    it('should provide authentic alternative', async () => {
      const handler = createCheckCounterfeitHandler(counterfeitDetector);
      const result = await handler({
        action_description: 'Control them for their own good',
        claimed_tenet: 'LOVE',
      });

      if (result.is_counterfeit) {
        expect(result.authentic_alternative).toBeDefined();
      }
    });
  });

  describe('identify_blind_spots', () => {
    it('should identify blind spots in a plan', async () => {
      const handler = createIdentifyBlindSpotsHandler(db);
      const result = await handler({
        plan_text: 'Launch a new product for customers',
      });

      expect(result.blind_spots).toBeDefined();
      expect(result.missing_stakeholders).toBeDefined();
      expect(result.unaddressed_harms).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should support scope parameter', async () => {
      const handler = createIdentifyBlindSpotsHandler(db);

      const stakeholders = await handler({
        plan_text: 'Test plan',
        scope: 'stakeholders',
      });

      const harms = await handler({
        plan_text: 'Test plan',
        scope: 'harms',
      });

      const tenets = await handler({
        plan_text: 'Test plan',
        scope: 'tenets',
      });

      expect(stakeholders.blind_spots).toBeDefined();
      expect(harms.blind_spots).toBeDefined();
      expect(tenets.blind_spots).toBeDefined();
    });

    it('should detect missing stakeholders', async () => {
      const handler = createIdentifyBlindSpotsHandler(db);
      const result = await handler({
        plan_text: 'A plan that only mentions profits',
        scope: 'stakeholders',
      });

      expect(result.missing_stakeholders.length).toBeGreaterThan(0);
    });

    it('should detect unaddressed harms', async () => {
      const handler = createIdentifyBlindSpotsHandler(db);
      const result = await handler({
        plan_text: 'Collect user data and track everything',
        scope: 'harms',
      });

      expect(result.unaddressed_harms.length).toBeGreaterThan(0);
    });
  });

  describe('record_evaluation', () => {
    it('should record an evaluation', async () => {
      const handler = createRecordEvaluationHandler(db);
      const result = await handler({
        decision_id: 'test-decision-1',
        assessment: 'affirm',
      });

      expect(result.recorded).toBe(true);
      expect(result.evaluation_id).toBeDefined();
      expect(result.patterns_triggered).toBeDefined();
    });

    it('should record violations', async () => {
      const handler = createRecordEvaluationHandler(db);
      const result = await handler({
        decision_id: 'test-decision-2',
        assessment: 'reject',
        violations: ['Violated LOVE', 'Violated JUSTICE'],
      });

      expect(result.recorded).toBe(true);
      expect(result.patterns_triggered.length).toBeGreaterThan(0);
    });

    it('should trigger patterns', async () => {
      const handler = createRecordEvaluationHandler(db);

      // Record first occurrence
      await handler({
        decision_id: 'decision-1',
        assessment: 'reject',
        violations: ['Repeated violation'],
      });

      // Record second occurrence - should match existing pattern
      const result = await handler({
        decision_id: 'decision-2',
        assessment: 'reject',
        violations: ['Repeated violation'],
      });

      expect(result.patterns_triggered.length).toBeGreaterThan(0);
    });
  });

  describe('get_evaluation_history', () => {
    beforeEach(async () => {
      // Add some evaluations
      db.insertEvaluation({
        decision_text: 'Affirmed decision',
        overall_assessment: 'affirm',
        tenet_scores: { 1: 0.9 },
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      db.insertEvaluation({
        decision_text: 'Rejected decision',
        overall_assessment: 'reject',
        tenet_scores: { 1: 0.2 },
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });
    });

    it('should get evaluation history', async () => {
      const handler = createGetEvaluationHistoryHandler(db);
      const result = await handler({});

      expect(result.evaluations.length).toBe(2);
      expect(result.count).toBe(2);
    });

    it('should filter by assessment', async () => {
      const handler = createGetEvaluationHistoryHandler(db);
      const result = await handler({
        assessment_filter: 'affirm',
      });

      expect(result.evaluations.length).toBe(1);
    });

    it('should respect limit', async () => {
      const handler = createGetEvaluationHistoryHandler(db);
      const result = await handler({
        limit: 1,
      });

      expect(result.evaluations.length).toBe(1);
    });

    it('should include violation patterns', async () => {
      const handler = createGetEvaluationHistoryHandler(db);
      const result = await handler({});

      expect(result.violation_patterns).toBeDefined();
    });
  });

  describe('get_tenet', () => {
    it('should get tenet by name', async () => {
      const handler = createGetTenetHandler(db);
      const result = await handler({
        tenet_name: 'LOVE',
      });

      expect(result.id).toBe(1);
      expect(result.name).toBe('LOVE');
      expect(result.category).toBe('foundation');
    });

    it('should get tenet by id', async () => {
      const handler = createGetTenetHandler(db);
      const result = await handler({
        tenet_id: 7,
      });

      expect(result.name).toBe('JUSTICE');
    });

    it('should include all tenet fields', async () => {
      const handler = createGetTenetHandler(db);
      const result = await handler({
        tenet_name: 'LOVE',
      });

      expect(result.definition).toBeDefined();
      expect(result.scripture_anchors).toBeDefined();
      expect(result.decision_criteria).toBeDefined();
      expect(result.counterfeits).toBeDefined();
      expect(result.transformation_pattern).toBeDefined();
    });

    it('should throw for non-existent tenet', async () => {
      const handler = createGetTenetHandler(db);

      await expect(
        handler({ tenet_name: 'NONEXISTENT' })
      ).rejects.toThrow('Tenet not found');
    });
  });

  describe('list_tenets', () => {
    it('should list all tenets', async () => {
      const handler = createListTenetsHandler(db);
      const result = await handler({});

      expect(result.tenets.length).toBe(25);
      expect(result.count).toBe(25);
    });

    it('should filter by category', async () => {
      const handler = createListTenetsHandler(db);

      const foundation = await handler({ category: 'foundation' });
      expect(foundation.tenets.length).toBe(1);

      const action = await handler({ category: 'action' });
      expect(action.tenets.length).toBeGreaterThan(0);
    });

    it('should include tenet summaries', async () => {
      const handler = createListTenetsHandler(db);
      const result = await handler({});

      expect(result.tenets[0].id).toBeDefined();
      expect(result.tenets[0].name).toBeDefined();
      expect(result.tenets[0].category).toBeDefined();
      expect(result.tenets[0].core_test).toBeDefined();
    });
  });

  describe('suggest_remediation', () => {
    it('should suggest remediation steps', async () => {
      const handler = createSuggestRemediationHandler(db);
      const result = await handler({
        violation_description: 'Treated people as transactions',
        tenet_violated: 'LOVE',
      });

      expect(result.remediation_steps.length).toBeGreaterThan(0);
      expect(result.scripture_guidance).toBeDefined();
      expect(result.transformation_path).toBeDefined();
      expect(result.related_tenets).toBeDefined();
    });

    it('should throw for non-existent tenet', async () => {
      const handler = createSuggestRemediationHandler(db);

      await expect(
        handler({
          violation_description: 'Test',
          tenet_violated: 'NONEXISTENT',
        })
      ).rejects.toThrow('Tenet not found');
    });

    it('should provide scripture guidance', async () => {
      const handler = createSuggestRemediationHandler(db);
      const result = await handler({
        violation_description: 'Failed to forgive',
        tenet_violated: 'FORGIVENESS',
      });

      expect(result.scripture_guidance).toBeDefined();
      expect(result.scripture_guidance.length).toBeGreaterThan(0);
    });

    it('should suggest related tenets', async () => {
      const handler = createSuggestRemediationHandler(db);
      const result = await handler({
        violation_description: 'Acted without love',
        tenet_violated: 'LOVE',
      });

      expect(result.related_tenets.length).toBeGreaterThan(0);
    });
  });
});
