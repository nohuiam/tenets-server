/**
 * Tenets Server Database Schema
 * SQLite database with 4 tables: tenets, evaluations, violations, patterns
 */
import type { Tenet, TenetSummary, TenetCategory, Evaluation, Violation, Pattern, AssessmentLevel, Stats } from '../types.js';
export declare class DatabaseManager {
    private db;
    private initialized;
    constructor(dbPath?: string);
    initialize(): void;
    close(): void;
    private rowToTenet;
    insertTenet(tenet: Omit<Tenet, 'created_at'> & {
        created_at?: number;
    }): Tenet;
    getTenetById(id: number): Tenet | null;
    getTenetByName(name: string): Tenet | null;
    getAllTenets(): Tenet[];
    getTenetsByCategory(category: TenetCategory): Tenet[];
    listTenets(category?: TenetCategory): TenetSummary[];
    getTenetCount(): number;
    private rowToEvaluation;
    insertEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at'>): Evaluation;
    getEvaluationById(id: string): Evaluation | null;
    getEvaluations(options?: {
        assessment?: AssessmentLevel;
        limit?: number;
        offset?: number;
        since?: number;
    }): Evaluation[];
    getEvaluationCount(assessment?: AssessmentLevel): number;
    private rowToViolation;
    insertViolation(violation: Omit<Violation, 'id' | 'created_at'>): Violation;
    getViolationsByEvaluation(evaluationId: string): Violation[];
    getViolationsByTenet(tenetId: number, limit?: number): Violation[];
    getViolationCount(tenetId?: number): number;
    resolveViolation(id: string, remediation: string): void;
    private rowToPattern;
    insertPattern(pattern: Omit<Pattern, 'id' | 'created_at'>): Pattern;
    updatePatternFrequency(id: string): void;
    getPatternsByType(type: Pattern['pattern_type']): Pattern[];
    getAllPatterns(): Pattern[];
    findPatternByDescription(description: string): Pattern | null;
    getStats(): Stats;
    transaction<T>(fn: () => T): T;
    query(sql: string, params?: unknown[]): unknown[];
}
