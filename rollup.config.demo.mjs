import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';

export default defineConfig({
    input: 'docs/demo/demo.js',
    output: {
        dir: 'docs/demo/dist',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            inlineSources: true
        }),
        postcss({
            extensions: ['.css']
        }),
        copy({
            targets: [
                { src: 'docs/demo/index.html', dest: 'docs/demo/dist' },
                { src: 'docs/demo/styles.css', dest: 'docs/demo/dist' }
            ]
        })
    ],
    external: ['obsidian']
}); 