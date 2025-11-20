import { defineConfig } from 'tsup'

export default defineConfig([
  // Main library exports (index and dev) - lucide-react is a peer dependency
  {
    entry: {
      index: 'src/index.ts',
      dev: 'src/dev.ts'
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'lucide-react']
  },
  // CLI export - needs lucide-static and @babel/traverse bundled/required
  {
    entry: {
      cli: 'scripts/generate-sprite.ts'
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean since main exports already created dist
    external: ['react', 'react-dom'] // CLI doesn't need React
  }
])
