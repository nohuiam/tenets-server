/**
 * Tenets Server Test Setup
 */

import { jest, beforeAll, afterAll } from '@jest/globals';

// Extend timeout for slower tests
jest.setTimeout(10000);

// Mock console.error to reduce noise
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn() as typeof console.error;
});

afterAll(() => {
  console.error = originalError;
});
