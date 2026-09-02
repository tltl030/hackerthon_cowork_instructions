import type { MouseEvent, ReactNode } from 'react'
import { CopyBlock, Notice, SectionTitle } from '../components/Content'

type Stage = {
  number: string
  label: string
  title: string
  summary: string
  owner: string
  commands: string
  prompt: string
  stop: string
}

const stages: Stage[] = [
  {
    number: '00', label: '只做一次', title: '第一次把專案帶到電腦', owner: '全員',
    summary: '已經有專案資料夾就跳過這張卡。clone 同一個 repository 只需要做一次。',
    commands: `git clone <repository-url>\nSet-Location <repository-folder>\ngit status`,
    prompt: `我是 Git 新手，要第一次取得團隊專案。\n請先確認我提供的 repository URL 與預計放置的資料夾，不要猜路徑。\n確認後，一次只給我一個 PowerShell 指令並解釋預期會看到什麼。\n完成 clone 後只執行 git status；如果資料夾已存在、權限失敗或 repository 不對，立刻停止。`,
    stop: '資料夾已存在、要求登入、repository 名稱不對或沒有權限。',
  },
  {
    number: '01', label: '每個任務開始前', title: '先回到最新的 main', owner: '全員',
    summary: '確認手上沒有未完成修改，再取得隊友已合併的最新版本。',
    commands: `git status\ngit switch main\ngit pull --ff-only origin main`,
    prompt: `請先只做唯讀檢查，不要修改檔案。\n1. 讀取 AGENTS.md。\n2. 執行 git status，告訴我目前在哪個 branch、有沒有未提交修改。\n3. 判斷我現在是否適合更新 main。\n如果狀態不乾淨或你不確定，請停止並用繁體中文告訴我該找 Integration Owner 確認什麼。`,
    stop: '看到 modified、untracked、divergent 或任何不明訊息，就先不要 pull。',
  },
  {
    number: '02', label: '確認任務後', title: '替小任務開一條 branch', owner: '任務 Owner',
    summary: '一個任務只用一條工作線；不要直接在 main 寫程式。',
    commands: `git switch -c feature/<short-name>\n# 修正問題：git switch -c fix/<short-name>\n# 文件任務：git switch -c docs/<short-name>`,
    prompt: `我的小任務是：「<用一句話描述任務>」。\n請根據任務建議一個簡短 branch 名稱，只能使用 feature/、fix/ 或 docs/ 開頭。\n先執行 git status 並確認目前從最新 main 出發。\n建立 branch 後回報 branch 名稱；不要自行 commit、push、rebase 或 reset。`,
    stop: 'branch 已存在、名稱不確定、main 不乾淨或起點不明。',
  },
  {
    number: '03', label: '開始寫功能', title: '把一個小任務交給 Codex', owner: '任務 Owner + AI',
    summary: '先說清楚角色、檔案範圍、驗收與禁止事項；先看計畫再讓 AI 修改。',
    commands: `git branch --show-current\ngit status --short --branch`,
    prompt: `你是 <P1／P2／Integration & Support／Beginner & Slides> 的 coding agent。\n任務：「<一個小任務>」。\n只允許修改：<檔案或模組>。\n完成標準：<可以看見或測到的結果>。\n開始前先讀 AGENTS.md、README 與相關程式碼，回報最多 4 步的小計畫，不要立即修改。\n禁止：改 shared interface、dependency、設定、其他人的程式碼；禁止 rebase、reset、force push 或猜 conflict。\n如果範圍不足或狀態不明，停止並問我。`,
    stop: 'AI 想跨模組重構、改 dependency、shared interface 或其他人的檔案。',
  },
  {
    number: '04', label: 'AI 修改完成後', title: '看差異、執行檢查', owner: 'Human',
    summary: '先看 AI 改了哪些檔案，再讓它找出專案真正使用的檢查指令。',
    commands: `git status --short\ngit diff --stat\ngit diff\ngit diff --check`,
    prompt: `請停止新增功能，現在只做檢查。\n1. 摘要 git diff：改了哪些檔案、每個變更對應哪個需求。\n2. 指出任何超出任務範圍、可疑資料、secret、dependency 或 shared interface 變更。\n3. 從 README 與 package scripts 找出本專案的 lint、typecheck、test、build 指令。\n4. 依序執行必要檢查；失敗時先解釋原因，不要擴大修改範圍。`,
    stop: '看到不認識的檔案、secret、lockfile、設定或檢查失敗原因不明。',
  },
  {
    number: '05', label: '檢查通過後', title: '只保存這個小任務', owner: 'Human',
    summary: 'add 是選檔案，commit 是建立本機存檔點；兩者都還沒有上傳 GitHub。',
    commands: `git add <本任務檔案>\ngit diff --cached\ngit commit -m "feat: <short summary>"\ngit status`,
    prompt: `請幫我準備 commit，但先不要執行 commit。\n根據任務列出應該 stage 的檔案，不要使用 git add .。\n檢查 staged diff 是否只包含這個小任務，並建議一個 commit message：\nfeat: 新功能／fix: 修正／docs: 文件／test: 測試。\n如果 staged 內容超出範圍，停止並指出要取消 stage 的檔案。`,
    stop: 'staged diff 有其他任務、不明檔案、secret 或你沒有親自看過的內容。',
  },
  {
    number: '06', label: '準備交給隊友', title: 'push 並開小 PR', owner: 'Human + Reviewer',
    summary: 'push 上傳自己的 branch；PR 請另一位成員檢查，確認後才合併。',
    commands: `git branch --show-current\ngit push -u origin <branch-name>\ngh pr create --base main --head <branch-name>`,
    prompt: `請根據目前 branch 與 commit 草擬一份小 PR，不要自行 merge。\n格式：\nSummary：這次完成什麼。\nChecks：實際執行哪些檢查、結果如何。\nRisk：reviewer 最需要注意什麼。\n確認 PR 只包含一個任務，並建議由哪個角色 review。若 CI 失敗或有 conflict，停止。`,
    stop: 'push 被拒絕、CI 紅燈、PR 混入其他任務或出現 conflict。禁止 force push。',
  },
  {
    number: '07', label: 'PR 合併後', title: '同步 main，再領下一張任務', owner: '全員',
    summary: '任務完成後回到團隊版本。不要在舊 branch 直接開始下一個功能。',
    commands: `git switch main\ngit pull --ff-only origin main\ngit status`,
    prompt: `這個 PR 已由人類確認合併。請只協助我同步，不要修改程式碼。\n執行 git status，確認工作區乾淨後切回 main，使用 --ff-only 更新。\n最後回報目前 branch、是否與 origin/main 同步，以及我是否可以開始下一個小任務。\n若出現 conflict、divergent 或未提交內容，停止。`,
    stop: '切不回 main、pull 失敗、狀態不乾淨或舊 branch 還有未保存內容。',
  },
]

