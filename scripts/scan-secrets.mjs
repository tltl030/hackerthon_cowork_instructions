import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)

const textExtensions = new Set(['', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.svg', '.ts', '.tsx', '.txt', '.yaml', '.yml'])
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:gh[opurs]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ['assigned secret', /\b(?:api[_-]?key|secret|token|password|passwd)\s*[:=]\s*["']?(?!<|\$\{|replace|example|your-|fake|test|none|null)[A-Za-z0-9_+=./-]{16,}/i],
]

const findings = []
for (const file of files) {
  if (!textExtensions.has(extname(file).toLowerCase())) continue
  if (file === 'package-lock.json') continue
  let text
  try { text = readFileSync(resolve(root, file), 'utf8') } catch { continue }
  for (const [name, pattern] of patterns) {
    const match = text.match(pattern)
    if (match) {
      const line = text.slice(0, match.index).split(/\r?\n/).length
      findings.push(`${file}:${line} (${name})`)
    }
  }
}

if (findings.length) {
  console.error('Potential secrets found. Review before committing:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`Secret scan passed for ${files.length} non-ignored files.`)
