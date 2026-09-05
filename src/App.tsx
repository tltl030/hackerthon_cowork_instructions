import { useEffect, useState, type ComponentType } from 'react'
import { GitPage } from './pages/GitPage'
import { HelpPage } from './pages/HelpPage'
import { HomePage } from './pages/HomePage'
import { PromptsPage } from './pages/PromptsPage'
import { ReferencePage } from './pages/ReferencePage'
import { RolesPage } from './pages/RolesPage'
import { SafetyPage } from './pages/SafetyPage'
import { WorkflowPage } from './pages/WorkflowPage'
import './App.css'

type Route = { hash: string; label: string; page: ComponentType }
const routes: Route[] = [
  { hash: '#/', label: '開始工作', page: HomePage },
  { hash: '#/workflow', label: '四階段流程', page: WorkflowPage },
  { hash: '#/prompts', label: 'Prompt 工具箱', page: PromptsPage },
  { hash: '#/help', label: '遇到問題', page: HelpPage },
  { hash: '#/reference', label: '參考資料', page: ReferencePage },
  { hash: '#/roles', label: '角色指南', page: RolesPage },
  { hash: '#/git', label: 'Git 新手指南', page: GitPage },
  { hash: '#/safety', label: '安全與檢查', page: SafetyPage },
]

const primaryHashes = new Set(['#/', '#/workflow', '#/prompts', '#/help', '#/reference'])

function App() {
  const [hash, setHash] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => {
      const nextHash = window.location.hash || '#/'
      setHash(nextHash)
      if (nextHash.startsWith('#/')) window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const activeRoute = routes.find((route) => route.hash === hash) ?? routes[0]
  const Page = activeRoute.page
  const referenceIsActive = ['#/reference', '#/roles', '#/git', '#/safety'].includes(activeRoute.hash)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">跳到主要內容</a>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="一天 Hackathon 協作指南首頁">
          <span className="brand-mark" aria-hidden="true">4×1</span>
          <span><strong>Hackathon Mission Control</strong><small>多人 AI Agent 協作指南</small></span>
        </a>
        <nav aria-label="主要導覽">
          {routes.filter((route) => primaryHashes.has(route.hash)).map((route) => <a key={route.hash} href={route.hash} aria-current={activeRoute.hash === route.hash || (route.hash === '#/reference' && referenceIsActive) ? 'page' : undefined}>{route.label}</a>)}
        </nav>
      </header>
      <main id="main-content"><Page /></main>
      <footer><span>PUBLIC PLAYBOOK · NO SECRETS · NO PRODUCT CODE</span><a href={`${import.meta.env.BASE_URL}ai-guide.txt`}>給 AI 的純文字版 ↗</a><span>四人 Hackathon 協作指南</span></footer>
    </div>
  )
}

export default App
