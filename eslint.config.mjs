import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', '.context/**', 'next-env.d.ts']),
  {
    rules: {
      // Product icons come straight from Moonbase's CDN at the size it serves them, so plain <img>
      // keeps this reference free of next/image setup
      '@next/next/no-img-element': 'off',
    },
  },
])
