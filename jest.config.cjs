// CommonJS on purpose: package.json sets "type": "module", so a .js config
// would be loaded as ESM.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // The source uses explicit .js extensions for Node ESM. Jest runs the
  // TypeScript sources, so strip the extension again when resolving.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/index.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          module: 'CommonJS',
          moduleResolution: 'Node',
        },
      },
    ],
  },
}
