module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: [
    '<rootDir>/packages/**/*.spec.js',
    '**/julia-set-node/test/*.spec.ts',
  ],
  coveragePathIgnorePatterns: [
    '/julia-set-node/lib/',
    'e2e-tests',
  ],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  transform: {
    '\\.js$': 'babel-jest',
    '\\.ts$': 'ts-jest',
  },
};
