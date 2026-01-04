/**
 * Database Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseManager } from '../src/database/schema.js';
import { seedTenetsInline } from '../src/database/seed.js';

describe('DatabaseManager', () => {
  let db: DatabaseManager;

  beforeEach(() => {
    db = new DatabaseManager(':memory:');
    db.initialize();
  });

  afterEach(() => {
    db.close();
  });

  describe('initialization', () => {
    it('should create all tables', () => {
      const tables = db.query(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      ) as { name: string }[];

      expect(tables.map((t) => t.name)).toContain('tenets');
      expect(tables.map((t) => t.name)).toContain('evaluations');
      expect(tables.map((t) => t.name)).toContain('violations');
      expect(tables.map((t) => t.name)).toContain('patterns');
    });

    it('should be idempotent', () => {
      db.initialize();
      db.initialize();
      expect(db.getTenetCount()).toBe(0);
    });
  });

  describe('tenet operations', () => {
    beforeEach(() => {
      seedTenetsInline(db);
    });

    it('should seed 25 tenets', () => {
      expect(db.getTenetCount()).toBe(25);
    });

    it('should get tenet by id', () => {
      const tenet = db.getTenetById(1);
      expect(tenet).not.toBeNull();
      expect(tenet?.name).toBe('LOVE');
      expect(tenet?.category).toBe('foundation');
    });

    it('should get tenet by name (case insensitive)', () => {
      const tenet = db.getTenetByName('love');
      expect(tenet).not.toBeNull();
      expect(tenet?.id).toBe(1);
    });

    it('should return null for non-existent tenet', () => {
      expect(db.getTenetById(999)).toBeNull();
      expect(db.getTenetByName('NONEXISTENT')).toBeNull();
    });

    it('should get all tenets', () => {
      const tenets = db.getAllTenets();
      expect(tenets.length).toBe(25);
    });

    it('should get tenets by category', () => {
      const foundationTenets = db.getTenetsByCategory('foundation');
      expect(foundationTenets.length).toBe(1);
      expect(foundationTenets[0].name).toBe('LOVE');

      const actionTenets = db.getTenetsByCategory('action');
      expect(actionTenets.length).toBeGreaterThan(0);
    });

    it('should list tenets with summaries', () => {
      const summaries = db.listTenets();
      expect(summaries.length).toBe(25);
      expect(summaries[0]).toHaveProperty('id');
      expect(summaries[0]).toHaveProperty('name');
      expect(summaries[0]).toHaveProperty('category');
      expect(summaries[0]).toHaveProperty('core_test');
    });

    it('should list tenets filtered by category', () => {
      const restoration = db.listTenets('restoration');
      expect(restoration.length).toBeGreaterThan(0);
      restoration.forEach((t) => expect(t.category).toBe('restoration'));
    });
  });

  describe('evaluation operations', () => {
    it('should insert evaluation', () => {
      const evaluation = db.insertEvaluation({
        decision_text: 'Test decision',
        overall_assessment: 'affirm',
        tenet_scores: { 1: 0.8, 2: 0.7 },
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      expect(evaluation.id).toBeDefined();
      expect(evaluation.decision_text).toBe('Test decision');
    });

    it('should get evaluation by id', () => {
      const inserted = db.insertEvaluation({
        decision_text: 'Test',
        overall_assessment: 'caution',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'quick',
      });

      const retrieved = db.getEvaluationById(inserted.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(inserted.id);
    });

    it('should get evaluations with filters', () => {
      db.insertEvaluation({
        decision_text: 'Affirm 1',
        overall_assessment: 'affirm',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      db.insertEvaluation({
        decision_text: 'Reject 1',
        overall_assessment: 'reject',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      const affirms = db.getEvaluations({ assessment: 'affirm' });
      expect(affirms.length).toBe(1);

      const rejects = db.getEvaluations({ assessment: 'reject' });
      expect(rejects.length).toBe(1);
    });

    it('should count evaluations', () => {
      expect(db.getEvaluationCount()).toBe(0);

      db.insertEvaluation({
        decision_text: 'Test',
        overall_assessment: 'affirm',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      expect(db.getEvaluationCount()).toBe(1);
      expect(db.getEvaluationCount('affirm')).toBe(1);
      expect(db.getEvaluationCount('reject')).toBe(0);
    });
  });

  describe('violation operations', () => {
    beforeEach(() => {
      seedTenetsInline(db);
    });

    it('should insert violation', () => {
      const evaluation = db.insertEvaluation({
        decision_text: 'Test',
        overall_assessment: 'reject',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      const violation = db.insertViolation({
        evaluation_id: evaluation.id,
        tenet_id: 1,
        severity: 'high',
        description: 'Test violation',
      });

      expect(violation.id).toBeDefined();
      expect(violation.tenet_id).toBe(1);
    });

    it('should get violations by evaluation', () => {
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
        description: 'Violation 1',
      });

      db.insertViolation({
        evaluation_id: evaluation.id,
        tenet_id: 2,
        severity: 'medium',
        description: 'Violation 2',
      });

      const violations = db.getViolationsByEvaluation(evaluation.id);
      expect(violations.length).toBe(2);
    });

    it('should get violations by tenet', () => {
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
        description: 'Love violation',
      });

      const violations = db.getViolationsByTenet(1);
      expect(violations.length).toBe(1);
      expect(violations[0].description).toBe('Love violation');
    });

    it('should resolve violation', () => {
      const evaluation = db.insertEvaluation({
        decision_text: 'Test',
        overall_assessment: 'reject',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      const violation = db.insertViolation({
        evaluation_id: evaluation.id,
        tenet_id: 1,
        severity: 'high',
        description: 'Test',
      });

      db.resolveViolation(violation.id, 'Fixed by doing X');

      const violations = db.getViolationsByEvaluation(evaluation.id);
      expect(violations[0].remediation_applied).toBe('Fixed by doing X');
      expect(violations[0].resolved_at).toBeDefined();
    });
  });

  describe('pattern operations', () => {
    it('should insert pattern', () => {
      const pattern = db.insertPattern({
        pattern_type: 'violation',
        description: 'Test pattern',
        related_tenets: [1, 2],
        frequency: 1,
        last_seen: Date.now(),
        confidence: 0.7,
      });

      expect(pattern.id).toBeDefined();
      expect(pattern.pattern_type).toBe('violation');
    });

    it('should get patterns by type', () => {
      db.insertPattern({
        pattern_type: 'violation',
        description: 'Violation pattern',
        related_tenets: [],
        frequency: 1,
        last_seen: Date.now(),
        confidence: 0.5,
      });

      db.insertPattern({
        pattern_type: 'success',
        description: 'Success pattern',
        related_tenets: [],
        frequency: 1,
        last_seen: Date.now(),
        confidence: 0.5,
      });

      const violations = db.getPatternsByType('violation');
      expect(violations.length).toBe(1);

      const successes = db.getPatternsByType('success');
      expect(successes.length).toBe(1);
    });

    it('should update pattern frequency', () => {
      const pattern = db.insertPattern({
        pattern_type: 'violation',
        description: 'Test',
        related_tenets: [],
        frequency: 1,
        last_seen: Date.now(),
        confidence: 0.5,
      });

      db.updatePatternFrequency(pattern.id);
      db.updatePatternFrequency(pattern.id);

      const patterns = db.getPatternsByType('violation');
      expect(patterns[0].frequency).toBe(3);
    });

    it('should find pattern by description', () => {
      db.insertPattern({
        pattern_type: 'violation',
        description: 'Specific pattern description',
        related_tenets: [],
        frequency: 1,
        last_seen: Date.now(),
        confidence: 0.5,
      });

      const found = db.findPatternByDescription('Specific pattern description');
      expect(found).not.toBeNull();
      expect(found?.description).toBe('Specific pattern description');

      const notFound = db.findPatternByDescription('Non-existent');
      expect(notFound).toBeNull();
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      seedTenetsInline(db);
    });

    it('should get stats', () => {
      db.insertEvaluation({
        decision_text: 'Affirm',
        overall_assessment: 'affirm',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      db.insertEvaluation({
        decision_text: 'Reject',
        overall_assessment: 'reject',
        tenet_scores: {},
        violations: [],
        counterfeits_matched: [],
        recommendations: [],
        depth: 'standard',
      });

      const stats = db.getStats();
      expect(stats.totalTenets).toBe(25);
      expect(stats.totalEvaluations).toBe(2);
      expect(stats.affirmCount).toBe(1);
      expect(stats.rejectCount).toBe(1);
    });
  });

  describe('transactions', () => {
    it('should support transactions', () => {
      const result = db.transaction(() => {
        db.insertPattern({
          pattern_type: 'violation',
          description: 'In transaction',
          related_tenets: [],
          frequency: 1,
          last_seen: Date.now(),
          confidence: 0.5,
        });
        return 'done';
      });

      expect(result).toBe('done');
      expect(db.getAllPatterns().length).toBe(1);
    });
  });
});
