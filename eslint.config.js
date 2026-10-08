import { configPkg } from '@adonisjs/eslint-config'
export default configPkg([
  { rules: { eqeqeq: ['error', 'always', { null: 'ignore' }] } },
  { files: ['src/vite-env.d.ts'], rules: { '@unicorn/filename-case': 'off' } },
])
