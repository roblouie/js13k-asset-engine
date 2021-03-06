module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': ["error", { "functions": false, "classes": true }],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'comma-dangle': ['warn', 'always-multiline'],
    'semi': 'warn',
    'indent': ['warn', 2],
    'space-before-function-paren': ['warn', {"anonymous": "never", "named": "never"}],
    'quotes': ['warn', 'single'],
    'object-curly-spacing': ["warn", "always"]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
