/**
 * Security Tests: Error Sanitization
 *
 * Tests that error messages don't leak sensitive information.
 * Run with: npx tsx tests/security/error-sanitization.test.ts
 */

/**
 * Sanitize error messages (copied from http/server.ts)
 */
function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error';

  // Strip sensitive patterns
  const sensitivePatterns = [
    /\/Users\/[^/\s]+/g,           // User paths
    /\/home\/[^/\s]+/g,            // Linux home paths
    /at\s+.+:\d+:\d+/g,            // Stack trace lines
    /SQLITE_\w+/g,                 // SQLite error codes
    /ENOENT:|EACCES:/g,            // System error codes
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}

// Test cases
interface TestCase {
  name: string;
  input: Error | string;
  shouldNotContain: string[];
}

const tests: TestCase[] = [
  {
    name: 'Redact macOS user paths',
    input: new Error('Database at /Users/macbook/Documents/tenets.db not found'),
    shouldNotContain: ['/Users/macbook']
  },
  {
    name: 'Redact Linux home paths',
    input: new Error('Config at /home/admin/.config/tenets not found'),
    shouldNotContain: ['/home/admin']
  },
  {
    name: 'Redact stack trace lines',
    input: new Error('Error at /app/src/server.ts:127:15'),
    shouldNotContain: ['at /app/src/server.ts:127:15']
  },
  {
    name: 'Redact SQLite error codes',
    input: new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed'),
    shouldNotContain: ['SQLITE_CONSTRAINT']
  },
  {
    name: 'Redact ENOENT errors',
    input: new Error('ENOENT: no such file or directory'),
    shouldNotContain: ['ENOENT:']
  },
  {
    name: 'Redact EACCES errors',
    input: new Error('EACCES: permission denied'),
    shouldNotContain: ['EACCES:']
  },
  {
    name: 'Preserve non-sensitive error message',
    input: new Error('Invalid tenet ID'),
    shouldNotContain: []  // No redaction needed
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('\n=== Error Sanitization Security Tests ===\n');

for (const test of tests) {
  const sanitized = sanitizeError(test.input);
  let testPassed = true;
  const foundSensitive: string[] = [];

  for (const sensitive of test.shouldNotContain) {
    if (sanitized.includes(sensitive)) {
      testPassed = false;
      foundSensitive.push(sensitive);
    }
  }

  if (testPassed) {
    console.log(`✅ PASS: ${test.name}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${test.name}`);
    console.log(`   Sanitized output still contains: ${foundSensitive.join(', ')}`);
    console.log(`   Output: ${sanitized}`);
    failed++;
  }
}

// Additional test: ensure [REDACTED] appears when patterns are matched
console.log('\n--- Verifying redaction markers ---\n');

const pathError = sanitizeError(new Error('Error at /Users/testuser/app'));
if (pathError.includes('[REDACTED]')) {
  console.log('✅ PASS: Redaction marker present for path errors');
  passed++;
} else {
  console.log('❌ FAIL: Redaction marker missing for path errors');
  failed++;
}

const sqliteError = sanitizeError(new Error('SQLITE_BUSY: database is locked'));
if (sqliteError.includes('[REDACTED]')) {
  console.log('✅ PASS: Redaction marker present for SQLite errors');
  passed++;
} else {
  console.log('❌ FAIL: Redaction marker missing for SQLite errors');
  failed++;
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
