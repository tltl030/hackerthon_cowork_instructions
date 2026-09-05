import { useState } from 'react'
import { CopyBlock, PageIntro } from '../components/Content'

type Stage = 'all' | 'start' | 'build' | 'deliver' | 'help'

const filters: { key: Stage; label: string }[] = [
  { key: 'all', label: '全部' }, { key: 'start', label: '開始前' }, { key: 'build', label: '開發中' }, { key: 'deliver', label: '準備交付' }, { key: 'help', label: '遇到問題' },
]

const prompts: { stage: Exclude<Stage, 'all'>; tag: string; title: string; when: string; roles: string; stop: string; value: string }[] = [
  { stage: 'start', tag: 'START 01', title: '確認正確資料夾與 Git 狀態', when: '剛打開專案、換電腦，或不確定目前位置時', roles: '所有人', stop: '路徑、remote 或 branch 不符合團隊指定內容', value: `請先不要修改檔案。讀取 AGENTS.md 與 README，並執行 git status、git branch --show-current、git remote -v。\n用繁體中文告訴我：目前是哪個 repository、哪個 branch、工作區是否乾淨，以及我現在能不能安全開始新任務。資訊不一致時請停止。` },
  { stage: 'start', tag: 'START 02', title: '認領一個小任務', when: '團隊分工完成，準備建立自己的 branch 時', roles: 'P1／P2／IS／D', stop: '兩人可能修改同一個檔案或 shared interface 尚未確定', value: `我的角色是「<角色>」。我要認領的小任務是「<任務>」，完成標準是「<可驗證結果>」。\n請先讀 AGENTS.md 與相關程式碼，確認範圍是否夠小、是否可能和隊友碰撞。再檢查 Git 狀態，提出合適的 feature/<short-name>、fix/<short-name> 或 docs/<short-name> branch 名稱。先回報，不要立即修改。` },
  { stage: 'build', tag: 'BUILD 01', title: '開始自然語言開發', when: '已在自己的 branch，準備實作時', roles: '所有開發角色', stop: '需要改 dependency、shared interface 或任務外模組', value: `請先讀 AGENTS.md、目前 branch、相關程式碼與測試。\n這次只完成：「<用自然語言描述一個小任務>」。\n允許修改：「<檔案或模組>」。\n完成標準：「<可看見或測到的結果>」。\n先提出最多 4 步計畫，等我確認後再實作；完成後執行相關檢查並摘要變更。` },
  { stage: 'build', tag: 'BUILD 02', title: '請 AI 檢查目前修改', when: '完成一小段功能，想知道是否偏離範圍時', roles: '所有開發角色', stop: '出現陌生檔案、secret、lockfile 或任務外修改', value: `請只讀取目前 git status、git diff --stat 與 git diff，不要修改。\n依序回報：1. 修改了哪些檔案；2. 是否都屬於本任務；3. 有沒有 secret、debug log 或意外產生檔；4. 還缺哪些測試；5. 是否適合進入 commit 前檢查。` },
  { stage: 'build', tag: 'BUILD 03', title: '新增簡單 UI 或 Demo data', when: 'D 負責低耦合 UI、測試資料或展示內容時', roles: 'Beginner & Slides', stop: '需要更改 API、資料結構、核心邏輯或其他人的元件', value: `我的角色是 Beginner & Slides。請先讀 AGENTS.md 與相關畫面。\n只完成：「<UI／Demo data 小任務>」。沿用現有元件、樣式與資料格式，不改 API、shared types、dependency 或核心邏輯。\n先告訴我會修改哪些檔案與如何驗收，等我確認後再做。` },
  { stage: 'deliver', tag: 'SHIP 01', title: '執行交付前檢查', when: '功能完成、準備 commit 前', roles: '所有開發角色', stop: '任何檢查失敗或變更超出任務範圍', value: `功能已完成。請依 AGENTS.md 執行現有的 secrets scan、lint、typecheck、相關測試、production build 與 git diff --check。\n不要為了讓檢查通過而改動任務外程式碼。完成後用表格回報每項結果、變更檔案與仍存在的風險。` },
  { stage: 'deliver', tag: 'SHIP 02', title: '準備小 Commit 與 PR', when: '所有檢查已通過時', roles: 'P1／P2／IS；D 需有人陪同', stop: 'staged diff 夾帶其他任務、CI 失敗或出現 conflict', value: `請先再次顯示 git status、git diff --stat 與 staged diff。只暫存本任務檔案，建議一個 feat:／fix:／docs:／test: commit 訊息。\n等我確認後再 commit 與 push 自己的 branch，接著準備一個小 PR。不得 merge、force push、reset 或猜測式解 conflict。` },
  { stage: 'deliver', tag: 'SYNC 01', title: '90 分鐘 Integration Checkpoint', when: '每 90 分鐘的全隊整合時間', roles: 'Integration & Support 主持', stop: 'main 不能運作、介面不一致或 PR 有 conflict', value: `現在是 integration checkpoint。請先只讀取 Git 狀態與目前 PR 情況，整理：已完成、待 Review、可能碰撞、shared interface 變更、main 建置結果、Demo 主流程風險。\n依優先順序提出本輪要合併的最小 PR 與下一輪分工；不要自行 merge 或解 conflict。` },
  { stage: 'help', tag: 'HELP 01', title: '看不懂 Git 狀態', when: '終端出現陌生訊息，不知道是否能繼續時', roles: '所有人，尤其 D', stop: 'conflict、rebase、detached HEAD、reset 或拒絕 push', value: `我看不懂目前 Git 狀態。請保留現場，不要修改檔案，也不要執行 reset、restore、stash、rebase、merge 或 force push。\n只執行唯讀檢查，接著用新手能懂的繁體中文說明：發生什麼事、我的工作是否還在、哪些操作有風險，以及應該把什麼資訊交給 Integration Owner。` },
  { stage: 'help', tag: 'HELP 02', title: '發現可能的 Secret', when: 'diff、log 或檔案中疑似出現 key、token、password 時', roles: '所有人', stop: '不要 commit、push、貼到聊天或自行改寫 history', value: `我可能發現了 secret。請立即停止任何 commit 或 push。不要輸出 secret 的完整值。\n只確認受影響的檔名、是否已被 Git 追蹤、是否可能已推到遠端，並告訴我需要通知誰、是否要撤銷或輪替憑證。不要自行改寫 Git history。` },
]

