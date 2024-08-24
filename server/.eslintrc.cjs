/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
  ignorePatterns: ['.eslintrc.cjs', 'dist', 'src/tests'],
  rules: {
    // disable rule for async functions in express:
    // allows passing () => Promise<void> to () => void
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false,
        },
      },
    ],
    // allows ingoring rule for express nextFunction
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};

