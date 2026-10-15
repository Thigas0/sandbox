import js from '@eslint/js';
import globals from 'globals';

export default [
  // .claude/ holds third-party skills; they follow their own style.
  { ignores: ['dist/', 'playwright-report/', 'test-results/', '.claude/', 'docs/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js', 'tests/**/*.js'],
    languageOptions: { globals: globals.node },
  },
];
