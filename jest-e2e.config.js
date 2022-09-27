module.exports = {
  preset: 'jest-puppeteer',
  moduleFileExtensions: ['js', 'ts'],
  testMatch: [
    '<rootDir>/e2e-tests/*.spec.js',
    '**/julia-set/test/*.spec.ts',
  ],
  transform: {
    '\\.js$': 'babel-jest',
    '\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
