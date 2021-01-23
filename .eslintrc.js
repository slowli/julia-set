module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  env: {
    es6: true,
    browser: true,
  },
  rules: {
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.config.js', '**/*.spec.js', 'e2e-tests/**', 'examples/**'],
        packageDir: __dirname,
      },
    ],
  },
};
