import { defineConfig } from 'tsup'

export default defineConfig([{
  entry: ['bin'],
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  format: ['cjs', 'esm'],
  outDir: './dist',
  banner:{
    js: '#!/usr/bin/env node',
  },
  external:['commander']
},{
  entry: ['./src/index.ts'],
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  format: ['cjs', 'esm'],
  outDir: './dist',
}])
