/**
 * Tenets Server Database Seeding
 * Initializes the 25 Gospel tenets from seed data
 */
import type { DatabaseManager } from './schema.js';
/**
 * Load tenets from seed file and insert into database
 */
export declare function seedTenets(db: DatabaseManager): number;
/**
 * Seed tenets with inline data (for testing without file dependency)
 */
export declare function seedTenetsInline(db: DatabaseManager): number;
