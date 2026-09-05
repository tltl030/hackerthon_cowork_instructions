import { CopyBlock, Notice, PageIntro, SectionTitle } from '../components/Content'

const stages = [
  {
    code: '01', phase: '開始前', time: '約 5–10 分鐘', title: '確認上下文，認領一個小任務',
    summary: '共同資料已在 repository 裡。AI 先讀 AGENTS.md、README 與程式碼，再確認 Git、角色和任務範圍。',
    jobs: ['確認所在 repository 與 git status', '從最新 main 建立自己的小 branch', '說明角色、任務、修改範圍與完成標準'],
    commands: `git status\ngit switch main\ngit pull --ff-only origin main\ngit switch -c feature/<short-name>`,
    prompt: `我的角色是「<角色>」，要認領「<一個小任務>」。\n請先讀 AGENTS.md、README 與相關程式碼，確認 repository、Git 狀態、任務範圍與可能碰撞的檔案。\n完成標準是「<可驗證結果>」。先回報最小計畫，等我確認後再修改。`,
    success: '你位於自己的 branch；AI 能說清楚角色、範圍與完成標準。',
    stop: '工作區不乾淨、pull 失敗、branch 已存在，或兩人可能修改同一檔案。',
  },
  {
    code: '02', phase: '開發中', time: '每次一個小切片', title: '用自然語言開發，邊做邊驗證',
    summary: '不必重新貼完整專案背景。只告訴 AI 這次要完成什麼，並要求它沿用 repository 既有規則與介面。',
    jobs: ['一次只完成一個可驗證切片', '先確認 AI 的最小計畫', '修改後執行相關測試並 Review diff'],
    commands: `git status --short\ngit diff --stat\nnpm run lint\nnpm run typecheck`,
    prompt: `請讀取目前 branch、AGENTS.md、相關程式碼與測試。\n這次只完成：「<自然語言描述任務>」。\n允許修改：「<檔案或模組>」。\n禁止修改 dependency、shared interface 與任務外程式碼。\n先提出最多 4 步計畫；確認後實作、測試並摘要 diff。`,
    success: '功能可見或可測，相關檢查通過，而且 diff 只包含目前任務。',
    stop: 'AI 想跨模組重構、改 dependency／shared interface，或 diff 出現陌生檔案。',
  },
  {
    code: '03', phase: '準備交付', time: '約 10–20 分鐘', title: '檢查、Commit、Push、開小 PR',
    summary: '人類先確認 Agent 產出的內容，再只暫存本任務檔案。PR 要小到讓隊友能快速交叉 Review。',
    jobs: ['跑完整檢查與 secrets scan', 'Review diff，只 stage 本任務檔案', 'commit、push 自己的 branch、建立 PR'],
    commands: `npm run scan:secrets\nnpm run lint\nnpm run typecheck\nnpm run build\ngit diff --check\ngit add <本任務檔案>\ngit diff --cached`,
    prompt: `功能已完成。請依 AGENTS.md 執行所有交付前檢查並摘要 diff。\n只暫存本任務檔案，建議一個清楚的 commit 訊息與小 PR 說明。\n等我確認後才能 commit 與 push；不要 merge、force push、reset 或猜測式解 conflict。`,
    success: '檢查全綠；commit 單一目的；PR 說明包含目的、檢查結果與風險。',
    stop: '檢查失敗、疑似 secret、lockfile 意外改變、PR 太大或出現 conflict。',
  },
  {
    code: '04', phase: '合併之後', time: '每 90 分鐘', title: '交叉 Review、Merge 後同步 main',
    summary: '由隊友 Review，由人類確認合併。所有人回到乾淨 main，驗證核心 Demo 流程，再開始下一輪。',
    jobs: ['至少一位不同成員 Review', 'Integration Owner 檢查介面與碰撞點', 'Merge 後同步 main，確認建置與 Demo 主流程'],
    commands: `git switch main\ngit pull --ff-only origin main\nnpm run typecheck\nnpm run build`,
    prompt: `現在是 integration checkpoint。請盤點目前 PR、Git 狀態與 main 的檢查結果。\n列出已完成、待 Review、可能碰撞、介面風險、Demo 主流程狀態與下一輪建議。\n不要自行 merge 或解 conflict，先把需要人類決定的項目列出來。`,
    success: 'main 可以運作；核心 Demo 流程通過；下一輪任務與 owner 清楚。',
    stop: 'CI 紅燈、main 無法建置、shared interface 不一致，或任一 PR 有 conflict。',
  },
]

