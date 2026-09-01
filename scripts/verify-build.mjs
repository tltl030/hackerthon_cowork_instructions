import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const expectedBase = '/hackerthon_cowork_instructions/'
const failures = []

function requireText(file, values) {
  const path = resolve(root, file)
  if (!existsSync(path)) {
    failures.push(`Missing ${file}`)
    return ''
  }
  const text = readFileSync(path, 'utf8')
  for (const value of values) {
    if (!text.includes(value)) failures.push(`${file} is missing: ${value}`)
  }
  return text
}

requireText('vite.config.ts', [`base: '${expectedBase}'`])
requireText('src/App.tsx', ['#/roles', '#/workflow', '#/git', '#/safety'])
requireText('src/pages/HomePage.tsx', ['第一個 90 分鐘', '四人配置'])
requireText('src/pages/RolesPage.tsx', ['Primary Developer 1', 'Beginner & Slides'])
requireText('src/pages/WorkflowPage.tsx', ['認領任務', 'Merge 後同步'])
requireText('src/pages/GitPage.tsx', ['force push', 'reset'])
requireText('src/pages/SafetyPage.tsx', ['Integration checkpoint', 'PR 前檢查'])

const index = requireText('dist/index.html', [expectedBase])
const assetUrls = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => url.startsWith(expectedBase))

if (assetUrls.length < 2) failures.push('dist/index.html does not reference built assets through the Pages base path')
for (const url of assetUrls) {
  const relative = url.slice(expectedBase.length)
  if (!existsSync(resolve(root, 'dist', relative))) failures.push(`Missing built asset for ${url}`)
}

if (failures.length) {
  console.error('Build verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Build verification passed: home, four hash routes, Pages base path, and static assets are present.')
