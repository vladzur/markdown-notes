import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: ['node_modules', 'dist', '.nuxt', '.output', '**/*.md', '**/target/**', '**/android/**', '**/ios/**', '**/build/**', '**/src-tauri/**'],
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
    'node/prefer-global/process': 'off',
    'unused-imports/no-unused-vars': 'off',
    'vue/custom-event-name-casing': 'off',
    'ts/no-explicit-any': 'off',
  },
})