export function WorkflowPage() {
  return <>
    <PageIntro kicker="FOUR-STAGE FLOW" title="一個任務，只走四個階段。" description="先看自己目前在哪一階段，再展開該階段的指令與 Prompt。完整 Git 名詞放在參考資料，不需要先背。" aside={<><span className="status-chip lime">SMALL TASK</span><span className="status-chip">SMALL PR</span><span className="status-chip amber">90 MIN SYNC</span></>} />

    <nav className="stage-rail" aria-label="四階段流程">{stages.map((stage) => <button key={stage.code} type="button" onClick={() => document.getElementById(`stage-${stage.code}`)?.scrollIntoView({ behavior: 'smooth' })}><span>{stage.code}</span><strong>{stage.phase}</strong></button>)}</nav>

    <section className="shared-context-summary">
      <div><p className="eyebrow">開始前先知道</p><h2>不用重新教 AI 整個專案</h2></div>
      <div className="context-summary-flow"><p><span>資料夾已經有</span><strong>AGENTS.md、README、程式碼、測試</strong></p><b aria-hidden="true">→</b><p><span>只要先確認</span><strong>Repository、Git、角色</strong></p><b aria-hidden="true">→</b><p><span>接著直接說</span><strong>這次的小任務與完成標準</strong></p></div>
    </section>

    <section className="stage-section" aria-labelledby="stage-list-title">
      <SectionTitle kicker="DO THIS NEXT" title="找到你的階段，照卡片做" description="每張卡只保留現在需要的資訊；指令與 Prompt 需要時再展開。" />
      <div className="stage-list" id="stage-list-title">
        {stages.map((stage, index) => <article className="stage-card" id={`stage-${stage.code}`} key={stage.code}>
          <header><span>{stage.code}</span><div><small>{stage.phase} · {stage.time}</small><h2>{stage.title}</h2><p>{stage.summary}</p></div><em>{index === stages.length - 1 ? 'CHECKPOINT' : 'NEXT →'}</em></header>
          <div className="stage-body">
            <section><h3>現在只做這三件事</h3><ol>{stage.jobs.map((job, jobIndex) => <li key={job}><span>{jobIndex + 1}</span>{job}</li>)}</ol></section>
            <section className="stage-signals"><div className="success-signal"><span>成功時</span><p>{stage.success}</p></div><div className="danger-signal"><span>停止線</span><p>{stage.stop}</p></div></section>
          </div>
          <details className="stage-detail"><summary><span>需要指令時展開</span><b>＋</b></summary><div><CopyBlock value={stage.commands} label="複製指令" /></div></details>
          <details className="stage-detail prompt-detail"><summary><span>直接複製這階段的 Prompt</span><b>＋</b></summary><div><CopyBlock value={stage.prompt} label="複製 Prompt" /></div></details>
        </article>)}
      </div>
    </section>

    <section className="checkpoint-mini">
      <div><p className="eyebrow">FIRST 90 MINUTES</p><h2>第一次整合前的節奏</h2></div>
      <ol><li><time>00–15</time><strong>對齊目標</strong><span>確認題目、成功標準、不能做的事</span></li><li><time>15–35</time><strong>切分工作</strong><span>定義介面，認領不碰撞的小任務</span></li><li><time>35–70</time><strong>平行開發</strong><span>各自在 branch 完成可驗證切片</span></li><li><time>70–90</time><strong>第一次整合</strong><span>小 PR、交叉 Review、確認 main 可跑</span></li></ol>
    </section>
    <Notice tone="warning" title="Beginner & Slides 的固定停止線">遇到 conflict、rebase、reset、detached HEAD、拒絕 push 或不明 Git 狀態，保留現場並前往「遇到問題」，不要自行嘗試修復。</Notice>
    <div className="workflow-footer-actions"><a className="button primary" href="#/prompts">前往 Prompt 工具箱</a><a className="button secondary" href="#/help">我遇到問題</a></div>
  </>
}
