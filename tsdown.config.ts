import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.ts'], // Entry point of the library
    format: ['esm', 'cjs'], // Export both formats
    dts: true,             // Generate declaration files (.d.ts)
    sourcemap: true,
    clean: true, // Don't bundle React
  deps: {
    neverBundle: ['react', 'react-dom'],
  },
  target: false,
});