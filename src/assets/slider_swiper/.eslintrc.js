module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': ['off'],
    'import/extensions': ['off'],
    'import/no-unresolved': ['off'],
    'no-param-reassign': ['off'],
    'no-nested-ternary': ['off'],
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
  },
};
