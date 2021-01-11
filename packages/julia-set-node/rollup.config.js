const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const babelConfig = {
  exclude: 'node_modules/**',
  babelrc: false,
  babelHelpers: 'bundled',
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: { node: 10 },
      },
    ],
  ],
};

module.exports = {
  input: 'src/index.js',
  plugins: [
    nodeResolve(),
    babel(babelConfig),
  ],
  output: [
    {
      file: 'lib/index.esm.js',
      format: 'esm',
    },
    {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'default',
    },
  ],
  external: ['puppeteer', 'buffer'],
};
