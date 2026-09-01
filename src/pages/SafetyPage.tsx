import { CopyBlock, List, Notice, PageIntro, SectionTitle } from '../components/Content'

const agentCan = [
  '讀取 AGENTS.md、README、程式碼、測試與文件',
  '執行 git status、git diff、git log、git fetch 等唯讀檢查',
  '在明確檔案範圍內實作已認領的小任務',
  '執行既有 lint、typecheck、test、build',
  '建立或更新安全的測試 fixture、mock data 與公開文件',
  '在 human review 後，對自己的 branch add、commit、push',
]
const agentAsk = [
  '新增、移除或升級 dependency，以及 lockfile 大幅變更',
  '修改 shared interface、schema、API contract、環境設定或 CI',
  '存取外部服務、帳號、付費資源、production 或私人資料',
  '刪除檔案、改寫 history、rebase、reset 或 force push',
  '解 merge conflict，尤其牽涉其他 owner 的工作',
  'merge PR、發布、改 repository 權限或處理任何 secret',
]
const prChecklist = [
  'branch 從最新 main 建立，名稱符合 feature／fix／docs',
  '只有一個小任務，沒有順手重構或不明檔案',
  'git diff 與 git diff --cached 已由 human 閱讀',
  '沒有 API key、token、password、private URL、帳號或客戶資料',
  '沒有未公布題目、私人架構或 private repository 內容',
  'dependency、lockfile、shared interface 變更已取得 Integration Owner 同意',
  'lint、typecheck、相關 test 與 production build 通過',
  'PR 寫明 Summary、Checks、Risk，並指派交叉 reviewer',
]
const checkpoint = [
  '所有人停止擴大範圍，回報：完成、阻塞、下一步',
  '確認每個任務、branch、PR 都有唯一 owner',
  '列出 shared interface／dependency／設定變更',
  '逐一 review 與 merge 小 PR；一次只整合一個',
  '每次 merge 後在乾淨 main 跑關鍵測試與 build',
  '實際走一次最短 Demo 路徑，記錄壞掉或變慢的地方',
  '刪減或降級高風險功能，更新下一輪任務卡',
  '同步 Demo data、截圖、簡報故事線與風險備案',
]

