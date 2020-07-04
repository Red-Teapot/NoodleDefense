import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/index.ts',
	output: {
		file: 'public/bundle.js',
		format: 'iife',
		sourcemap: !production
	},
	plugins: [
        typescript(),
        resolve(),
        commonjs({extensions: ['.js', '.ts']}),
        production && terser(),
    ]
};