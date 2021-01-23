module.exports = {
  preset: 'jest-puppeteer',
  moduleFileExtensions: ['js', 'ts'],
  testMatch: [
    '<rootDir>/e2e-tests/*.spec.js',
    '**/julia-set/test/*.spec.ts',
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
