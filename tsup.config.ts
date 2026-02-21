import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'], // Entry point of the library
    format: ['esm', 'cjs'], // Export both formats
    dts: true,             // Generate declaration files (.d.ts)
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'], // Don't bundle React
});