import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    hookTimeout: 120_000, // first run downloads the in-memory MongoDB binary
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
