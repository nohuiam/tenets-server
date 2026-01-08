/**
 * Security Tests: Input Validation
 *
 * Tests that HTTP API properly validates input with Zod schemas.
 * Run with: npx tsx tests/security/input-validation.test.ts
 */

import { z } from 'zod';

// Schemas copied from http/server.ts
const EvaluateSchema = z.object({
  decision_text: z.string().min(1).max(50000),
  context: z.record(z.unknown()).optional(),
  stakeholders: z.array(z.string().max(200)).max(20).optional(),
  depth: z.enum(['quick', 'standard', 'deep']).optional()
});

const CheckCounterfeitSchema = z.object({
  action_description: z.string().min(1).max(10000),
  claimed_tenet: z.string().max(100).optional()
});

const BlindSpotsSchema = z.object({
  plan_text: z.string().min(1).max(100000),
  scope: z.string().max(1000).optional()
});

const RemediationSchema = z.object({
  violation_description: z.string().min(1).max(10000),
  tenet_violated: z.string().min(1).max(100),
  context: z.string().max(10000).optional()
});

// Test cases
interface TestCase {
  name: string;
  schema: z.ZodSchema;
  input: unknown;
  shouldFail: boolean;
}

const tests: TestCase[] = [
  // EvaluateSchema tests
  {
    name: 'Evaluate: Valid input',
    schema: EvaluateSchema,
    input: { decision_text: 'Test decision' },
    shouldFail: false
  },
  {
    name: 'Evaluate: Reject empty decision_text',
    schema: EvaluateSchema,
    input: { decision_text: '' },
    shouldFail: true
  },
  {
    name: 'Evaluate: Reject missing decision_text',
    schema: EvaluateSchema,
    input: { context: {} },
    shouldFail: true
  },
  {
    name: 'Evaluate: Reject text over 50k chars',
    schema: EvaluateSchema,
    input: { decision_text: 'x'.repeat(50001) },
    shouldFail: true
  },
  {
    name: 'Evaluate: Reject invalid depth',
    schema: EvaluateSchema,
    input: { decision_text: 'Test', depth: 'invalid' },
    shouldFail: true
  },
  {
    name: 'Evaluate: Reject too many stakeholders',
    schema: EvaluateSchema,
    input: { decision_text: 'Test', stakeholders: Array(21).fill('stakeholder') },
    shouldFail: true
  },

  // CheckCounterfeitSchema tests
  {
    name: 'Counterfeit: Valid input',
    schema: CheckCounterfeitSchema,
    input: { action_description: 'Test action' },
    shouldFail: false
  },
  {
    name: 'Counterfeit: Reject empty action_description',
    schema: CheckCounterfeitSchema,
    input: { action_description: '' },
    shouldFail: true
  },
  {
    name: 'Counterfeit: Reject action over 10k chars',
    schema: CheckCounterfeitSchema,
    input: { action_description: 'x'.repeat(10001) },
    shouldFail: true
  },

  // BlindSpotsSchema tests
  {
    name: 'BlindSpots: Valid input',
    schema: BlindSpotsSchema,
    input: { plan_text: 'Test plan' },
    shouldFail: false
  },
  {
    name: 'BlindSpots: Reject empty plan_text',
    schema: BlindSpotsSchema,
    input: { plan_text: '' },
    shouldFail: true
  },
  {
    name: 'BlindSpots: Reject plan over 100k chars',
    schema: BlindSpotsSchema,
    input: { plan_text: 'x'.repeat(100001) },
    shouldFail: true
  },

  // RemediationSchema tests
  {
    name: 'Remediation: Valid input',
    schema: RemediationSchema,
    input: { violation_description: 'Test violation', tenet_violated: 'Love' },
    shouldFail: false
  },
  {
    name: 'Remediation: Reject missing violation_description',
    schema: RemediationSchema,
    input: { tenet_violated: 'Love' },
    shouldFail: true
  },
  {
    name: 'Remediation: Reject missing tenet_violated',
    schema: RemediationSchema,
    input: { violation_description: 'Test' },
    shouldFail: true
  },
  {
    name: 'Remediation: Reject empty tenet_violated',
    schema: RemediationSchema,
    input: { violation_description: 'Test', tenet_violated: '' },
    shouldFail: true
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('\n=== Input Validation Security Tests ===\n');

for (const test of tests) {
  try {
    test.schema.parse(test.input);
    if (test.shouldFail) {
      console.log(`❌ FAIL: ${test.name}`);
      console.log(`   Expected validation error but input was accepted`);
      failed++;
    } else {
      console.log(`✅ PASS: ${test.name}`);
      passed++;
    }
  } catch (error) {
    if (test.shouldFail) {
      console.log(`✅ PASS: ${test.name}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${test.name}`);
      console.log(`   Unexpected error: ${(error as Error).message}`);
      failed++;
    }
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
