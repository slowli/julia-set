module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: [
    '<rootDir>/packages/**/*.spec.js',
    '**/julia-set-node/test/*.spec.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/',
  coveragePathIgnorePatterns: [
    '/julia-set-node/lib/',
    'e2e-tests',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  transform: {
    '\\.js$': 'babel-jest',
    '\\.ts$': 'ts-jest',
  },
};
