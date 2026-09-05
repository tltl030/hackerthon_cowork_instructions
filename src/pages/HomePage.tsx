import { useMemo, useState } from 'react'
import { CopyBlock } from '../components/Content'

type RoleKey = 'p1' | 'p2' | 'is' | 'd'
type TaskKey = 'start' | 'claim' | 'continue' | 'deliver' | 'checkpoint' | 'trouble'

const roles: Record<RoleKey, { code: string; label: string; focus: string }> = {
  p1: { code: 'P1', label: 'Primary Developer 1', focus: '核心功能與最短可行路徑' },
  p2: { code: 'P2', label: 'Primary Developer 2', focus: '第二條功能線與技術風險' },
  is: { code: 'IS', label: 'Integration & Support', focus: '介面、PR、整合與排障' },
  d: { code: 'D', label: 'Beginner & Slides', focus: '簡單功能、UI、測試與簡報' },
}

const tasks: Record<TaskKey, { label: string; hint: string; goal: string; steps: string[]; commands: string; success: string; stop: string; request: string }> = {
  start: { label: '第一次開始工作', hint: '先確認環境，不修改程式', goal: '讓 AI 讀懂共同資料並確認你在安全的工作狀態。', steps: ['打開團隊指定的專案資料夾', '把下方 Prompt 貼給 AI', '確認 AI 回報的 repository、branch 與角色都正確'], commands: 'git status\ngit branch --show-current', success: 'AI 說明已讀取 AGENTS.md，並回報正確 branch 與乾淨工作區。', stop: '資料夾不對、目前在 main 但準備修改，或出現不認識的變更。', request: '先幫我確認專案狀態，不要修改任何檔案。' },
  claim: { label: '認領新任務', hint: '建立一個安全的小 branch', goal: '把一件小任務切清楚，從最新 main 建立自己的 branch。', steps: ['告訴 AI 任務與完成標準', '請 AI 確認不會和別人的檔案碰撞', '確認工作區乾淨後建立新 branch'], commands: 'git switch main\ngit pull --ff-only origin main\ngit switch -c feature/<short-name>', success: '你位於自己的新 branch，AI 能用一句話說清楚任務範圍。', stop: '工作區不乾淨、pull 失敗、branch 已存在，或兩人會修改同一檔案。', request: '我要認領一個新任務，請先確認範圍與 Git 狀態，再協助建立 branch。' },
  continue: { label: '繼續目前工作', hint: '確認上下文後自然語言開發', goal: '讓 AI 從 repository 恢復上下文，只完成目前這個小任務。', steps: ['請 AI 讀取 AGENTS.md 與目前 diff', '用自然語言說明接下來要完成什麼', '先確認小計畫，再讓 AI 修改與測試'], commands: 'git status --short\ngit diff --stat', success: 'AI 的計畫只包含目前任務，並知道哪些檔案不能碰。', stop: 'AI 想改 dependency、shared interface、其他人的模組，或現有 diff 來源不明。', request: '請讀取目前 branch、既有 diff 與相關程式碼，接著完成我描述的小任務。' },
  deliver: { label: '完成功能並送出', hint: '檢查、commit、push、PR', goal: '確認變更安全且只包含一個任務，再送交隊友 Review。', steps: ['請 AI 跑檢查並摘要 diff', '只暫存本任務檔案並建立 commit', 'push branch，建立小 PR 請隊友 Review'], commands: 'npm run lint\nnpm run typecheck\nnpm run build\ngit diff --check', success: '所有檢查通過，PR 內容只有這個任務，而且 reviewer 看得懂。', stop: '測試失敗、出現 secret／陌生檔案、lockfile 意外改變，或 PR 有 conflict。', request: '功能已完成，請先檢查變更與測試；不要直接 merge，等我確認後再準備 commit 與 PR。' },
  checkpoint: { label: '90 分鐘整合', hint: '全隊重新對齊 main', goal: '確認已完成的工作能一起運作，重新分配下一輪小任務。', steps: ['Integration Owner 整理目前 PR 與碰撞點', '通過 Review 的小 PR 才合併', '全員同步 main，跑最小可用流程'], commands: 'git switch main\ngit pull --ff-only origin main\nnpm run typecheck\nnpm run build', success: 'main 可以啟動，核心 Demo 流程可用，下一輪 owner 與任務清楚。', stop: 'main 無法建置、shared interface 不一致、PR conflict，或 Demo 主流程中斷。', request: '現在是 integration checkpoint，請盤點 Git、檢查 main，並列出風險與下一步；不要自行解 conflict。' },
  trouble: { label: '我遇到問題', hint: '保留現場，先讓 AI 解釋', goal: '保留目前狀態，取得可理解的診斷，再決定由誰處理。', steps: ['不要輸入 reset、rebase 或 force push', '複製下方 Prompt，讓 AI 只讀取與解釋', '把結果交給 Integration Owner 判斷'], commands: 'git status\ngit branch --show-current\ngit log -5 --oneline', success: '你知道發生什麼事、哪些檔案受影響，以及應該找誰處理。', stop: '看到 conflict、detached HEAD、rebase、reset、拒絕 push，或任何不確定的 Git 狀態。', request: '我遇到不明狀況。請保留現場，只讀取並解釋，不要執行任何會改寫 Git 狀態的操作。' },
}