export function SafetyPage() {
  return <>
    <PageIntro kicker="PUBLIC + SAFE" title="公開內容只放通用指南。" description="這個 repository 與網站是 Public。任何秘密、未公布題目、產品程式碼、私人架構、客戶資料或 private repository 內容都不屬於這裡。" aside={<><span className="status-chip lime">PUBLIC SAFE</span><span className="status-chip amber">HUMAN GATES</span></>} />
    <Notice tone="warning" title="Public repository 沒有「之後再刪」">secret 一旦進入 commit，即使後來刪檔仍可能留在 history。若疑似外洩，停止 push、通知 owner、立即 rotate 憑證；不要只用新 commit 刪除。</Notice>

    <section className="section-block content-section">
      <SectionTitle kicker="AGENT PERMISSIONS" title="Agent 的自動操作邊界" description="安全、可回復、範圍清楚的工作可先做；影響他人、外部系統或歷史的動作必須先問。" />
      <div className="permission-grid"><article className="safe-panel"><span>CAN PROCEED</span><h3>可自行執行</h3><List items={agentCan} tone="safe" /></article><article className="danger-panel"><span>HUMAN GATE</span><h3>必須先詢問</h3><List items={agentAsk} tone="danger" /></article></div>
    </section>

    <section className="section-block safety-topics">
      <SectionTitle kicker="RISK CONTROLS" title="高風險變更怎麼處理" description="使用收摺區塊快速定位；每一項都先定 owner，再決定是否值得在 24 小時內承擔。" />
      <div className="topic-grid">
        <details open><summary><span>01</span><strong>API key 與 secrets</strong><b aria-hidden="true">＋</b></summary><div><List tone="danger" items={['不得寫進程式碼、Prompt、commit、issue、PR、截圖或 demo data', '不得放 token、password、private URL、帳號、客戶資料', '只在本機 .env 或 GitHub Actions Secrets 設定真正值', 'Agent 不應在輸出中回顯 secret；掃描工具也要避免把 secret 印到 log']} /><Notice tone="warning" title="疑似外洩">停止 push → 通知 owner → rotate／revoke → 評估清理 history；不要讓 Agent自行改寫 history。</Notice></div></details>
        <details><summary><span>02</span><strong>.env 與 .env.example</strong><b aria-hidden="true">＋</b></summary><div><p><code>.env</code> 放本機真實值且必須被忽略；<code>.env.example</code> 只列變數名稱與安全假值，讓隊友知道需要哪些設定。</p><CopyBlock value={`# .env（不要 commit）\nSERVICE_API_KEY=<real-secret>\n\n# .env.example（可以 commit）\nSERVICE_API_KEY=replace-with-your-own-key\nSERVICE_BASE_URL=https://example.invalid`} label="複製安全範例" /></div></details>
        <details><summary><span>03</span><strong>Dependency 變更</strong><b aria-hidden="true">＋</b></summary><div><List items={['先說明為什麼內建能力不夠、替代方案與時間成本', '由 Integration Owner 同意套件與版本後再安裝', '同時 review package.json、lockfile、授權與已知風險', '重新執行 lint、typecheck、test、build 與安全檢查', '禁止 npm audit fix --force；不要為了消警告引入 breaking changes']} /></div></details>
        <details><summary><span>04</span><strong>Shared interface 變更</strong><b aria-hidden="true">＋</b></summary><div><List items={['提出前後型別、呼叫端清單、migration／相容策略', 'P1、P2 與 Integration Owner 一起確認', '盡量先新增相容欄位，不在平行開發中突然改名或刪除', '用單獨小 PR 合併，其他人同步 main 後再繼續']} /></div></details>
        <details><summary><span>05</span><strong>Merge conflict</strong><b aria-hidden="true">＋</b></summary><div><List tone="danger" items={['先 git status 與列出 conflict 檔案，保留完整現場', '找到兩邊原作者與 Integration Owner，說明各自意圖', '逐段決定正確語意，再測所有受影響路徑', '不得讓 Agent 猜哪邊要刪；D 不自行處理', '不得用 reset、restore 或 force push 讓 conflict 看起來消失']} /></div></details>
        <details><summary><span>06</span><strong>Feature freeze</strong><b aria-hidden="true">＋</b></summary><div><p>預設結束前 2 小時 freeze：停止新功能與重構，只接受會阻斷 Demo 的小修正。保留約 1.5 小時完成簡報、Demo data、錄影／截圖、備案與排練。</p><List items={['鎖定可用 main 與 Demo 步驟', '只修 P0／Demo-blocking 問題', '每個修正仍需小 branch、小 PR、交叉 review', '準備離線畫面、fallback data 與說話腳本', '至少完整排練一次並計時']} /></div></details>
      </div>
    </section>

    <section className="section-block checklist-section">
      <SectionTitle kicker="BEFORE EVERY PR" title="PR 前檢查" description="由作者逐項確認，再交給不同成員 review。不要只貼「works on my machine」。" />
      <ol className="checklist">{prChecklist.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol>
      <CopyBlock value={`git status --short --branch\ngit diff --stat\ngit diff\ngit diff --check\ngit diff --cached\nnpm run lint\nnpm run typecheck\nnpm run build`} label="複製 PR 前指令" />
    </section>

    <section className="section-block checkpoint-section">
      <SectionTitle kicker="EVERY 90 MINUTES" title="Integration checkpoint" description="不是進度報告會，而是把 main 恢復成可執行、可 Demo、下一輪能安全分工的狀態。" />
      <ol className="checkpoint-list">{checkpoint.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol>
      <div className="freeze-banner"><div><small>DEFAULT FREEZE</small><strong>T − 2:00</strong></div><p>停止新功能，切到穩定、簡報、排練與備案。<br />約保留 1.5 小時完成簡報與 rehearsal。</p></div>
    </section>
  </>
}