const rolePrompts = [
  { code: 'P1', role: 'Primary Developer 1', focus: '核心功能', prompt: `我是 P1，負責核心 Demo 路徑。\n請先找出完成「<核心小任務>」最短、可測試的切片。\n只修改 <檔案／模組>；先列出與 P2 共用的 interface，但未經同意不要改它。\n完成後回報可 Demo 的行為、測試結果與降級方案。` },
  { code: 'P2', role: 'Primary Developer 2', focus: '平行功能線', prompt: `我是 P2，負責「<第二功能線>」。\n請先確認這個任務不會修改 P1 正在工作的檔案。\n依既定輸入／輸出完成一個獨立切片，包含相關 loading、empty 或 error 狀態。\n不要改 shared interface；若現有 contract 不夠，停止並列出需要協調的項目。` },
  { code: 'IS', role: 'Integration & Support', focus: '整合與風險', prompt: `我是 Integration & Support。請先只做唯讀整合檢查。\n檢查目前 branch／PR 的範圍、shared interface、dependency、設定、secrets、測試與可能碰撞的檔案。\n輸出：可整合／需修改／必須停止，以及具體理由與最小修正清單。\n不要 merge、rebase、reset、force push 或自行解 conflict。` },
  { code: 'D', role: 'Beginner & Slides', focus: '簡單任務與 Demo', prompt: `我是新手 D。請用繁體中文、短句，一次只帶我做一步。\n小任務：「<UI／測試／demo data／簡報任務>」。\n只允許修改 <1–2 個檔案>；完成標準是 <可直接看到的結果>。\n每次操作前先解釋目的。不要改 dependency、shared interface 或 Git history。\n看到 conflict、rebase、reset 或不明狀態，立刻叫我找 Integration Owner。` },
]

