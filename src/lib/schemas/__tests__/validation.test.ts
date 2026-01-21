/**
 * Tests for the validation utility function
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateRequest } from '../validation';

// Simple test schema
const TestSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
  email: z.string().email().optional(),
});

describe('validateRequest', () => {
  describe('successful validation', () => {
    it('should return success true for valid data', () => {
      const result = validateRequest(TestSchema, { name: 'John', age: 25 });
      expect(result.success).toBe(true);
    });

    it('should return parsed data on success', () => {
      const result = validateRequest(TestSchema, { name: 'John', age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John');
        expect(result.data.age).toBe(25);
      }
    });

    it('should include optional fields when provided', () => {
      const result = validateRequest(TestSchema, {
        name: 'John',
        age: 25,
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should strip unknown fields', () => {
      const result = validateRequest(TestSchema, {
        name: 'John',
        age: 25,
        unknown: 'field',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('unknown');
      }
    });
  });

  describe('failed validation', () => {
    it('should return success false for invalid data', () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
    });

    it('should return NextResponse on failure', () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response).toBeDefined();
      }
    });

    it('should return 503 status code', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(503);
      }
    });

    it('should include x-flexi-fallback header with default reason', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.headers.get('x-flexi-fallback')).toBe('invalid-request');
      }
    });

    it('should include custom fallback reason in header', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 }, 'validation-error');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.headers.get('x-flexi-fallback')).toBe('validation-error');
      }
    });

    it('should include error message in response body', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        expect(body.message).toBeDefined();
        expect(typeof body.message).toBe('string');
      }
    });

    it('should include error details in response body', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        expect(body.details).toBeDefined();
        expect(Array.isArray(body.details)).toBe(true);
        expect(body.details.length).toBeGreaterThan(0);
      }
    });

    it('should include path in error details', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        const detail = body.details.find((d: { path: string }) => d.path === 'name');
        expect(detail).toBeDefined();
      }
    });

    it('should format nested path with dots', async () => {
      const NestedSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1),
          }),
        }),
      });

      const result = validateRequest(NestedSchema, {
        user: { profile: { name: '' } },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        expect(body.message).toContain('user.profile.name');
      }
    });

    it('should include reason in response body', async () => {
      const result = validateRequest(TestSchema, { name: '', age: 25 }, 'custom-reason');
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        expect(body.reason).toBe('custom-reason');
      }
    });
  });

  describe('different error types', () => {
    it('should handle type errors', () => {
      const result = validateRequest(TestSchema, { name: 'John', age: 'not-a-number' });
      expect(result.success).toBe(false);
    });

    it('should handle missing required fields', () => {
      const result = validateRequest(TestSchema, { name: 'John' });
      expect(result.success).toBe(false);
    });

    it('should handle null input', () => {
      const result = validateRequest(TestSchema, null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = validateRequest(TestSchema, undefined);
      expect(result.success).toBe(false);
    });

    it('should handle empty object', () => {
      const result = validateRequest(TestSchema, {});
      expect(result.success).toBe(false);
    });

    it('should handle array when object expected', () => {
      const result = validateRequest(TestSchema, ['John', 25]);
      expect(result.success).toBe(false);
    });

    it('should handle invalid email format', () => {
      const result = validateRequest(TestSchema, {
        name: 'John',
        age: 25,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should handle negative number for positive constraint', () => {
      const result = validateRequest(TestSchema, { name: 'John', age: -5 });
      expect(result.success).toBe(false);
    });
  });

  describe('schema transformations', () => {
    it('should apply schema transformations', () => {
      const TransformSchema = z.object({
        value: z.string().transform((val) => val.toUpperCase()),
      });

      const result = validateRequest(TransformSchema, { value: 'hello' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe('HELLO');
      }
    });

    it('should apply default values', () => {
      const DefaultSchema = z.object({
        name: z.string(),
        count: z.number().default(0),
      });

      const result = validateRequest(DefaultSchema, { name: 'Test' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.count).toBe(0);
      }
    });

    it('should handle union types', () => {
      const UnionSchema = z.object({
        value: z.union([z.string(), z.number()]),
      });

      const stringResult = validateRequest(UnionSchema, { value: 'hello' });
      expect(stringResult.success).toBe(true);

      const numberResult = validateRequest(UnionSchema, { value: 42 });
      expect(numberResult.success).toBe(true);
    });

    it('should handle array schemas', () => {
      const ArraySchema = z.object({
        items: z.array(z.string()).min(1),
      });

      const validResult = validateRequest(ArraySchema, { items: ['a', 'b'] });
      expect(validResult.success).toBe(true);

      const emptyResult = validateRequest(ArraySchema, { items: [] });
      expect(emptyResult.success).toBe(false);
    });
  });

  describe('response format', () => {
    it('should return JSON content type', async () => {
      const result = validateRequest(TestSchema, {});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.headers.get('content-type')).toContain('application/json');
      }
    });

    it('should handle multiple validation errors', async () => {
      const result = validateRequest(TestSchema, { name: '', age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        // Should report at least 2 errors (empty name and negative age)
        expect(body.details.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should report first error in message', async () => {
      const result = validateRequest(TestSchema, { name: '', age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const body = await result.response.json();
        // Message should contain path of first error
        expect(body.message).toMatch(/^(name|age):/);
      }
    });
  });
});
