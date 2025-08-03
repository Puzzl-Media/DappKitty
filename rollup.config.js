import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // ESM build
  {
    input: 'src/dappKitty.js',
    output: {
      file: 'dist/dappkitty.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve()],
  },
  // UMD build (minified)
  {
    input: 'src/dappKitty.js',
    output: {
      file: 'dist/dappkitty.umd.js',
      format: 'umd',
      name: 'DappKitty',
      sourcemap: true,
    },
    plugins: [resolve(), terser()],
  },
];
