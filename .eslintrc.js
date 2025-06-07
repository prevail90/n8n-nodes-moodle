module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/community',
  ],
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  ignorePatterns: ['.eslintrc.js', 'dist/**/*', 'node_modules/**/*', 'package.json'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'n8n-nodes-base/node-param-description-missing-final-period': 'warn',
    'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'warn',
  },
};
