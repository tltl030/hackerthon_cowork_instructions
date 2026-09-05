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
requireText('src/App.tsx', ['#/', '#/workflow', '#/prompts', '#/help', '#/reference', '#/roles', '#/git', '#/safety'])
requireText('src/pages/HomePage.tsx', ['你現在要做什麼', '選擇你的角色', '三條安全規則'])
requireText('src/pages/RolesPage.tsx', ['Primary Developer 1', 'Beginner & Slides'])
requireText('src/pages/WorkflowPage.tsx', ['不用重新教 AI 整個專案', 'AGENTS.md', '準備交付', 'Merge 後同步 main'])
requireText('src/pages/PromptsPage.tsx', ['找到情境，直接複製給 AI', '看不懂 Git 狀態', 'Integration Checkpoint'])
requireText('src/pages/HelpPage.tsx', ['保留現場', '不要執行', 'Integration Owner'])
requireText('src/pages/ReferencePage.tsx', ['需要時再查', '角色指南', '安全與檢查'])
requireText('src/pages/GitPage.tsx', ['照著任務階段走就好', 'Primary Developer 1', 'integration checkpoint', 'force push'])
requireText('src/pages/SafetyPage.tsx', ['Integration checkpoint', 'PR 前檢查'])
requireText('public/llms.txt', ['ai-guide.txt', 'Prompt 工具箱', '遇到問題'])
requireText('public/ai-guide.txt', ['網站希望傳達的核心概念', '四階段工作流程', '公開安全邊界'])

const index = requireText('dist/index.html', [expectedBase, 'llms.txt', 'ai-guide.txt'])
requireText('dist/llms.txt', ['ai-guide.txt'])
requireText('dist/ai-guide.txt', ['通用開工 Prompt', 'Integration Owner'])
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

console.log('Build verification passed: beginner start page, seven information routes, Pages base path, and static assets are present.')
