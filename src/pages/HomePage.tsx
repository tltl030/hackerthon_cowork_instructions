import { SectionTitle } from '../components/Content'

const firstSprint = [
  ['00–15', '對齊目標', '確認題目、成功標準與不能做的事'],
  ['15–35', '切分工作', '定義 shared interface，拆成小任務'],
  ['35–70', '平行開發', '每人一個 branch，先做可驗證切片'],
  ['70–90', '第一次整合', '開小 PR、交叉 review、確認 main 可跑'],
]
const team = [
  ['P1', 'Primary Developer 1', '核心功能與最短可行路徑'],
  ['P2', 'Primary Developer 2', '第二條功能線與技術風險'],
  ['IS', 'Integration & Support', '介面、PR、整合與排障'],
  ['D', 'Beginner & Slides', '簡單功能、UI、測試與簡報'],
]
const entrances = [
  ['角色指南', '知道誰負責什麼、什麼要停下來問，以及可直接交給 Codex 的任務 Prompt。', '#/roles', '01'],
  ['協作流程', '從認領任務到 PR merge 的完整路徑，含範例指令與 review 節奏。', '#/workflow', '02'],
  ['Git 新手指南', '用白話理解 Git 指令；每一項都標示出錯時該繼續或停止。', '#/git', '03'],
  ['安全與檢查', '公開 repository 邊界、secrets、dependency、feature freeze 與 checkpoint。', '#/safety', '04'],
]

export function HomePage() {
  return <>
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="eyebrow"><span /> 24 小時賽程 · 約 16 小時有效工作</p>
        <h1>四個人、一個 main，<br /><em>每 90 分鐘重新對齊。</em></h1>
        <p className="lead">給第一次一起使用 Codex 的四人團隊：用小任務、小 branch、小 PR，讓 AI 加速實作，同時讓人類掌握整合與風險。</p>
        <div className="hero-actions"><a className="button primary" href="#first-90">開始第一個 90 分鐘</a><a className="button secondary" href="#/workflow">查看完整流程 <span aria-hidden="true">→</span></a></div>
      </div>
      <aside className="mission-card" aria-label="今日任務參數">
        <div className="panel-label"><span>MISSION PARAMETERS</span><span className="live-dot">READY</span></div>
        <dl><div><dt>TEAM</dt><dd>4 人</dd></div><div><dt>CHECKPOINT</dt><dd>每 90 分鐘</dd></div><div><dt>FEATURE FREEZE</dt><dd>T−2:00</dd></div><div><dt>SLIDES + REHEARSAL</dt><dd>1.5 小時</dd></div></dl>
        <div className="rule-callout"><span>01</span><p><strong>唯一規則</strong>先讓 main 保持可運作，再追求更多功能。</p></div>
      </aside>
    </section>
    <section className="section-block" id="first-90">
      <SectionTitle kicker="FIRST CHECKPOINT" title="第一個 90 分鐘" description="先建立共同節奏，別急著讓四個 Agent 同時改同一塊程式碼。" />
      <ol className="timeline">{firstSprint.map(([time, title, text], index) => <li key={time}><span className="step-number">0{index + 1}</span><time>{time} MIN</time><h3>{title}</h3><p>{text}</p></li>)}</ol>
    </section>
    <section className="section-block team-section">
      <SectionTitle kicker="TEAM TOPOLOGY" title="四人配置" description="責任可輪替，但同一個 checkpoint 內的 owner 要清楚。" />
      <div className="team-grid">{team.map(([code, role, summary]) => <article key={code} className="team-card"><span className="role-code">{code}</span><h3>{role}</h3><p>{summary}</p><a href="#/roles">查看角色手冊 <span aria-hidden="true">↗</span></a></article>)}</div>
    </section>
    <section className="section-block directory-section">
      <SectionTitle kicker="PLAYBOOK DIRECTORY" title="你現在需要哪一頁？" description="每一種資訊都有獨立入口；細節可收摺，手機上也能快速找到答案。" />
      <div className="directory-grid">{entrances.map(([title, summary, href, index]) => <a className="directory-card" href={href} key={href}><span>{index}</span><h3>{title}</h3><p>{summary}</p><b aria-hidden="true">→</b></a>)}</div>
    </section>
  </>
}
