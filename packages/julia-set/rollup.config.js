const glsl = require('rollup-plugin-glsl');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

const babelConfig = {
  exclude: 'node_modules/**',
  babelrc: false,
  comments: false,
  babelHelpers: 'bundled',
  presets: [
    ['@babel/preset-env', { modules: false }],
    '@babel/preset-flow',
  ],
};

module.exports = [{
  input: 'src/index.js',
  plugins: [
    nodeResolve(),
    babel(babelConfig),
    glsl({ include: '**/*.glsl' }),
  ],
  output: {
    file: 'lib/index.esm.js',
    format: 'esm',
  },
}, {
  input: 'src/index.js',
  plugins: [
    nodeResolve(),
    babel(babelConfig),
    glsl({ include: '**/*.glsl' }),
    terser(),
  ],
  output: {
    file: 'lib/index.js',
    format: 'umd',
    name: 'JuliaSet',
    exports: 'default',
  },
}];
