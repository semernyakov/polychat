import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/main.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        typescript(),
        nodeResolve(),
        commonjs()
    ],
    external: ['obsidian', 'react', 'react-dom']
}; 