export function HomePage() {
  const [roleKey, setRoleKey] = useState<RoleKey>('d')
  const [taskKey, setTaskKey] = useState<TaskKey>('start')
  const role = roles[roleKey]
  const task = tasks[taskKey]
  const prompt = useMemo(() => `我們正在既有的共同開發 repository 中。\n\n我的角色是：${role.label}（${role.focus}）。\n現在要做的事：${task.request}\n\n請先讀取 AGENTS.md、README、相關程式碼、測試與專案指令，並執行 git status。\n先用繁體中文回報：\n1. repository 與目前 branch\n2. 工作區是否乾淨\n3. 你理解的角色責任與停止線\n4. 最多 4 步的最小工作計畫\n\n等我確認後再修改。若 Git 狀態、任務範圍或 shared interface 不清楚，停止並詢問，不要自行猜測。`, [role, task])

  return <>
    <section className="start-workspace" aria-labelledby="start-title">
      <header className="start-header">
        <div><p className="eyebrow"><span />第一次來也能直接開始</p><h1 id="start-title">你現在要做什麼？</h1><p className="lead">選擇角色與目前情境，照著右邊的操作卡做。你不需要先讀完整份 Git 教學。</p></div>
        <div className="start-promise"><strong>30 秒</strong><span>找到下一步</span></div>
      </header>
      <div className="start-grid">
        <div className="start-choices">
          <fieldset className="choice-group">
            <legend><span>1</span>選擇你的角色</legend>
            <div className="role-choice-grid">
              {(Object.entries(roles) as [RoleKey, typeof roles[RoleKey]][]).map(([key, item]) => <button key={key} type="button" className={roleKey === key ? 'choice-button active' : 'choice-button'} aria-pressed={roleKey === key} onClick={() => setRoleKey(key)}><b>{item.code}</b><span><strong>{item.label}</strong><small>{item.focus}</small></span></button>)}
            </div>
          </fieldset>
          <fieldset className="choice-group">
            <legend><span>2</span>選擇目前情境</legend>
            <div className="task-choice-grid">
              {(Object.entries(tasks) as [TaskKey, typeof tasks[TaskKey]][]).map(([key, item]) => <button key={key} type="button" className={taskKey === key ? 'task-button active' : 'task-button'} aria-pressed={taskKey === key} onClick={() => setTaskKey(key)}><span><strong>{item.label}</strong><small>{item.hint}</small></span><b aria-hidden="true">→</b></button>)}
            </div>
          </fieldset>
        </div>
        <aside className="next-action" aria-live="polite">
          <div className="action-heading"><span>NEXT ACTION</span><em>{role.code} · 約 2–5 分鐘</em></div>
          <h2>{task.label}</h2><p>{task.goal}</p>
          <ol>{task.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
          <details className="quick-command"><summary>這一步可能用到的指令 <b>＋</b></summary><CopyBlock value={task.commands} label="複製指令" /></details>
          <div className="result-check"><span>成功時</span><p>{task.success}</p></div>
          <div className="stop-check"><span>立即停止</span><p>{task.stop}</p></div>
          <CopyBlock value={prompt} label="複製給 AI" />
          <div className="action-links"><a href="#/workflow">查看所在階段</a><a href="#/prompts">更多情境 Prompt</a></div>
        </aside>
      </div>
    </section>
    <section className="three-rules" aria-labelledby="rules-title">
      <div><p className="eyebrow">只要先記得</p><h2 id="rules-title">三條安全規則</h2></div>
      <ol><li><span>01</span><p><strong>不在 main 開發</strong>一個小任務使用一個 branch。</p></li><li><span>02</span><p><strong>不懂就保留現場</strong>不要自行 reset、rebase 或解 conflict。</p></li><li><span>03</span><p><strong>每 90 分鐘整合</strong>用小 PR 交叉 Review，讓 main 保持可運作。</p></li></ol>
    </section>
    <section className="reference-shortcuts">
      <div><p className="eyebrow">需要時再查</p><h2>參考資料不用先讀完</h2><p>開始工作時用上面的導航；遇到特定問題，再進入完整說明。</p></div>
      <nav aria-label="參考資料"><a href="#/roles">角色邊界<span>→</span></a><a href="#/git">Git 名詞<span>→</span></a><a href="#/safety">安全檢查<span>→</span></a></nav>
    </section>
  </>
}
