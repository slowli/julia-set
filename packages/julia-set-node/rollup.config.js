const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');

const babelConfig = {
  exclude: 'node_modules/**',
  babelrc: false,
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: { node: 6 },
      },
    ],
  ],
};

module.exports = {
  input: 'src/index.js',
  plugins: [
    resolve(),
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
    },
  ],
  external: ['puppeteer', 'buffer'],
};
