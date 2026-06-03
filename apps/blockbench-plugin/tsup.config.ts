import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    ai_model_agent: 'src/main.ts'
  },
  outDir: 'dist',
  clean: true,
  minify: false,
  bundle: true,
  format: ['iife'],
  target: 'es2022',
  platform: 'browser',
  external: [],
  noExternal: [/@blockbench-ai-agent\/shared/],
  outExtension() {
    return {
      js: '.js',
    };
  }
});
