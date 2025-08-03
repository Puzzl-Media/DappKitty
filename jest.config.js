// Jest config for ESM and jsdom
export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {},
  testMatch: [
    '**/?(*.)+(test).[jt]s?(x)',
    '**/?(*.)+(test).mjs'
  ],
  globals: {},
};