export function PromptsPage() {
  const [stage, setStage] = useState<Stage>('all')
  const visible = prompts.filter((prompt) => stage === 'all' || prompt.stage === stage)
  return <>
    <PageIntro kicker="PROMPT TOOLKIT" title="找到情境，直接複製給 AI。" description="不用記指令，也不用重新貼完整背景。選擇你目前所在的階段，再替換 Prompt 裡的尖括號內容。" aside={<><span className="status-chip lime">10 個常用情境</span><span className="status-chip">先讀再改</span></>} />
    <div className="prompt-filter" role="group" aria-label="依工作階段篩選 Prompt">{filters.map((filter) => <button key={filter.key} type="button" className={stage === filter.key ? 'active' : ''} aria-pressed={stage === filter.key} onClick={() => setStage(filter.key)}>{filter.label}</button>)}</div>
    <section className="prompt-library" aria-live="polite">
      {visible.map((prompt) => <article className="prompt-tool-card" key={prompt.title}>
        <header><span>{prompt.tag}</span><h2>{prompt.title}</h2><p>{prompt.when}</p></header>
        <div className="prompt-meta"><p><b>適用角色</b>{prompt.roles}</p><p><b>停止線</b>{prompt.stop}</p></div>
        <CopyBlock value={prompt.value} label="複製 Prompt" />
      </article>)}
    </section>
  </>
}
