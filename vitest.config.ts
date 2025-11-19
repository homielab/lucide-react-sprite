import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts', // I will create this setup file next
    watch: false // Ensure tests do not watch for file changes
  }
})