const situationPrompts = [
  { title: '我不知道現在能不能繼續', tag: '先診斷', prompt: `請只執行 git status --short --branch、git log -5 --oneline --decorate 與 git diff --stat。\n用繁體中文告訴我：目前 branch、未提交檔案、與 main 的關係，以及「可以繼續」或「必須找 Integration Owner」。\n不要修改、stash、restore、reset、rebase 或 commit。` },
  { title: '測試或 build 失敗', tag: '先縮小原因', prompt: `請讀取剛才的完整錯誤輸出，只診斷與本任務直接相關的第一個根因。\n說明：哪個檔案、為什麼失敗、最小修正是什麼、修完要重跑哪個指令。\n不要順手升級 dependency、關閉檢查或修改其他模組。先等我確認再修。` },
  { title: '準備交給 reviewer', tag: 'PR 前', prompt: `請對目前變更做最後 review：檢查任務範圍、可讀性、錯誤狀態、測試、secrets、dependency、shared interface 與 Git diff。\n列出 Blocking／Should fix／Looks good。\n若沒有 blocking issue，再草擬 PR 的 Summary、Checks、Risk；不要自行 push 或 merge。` },
  { title: 'checkpoint 要整合', tag: '每 90 分鐘', prompt: `現在是 90 分鐘 integration checkpoint。\n請彙整目前 branch 與 PR：owner、完成狀態、CI、shared interface 變更、dependency 變更與 conflict 風險。\n提出安全的 merge 順序，以及每次 merge 後要執行的最小驗證。\n只做分析，不要自行 merge 或解 conflict。` },
  { title: '出現 conflict', tag: '立即停止', prompt: `出現 Git conflict。請不要修改任何 conflict 檔案。\n只執行 git status 與 git diff --name-only --diff-filter=U，列出衝突檔案與目前 branch。\n告訴我應該找哪些檔案 owner 與 Integration Owner。禁止 add、commit、restore、reset、rebase、merge 或 force push。` },
]

const terms = [
  ['repository / repo', '整個專案、檔案與歷史紀錄的集合。'],
  ['clone', '第一次把 GitHub 上的 repository 複製到電腦。'],
  ['main', '團隊共同維護、目前應該可以運作的版本。'],
  ['branch', '你為一個小任務建立的獨立工作線。'],
  ['status', '查看目前 branch 與哪些檔案有變動；安全、不會改檔案。'],
  ['pull', '把 GitHub 上最新版本更新到目前 branch。'],
  ['diff', '查看程式碼到底改了什麼；commit 前一定要看。'],
  ['add / stage', '挑出要放進下一個 commit 的檔案。'],
  ['commit', '替 staged 內容建立一個有名稱的本機存檔點。'],
  ['push', '把自己的 branch 與 commit 上傳到 GitHub。'],
  ['Pull Request / PR', '請隊友 review，確認後把 branch 合併進 main。'],
  ['merge', '把已 review 的工作加入 main；由團隊確認的人執行。'],
]

