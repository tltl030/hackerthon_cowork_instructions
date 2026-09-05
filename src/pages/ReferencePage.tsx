import { PageIntro } from '../components/Content'

const references = [
  { code: 'ROLE', title: '角色指南', description: '確認每個角色適合認領什麼、哪些事不能自行處理。', use: '分工或任務範圍不確定時', href: '#/roles' },
  { code: 'GIT', title: 'Git 新手指南', description: '用白話查詢這次 Hackathon 會用到的指令與名詞。', use: '想知道指令正在做什麼時', href: '#/git' },
  { code: 'SAFE', title: '安全與檢查', description: '查看公開內容、secret、dependency、PR 與 checkpoint 規則。', use: '準備 commit、PR 或整合時', href: '#/safety' },
  { code: 'FLOW', title: '完整四階段流程', description: '了解一個任務如何從開始、開發、交付到同步 main。', use: '想看完整協作節奏時', href: '#/workflow' },
]

export function ReferencePage() {
  return <>
    <PageIntro kicker="REFERENCE DESK" title="需要時再查，不用先背。" description="日常工作先從「開始工作」或「Prompt 工具箱」進入；這裡保留完整規則與名詞說明。" aside={<><span className="status-chip">ON DEMAND</span><span className="status-chip lime">PUBLIC SAFE</span></>} />
    <section className="reference-hub">{references.map((item) => <a href={item.href} key={item.code}><span>{item.code}</span><div><h2>{item.title}</h2><p>{item.description}</p><small>什麼時候看：{item.use}</small></div><b aria-hidden="true">→</b></a>)}</section>
    <aside className="reference-reminder"><strong>找不到答案？</strong><p>不要猜測 Git 操作。前往「遇到問題」，產生一段保留現場的求救 Prompt。</p><a href="#/help">前往求救入口 →</a></aside>
  </>
}
