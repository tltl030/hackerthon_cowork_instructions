import { useEffect, useState, type ComponentType } from 'react'
import { GitPage } from './pages/GitPage'
import { HomePage } from './pages/HomePage'
import { RolesPage } from './pages/RolesPage'
import { SafetyPage } from './pages/SafetyPage'
import { WorkflowPage } from './pages/WorkflowPage'
import './App.css'

type Route = { hash: string; label: string; page: ComponentType }
const routes: Route[] = [
  { hash: '#/', label: '首頁', page: HomePage },
  { hash: '#/roles', label: '角色指南', page: RolesPage },
  { hash: '#/workflow', label: '協作流程', page: WorkflowPage },
  { hash: '#/git', label: 'Git 新手指南', page: GitPage },
  { hash: '#/safety', label: '安全與檢查', page: SafetyPage },
]

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

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">跳到主要內容</a>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="一天 Hackathon 協作指南首頁">
          <span className="brand-mark" aria-hidden="true">4×1</span>
          <span><strong>Hackathon Mission Control</strong><small>多人 AI Agent 協作指南</small></span>
        </a>
        <nav aria-label="主要導覽">
          {routes.map((route) => <a key={route.hash} href={route.hash} aria-current={activeRoute.hash === route.hash ? 'page' : undefined}>{route.label}</a>)}
        </nav>
      </header>
      <main id="main-content"><Page /></main>
      <footer><span>PUBLIC PLAYBOOK · NO SECRETS · NO PRODUCT CODE</span><span>四人 Hackathon 協作指南</span></footer>
    </div>
  )
}

export default App
