module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: [
    '<rootDir>/packages/**/*.spec.js',
    '**/julia-set-node/test/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    // Ignore `tsc`-produced JS file (requires `jest-puppeteer` env;
    // tested among E2E tests)
    'julia-set/test/types.spec.js',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  coveragePathIgnorePatterns: [
    '/julia-set-node/lib/',
    'e2e-tests',
  ],
  transform: {
    '\\.js$': 'babel-jest',
    '\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
