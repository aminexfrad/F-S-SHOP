import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
  }
}

// Re-export the TestingLibraryMatchers type
export { TestingLibraryMatchers };

interface ImportMeta {
  vitest?: typeof import("vitest");
}