function JumpLink({ target, className, children }: { target: string; className?: string; children: ReactNode }) {
  function jump(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return <a className={className} href="#/git" onClick={jump}>{children}</a>
}

export function GitPage() {
  return <>
    <header className="git-guide-intro">
      <div>
        <p className="eyebrow"><span />BEGINNER GIT PATH</p>
        <h1>第一次用 Git？<br /><em>照著任務階段走就好。</em></h1>
        <p className="lead">不用先背完整 Git。找到你現在正在做的事，複製指令，再把旁邊的 Prompt 交給 Codex。</p>
        <div className="hero-actions"><JumpLink className="button primary" target="git-do-now">我準備開始任務</JumpLink><JumpLink className="button secondary" target="git-stop">我遇到錯誤了</JumpLink></div>
      </div>
      <aside className="git-three-rules">
        <span>只記住 3 件事</span>
        <ol><li><b>main</b><p>團隊目前可運作的版本</p></li><li><b>branch</b><p>你做一個小任務的工作區</p></li><li><b>PR</b><p>請隊友檢查並合併的申請</p></li></ol>
      </aside>
    </header>

    <nav className="git-jumpbar" aria-label="Git 教學快速跳轉">
      <span>我現在要⋯</span><JumpLink target="git-do-now">照流程操作</JumpLink><JumpLink target="git-prompts">叫 AI 幫忙</JumpLink><JumpLink target="git-words">查名詞</JumpLink><JumpLink target="git-stop">處理錯誤</JumpLink>
    </nav>

    <section className="section-block git-path-section" id="git-do-now">
      <SectionTitle kicker="DO THIS NOW" title="跟著任務卡一步一步做" description="找到你目前的階段即可，不必一次讀完。每張卡都有指令、Prompt 與停止線。" />
      <ol className="git-stage-list">
        {stages.map((stage) => <li className="git-stage" key={stage.number}>
          <header><span>{stage.number}</span><div><small>{stage.label}</small><div className="git-stage-title"><h3>{stage.title}</h3><em>{stage.owner}</em></div><p>{stage.summary}</p></div></header>
          <div className="git-stage-tools"><section><p className="tool-label">POWERSHELL</p><CopyBlock value={stage.commands} label="複製指令" /></section><section className="stage-prompt"><p className="tool-label">ASK CODEX</p><CopyBlock value={stage.prompt} label="複製 Prompt" /></section></div>
          <div className="git-stage-stop"><b>看到這些就停</b><span>{stage.stop}</span></div>
        </li>)}
      </ol>
    </section>

    <section className="section-block prompt-deck-section" id="git-prompts">
      <SectionTitle kicker="PROMPT PLAYBOOK" title="先選角色，再把小任務填進去" description="四個角色的 Prompt 邊界不同。複製最接近你工作的那一張，不要把整個產品一次交給 AI。" />
      <Notice title="Prompt 的三個必填欄位">把 <code>&lt;小任務&gt;</code>、<code>&lt;檔案範圍&gt;</code>、<code>&lt;完成標準&gt;</code> 寫清楚；不知道怎麼填就先問 Integration Owner。</Notice>
      <div className="role-prompt-grid">
        {rolePrompts.map((item) => <article className="role-prompt-card" key={item.code}><header><span>{item.code}</span><div><small>{item.focus}</small><h3>{item.role}</h3></div></header><CopyBlock value={item.prompt} label="複製角色 Prompt" /></article>)}
      </div>

      <SectionTitle kicker="WHEN SOMETHING HAPPENS" title="常見情境 Prompt" description="AI 可以幫你看狀態、縮小錯誤與準備 review；危險 Git 狀況只能蒐集資訊，不能讓它自行處理。" />
      <div className="situation-prompt-list">
        {situationPrompts.map((item, index) => <details key={item.title} open={index === 0}><summary><span>{item.tag}</span><strong>{item.title}</strong><b aria-hidden="true">＋</b></summary><div><CopyBlock value={item.prompt} label="複製情境 Prompt" /></div></details>)}
      </div>
    </section>

    <section className="section-block git-words-section" id="git-words">
      <SectionTitle kicker="30-SECOND GLOSSARY" title="看到名詞，30 秒查懂" description="只收錄這次黑客松流程真的會碰到的字。先知道它在流程中的位置，不必背底層原理。" />
      <dl className="git-word-grid">{terms.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
      <div className="command-cheatsheet">
        <div><p className="tool-label">最安全的查看指令</p><CopyBlock value={`git status --short --branch\ngit diff --stat\ngit diff`} label="複製查看指令" /></div>
        <div><p className="tool-label">四種 commit 開頭</p><CopyBlock value={`feat: add <feature>\nfix: handle <problem>\ndocs: clarify <topic>\ntest: cover <case>`} label="複製 commit 範例" /></div>
      </div>
    </section>

    <section className="git-stop-panel" id="git-stop">
      <p className="eyebrow">STOP — ASK FOR HELP</p><h2>看到 conflict、rebase、reset、force push，就不要繼續。</h2><p>只執行 <code>git status</code>，保留完整畫面，找 Integration Owner。不要讓 AI 猜要刪掉哪一邊，也不要用危險指令讓狀態看起來「乾淨」。</p>
      <div className="danger-word-grid"><div><b>conflict</b><span>兩邊改到同一處，需要原作者判斷</span></div><div><b>rebase</b><span>重新排列歷史，新手不自行操作</span></div><div><b>reset</b><span>可能丟失修改或移動歷史</span></div><div><b>force push</b><span>改寫遠端歷史，本團隊禁止</span></div></div>
      <CopyBlock value={situationPrompts[4].prompt} label="複製停止求助 Prompt" />
    </section>
  </>
}
