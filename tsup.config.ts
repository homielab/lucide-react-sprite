import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    dev: 'src/dev.ts',
    cli: 'scripts/generate-sprite.ts',
  },
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'lucide-react', '@babel/traverse'],
});
