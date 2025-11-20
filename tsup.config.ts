import { defineConfig } from 'tsup'

export default defineConfig([
  // Production library export
  {
    entry: {
      index: 'src/index.ts'
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom']
  },
  // Development library export
  {
    entry: {
      dev: 'src/dev.ts'
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom']
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
