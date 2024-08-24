import { test, expect } from 'vitest';

const controlFunc = () => true;

test('vitest setup ok', () => {
  expect(controlFunc()).toBe(true);
});
