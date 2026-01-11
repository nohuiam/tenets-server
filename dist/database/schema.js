/**
 * Tenets Server Database Schema
 * SQLite database with 4 tables: tenets, evaluations, violations, patterns
 */
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { clampConfidence } from '../types.js';
// =============================================================================
// Database Manager
// =============================================================================
export class DatabaseManager {
    db;
    initialized = false;
    constructor(dbPath = ':memory:') {
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
    }
    // ---------------------------------------------------------------------------
    // Initialization
    // ---------------------------------------------------------------------------
    initialize() {
        if (this.initialized)
            return;
        // Create tenets table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS tenets (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        definition TEXT NOT NULL,
        scripture_anchors TEXT NOT NULL,
        decision_criteria TEXT NOT NULL,
        counterfeits TEXT NOT NULL,
        sub_tenets TEXT,
        transformation_pattern TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
        // Create evaluations table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        decision_text TEXT NOT NULL,
        context TEXT,
        stakeholders TEXT,
        overall_assessment TEXT NOT NULL,
        tenet_scores TEXT NOT NULL,
        violations TEXT,
        counterfeits_matched TEXT,
        recommendations TEXT,
        depth TEXT DEFAULT 'standard',
        created_at INTEGER NOT NULL
      )
    `);
        // Create violations table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS violations (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        tenet_id INTEGER NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        counterfeit_pattern TEXT,
        remediation_applied TEXT,
        resolved_at INTEGER,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
        FOREIGN KEY (tenet_id) REFERENCES tenets(id)
      )
    `);
        // Create patterns table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        pattern_type TEXT NOT NULL,
        description TEXT NOT NULL,
        related_tenets TEXT,
        frequency INTEGER DEFAULT 1,
        last_seen INTEGER,
        confidence REAL DEFAULT 0.5,
        created_at INTEGER NOT NULL
      )
    `);
        // Create indexes
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tenets_category ON tenets(category);
      CREATE INDEX IF NOT EXISTS idx_tenets_name ON tenets(name);
      CREATE INDEX IF NOT EXISTS idx_evaluations_assessment ON evaluations(overall_assessment);
      CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at);
      CREATE INDEX IF NOT EXISTS idx_violations_tenet ON violations(tenet_id);
      CREATE INDEX IF NOT EXISTS idx_violations_evaluation ON violations(evaluation_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type);
    `);
        this.initialized = true;
    }
    close() {
        this.db.close();
    }
    // ---------------------------------------------------------------------------
    // Tenet Operations
    // ---------------------------------------------------------------------------
    rowToTenet(row) {
        return {
            id: row.id,
            name: row.name,
            definition: row.definition,
            scripture_anchors: JSON.parse(row.scripture_anchors),
            decision_criteria: JSON.parse(row.decision_criteria),
            counterfeits: JSON.parse(row.counterfeits),
            sub_tenets: row.sub_tenets ? JSON.parse(row.sub_tenets) : null,
            transformation_pattern: row.transformation_pattern,
            category: row.category,
            created_at: row.created_at,
        };
    }
    insertTenet(tenet) {
        const now = tenet.created_at ?? Date.now();
        const stmt = this.db.prepare(`
      INSERT INTO tenets (id, name, definition, scripture_anchors, decision_criteria, counterfeits, sub_tenets, transformation_pattern, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(tenet.id, tenet.name, tenet.definition, JSON.stringify(tenet.scripture_anchors), JSON.stringify(tenet.decision_criteria), JSON.stringify(tenet.counterfeits), tenet.sub_tenets ? JSON.stringify(tenet.sub_tenets) : null, tenet.transformation_pattern, tenet.category, now);
        return { ...tenet, created_at: now };
    }
    getTenetById(id) {
        const stmt = this.db.prepare('SELECT * FROM tenets WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.rowToTenet(row) : null;
    }
    getTenetByName(name) {
        const stmt = this.db.prepare('SELECT * FROM tenets WHERE LOWER(name) = LOWER(?)');
        const row = stmt.get(name);
        return row ? this.rowToTenet(row) : null;
    }
    getAllTenets() {
        const stmt = this.db.prepare('SELECT * FROM tenets ORDER BY id');
        const rows = stmt.all();
        return rows.map(row => this.rowToTenet(row));
    }
    getTenetsByCategory(category) {
        const stmt = this.db.prepare('SELECT * FROM tenets WHERE category = ? ORDER BY id');
        const rows = stmt.all(category);
        return rows.map(row => this.rowToTenet(row));
    }
    listTenets(category) {
        let stmt;
        let rows;
        if (category) {
            stmt = this.db.prepare('SELECT id, name, category, decision_criteria FROM tenets WHERE category = ? ORDER BY id');
            rows = stmt.all(category);
        }
        else {
            stmt = this.db.prepare('SELECT id, name, category, decision_criteria FROM tenets ORDER BY id');
            rows = stmt.all();
        }
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            core_test: JSON.parse(row.decision_criteria)[0] || '',
        }));
    }
    getTenetCount() {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM tenets');
        const row = stmt.get();
        return row.count;
    }
    // ---------------------------------------------------------------------------
    // Evaluation Operations
    // ---------------------------------------------------------------------------
    rowToEvaluation(row) {
        return {
            id: row.id,
            decision_text: row.decision_text,
            context: row.context ? JSON.parse(row.context) : undefined,
            stakeholders: row.stakeholders ? JSON.parse(row.stakeholders) : undefined,
            overall_assessment: row.overall_assessment,
            tenet_scores: JSON.parse(row.tenet_scores),
            violations: row.violations ? JSON.parse(row.violations) : [],
            counterfeits_matched: row.counterfeits_matched ? JSON.parse(row.counterfeits_matched) : [],
            recommendations: row.recommendations ? JSON.parse(row.recommendations) : [],
            depth: row.depth,
            created_at: row.created_at,
        };
    }
    insertEvaluation(evaluation) {
        const id = uuidv4();
        const now = Date.now();
        const stmt = this.db.prepare(`
      INSERT INTO evaluations (id, decision_text, context, stakeholders, overall_assessment, tenet_scores, violations, counterfeits_matched, recommendations, depth, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, evaluation.decision_text, evaluation.context ? JSON.stringify(evaluation.context) : null, evaluation.stakeholders ? JSON.stringify(evaluation.stakeholders) : null, evaluation.overall_assessment, JSON.stringify(evaluation.tenet_scores), JSON.stringify(evaluation.violations), JSON.stringify(evaluation.counterfeits_matched), JSON.stringify(evaluation.recommendations), evaluation.depth, now);
        return { ...evaluation, id, created_at: now };
    }
    getEvaluationById(id) {
        const stmt = this.db.prepare('SELECT * FROM evaluations WHERE id = ?');
        const row = stmt.get(id);
        return row ? this.rowToEvaluation(row) : null;
    }
    getEvaluations(options = {}) {
        let query = 'SELECT * FROM evaluations WHERE 1=1';
        const params = [];
        if (options.assessment) {
            query += ' AND overall_assessment = ?';
            params.push(options.assessment);
        }
        if (options.since) {
            query += ' AND created_at >= ?';
            params.push(options.since);
        }
        query += ' ORDER BY created_at DESC';
        if (options.limit) {
            query += ' LIMIT ?';
            params.push(options.limit);
        }
        if (options.offset) {
            query += ' OFFSET ?';
            params.push(options.offset);
        }
        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => this.rowToEvaluation(row));
    }
    getEvaluationCount(assessment) {
        let stmt;
        if (assessment) {
            stmt = this.db.prepare('SELECT COUNT(*) as count FROM evaluations WHERE overall_assessment = ?');
            const row = stmt.get(assessment);
            return row.count;
        }
        else {
            stmt = this.db.prepare('SELECT COUNT(*) as count FROM evaluations');
            const row = stmt.get();
            return row.count;
        }
    }
    // ---------------------------------------------------------------------------
    // Violation Operations
    // ---------------------------------------------------------------------------
    rowToViolation(row) {
        return {
            id: row.id,
            evaluation_id: row.evaluation_id,
            tenet_id: row.tenet_id,
            severity: row.severity,
            description: row.description,
            counterfeit_pattern: row.counterfeit_pattern || undefined,
            remediation_applied: row.remediation_applied || undefined,
            resolved_at: row.resolved_at || undefined,
            created_at: row.created_at,
        };
    }
    insertViolation(violation) {
        const id = uuidv4();
        const now = Date.now();
        const stmt = this.db.prepare(`
      INSERT INTO violations (id, evaluation_id, tenet_id, severity, description, counterfeit_pattern, remediation_applied, resolved_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, violation.evaluation_id, violation.tenet_id, violation.severity, violation.description, violation.counterfeit_pattern || null, violation.remediation_applied || null, violation.resolved_at || null, now);
        return { ...violation, id, created_at: now };
    }
    getViolationsByEvaluation(evaluationId) {
        const stmt = this.db.prepare('SELECT * FROM violations WHERE evaluation_id = ? ORDER BY created_at');
        const rows = stmt.all(evaluationId);
        return rows.map(row => this.rowToViolation(row));
    }
    getViolationsByTenet(tenetId, limit = 100) {
        const stmt = this.db.prepare('SELECT * FROM violations WHERE tenet_id = ? ORDER BY created_at DESC LIMIT ?');
        const rows = stmt.all(tenetId, limit);
        return rows.map(row => this.rowToViolation(row));
    }
    getViolationCount(tenetId) {
        if (tenetId) {
            const stmt = this.db.prepare('SELECT COUNT(*) as count FROM violations WHERE tenet_id = ?');
            const row = stmt.get(tenetId);
            return row.count;
        }
        else {
            const stmt = this.db.prepare('SELECT COUNT(*) as count FROM violations');
            const row = stmt.get();
            return row.count;
        }
    }
    resolveViolation(id, remediation) {
        const stmt = this.db.prepare('UPDATE violations SET remediation_applied = ?, resolved_at = ? WHERE id = ?');
        stmt.run(remediation, Date.now(), id);
    }
    // ---------------------------------------------------------------------------
    // Pattern Operations
    // ---------------------------------------------------------------------------
    rowToPattern(row) {
        return {
            id: row.id,
            pattern_type: row.pattern_type,
            description: row.description,
            related_tenets: row.related_tenets ? JSON.parse(row.related_tenets) : [],
            frequency: row.frequency,
            last_seen: row.last_seen,
            confidence: row.confidence,
            created_at: row.created_at,
        };
    }
    insertPattern(pattern) {
        const id = uuidv4();
        const now = Date.now();
        const clampedConfidence = clampConfidence(pattern.confidence);
        const stmt = this.db.prepare(`
      INSERT INTO patterns (id, pattern_type, description, related_tenets, frequency, last_seen, confidence, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, pattern.pattern_type, pattern.description, JSON.stringify(pattern.related_tenets), pattern.frequency, pattern.last_seen, clampedConfidence, now);
        return { ...pattern, id, confidence: clampedConfidence, created_at: now };
    }
    updatePatternFrequency(id) {
        const stmt = this.db.prepare('UPDATE patterns SET frequency = frequency + 1, last_seen = ? WHERE id = ?');
        stmt.run(Date.now(), id);
    }
    getPatternsByType(type) {
        const stmt = this.db.prepare('SELECT * FROM patterns WHERE pattern_type = ? ORDER BY frequency DESC');
        const rows = stmt.all(type);
        return rows.map(row => this.rowToPattern(row));
    }
    getAllPatterns() {
        const stmt = this.db.prepare('SELECT * FROM patterns ORDER BY frequency DESC');
        const rows = stmt.all();
        return rows.map(row => this.rowToPattern(row));
    }
    findPatternByDescription(description) {
        const stmt = this.db.prepare('SELECT * FROM patterns WHERE description = ?');
        const row = stmt.get(description);
        return row ? this.rowToPattern(row) : null;
    }
    // ---------------------------------------------------------------------------
    // Statistics
    // ---------------------------------------------------------------------------
    getStats() {
        const totalTenets = this.getTenetCount();
        const totalEvaluations = this.getEvaluationCount();
        const affirmCount = this.getEvaluationCount('affirm');
        const cautionCount = this.getEvaluationCount('caution');
        const rejectCount = this.getEvaluationCount('reject');
        const totalViolations = this.getViolationCount();
        const patternCount = this.getAllPatterns().length;
        // Get violations by tenet
        const violationsByTenet = {};
        const tenets = this.getAllTenets();
        for (const tenet of tenets) {
            const count = this.getViolationCount(tenet.id);
            if (count > 0) {
                violationsByTenet[tenet.name] = count;
            }
        }
        return {
            totalTenets,
            totalEvaluations,
            affirmCount,
            cautionCount,
            rejectCount,
            totalViolations,
            violationsByTenet,
            patternCount,
        };
    }
    // ---------------------------------------------------------------------------
    // Transaction Support
    // ---------------------------------------------------------------------------
    transaction(fn) {
        return this.db.transaction(fn)();
    }
    // ---------------------------------------------------------------------------
    // Raw Query (for testing)
    // ---------------------------------------------------------------------------
    query(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
    }
}
