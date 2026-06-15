import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  // ─── Environment ───────────────────────────────────────────
  testEnvironment: 'jsdom',

  // ─── Setup ─────────────────────────────────────────────────
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // ─── Module Resolution ─────────────────────────────────────
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // ─── Coverage ──────────────────────────────────────────────
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/lib/data.ts', // Static data, no logic to test
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },

  // ─── Test Patterns ─────────────────────────────────────────
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],

  // ─── Transform ─────────────────────────────────────────────
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@google/generative-ai)/)',
  ],
};

export default createJestConfig(config);
