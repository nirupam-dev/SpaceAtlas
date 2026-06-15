import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.NASA_API_KEY = 'test-nasa-key';

// Mock performance.now for consistent timing in tests
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => Date.now(),
  };
}
