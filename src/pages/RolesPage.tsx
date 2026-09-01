import { CopyBlock, List, Notice, PageIntro, SectionTitle } from '../components/Content'

const roles = [
  {
    code: 'P1', title: 'Primary Developer 1', subtitle: '核心路徑 Owner',
    mission: '把最關鍵、最難替代的產品路徑做成可示範、可測試、可整合的最小切片。',
    responsibilities: ['主導核心功能或最短 Demo 路徑', '先定義與 P2 共用的資料型別、API contract 或 component props', '在 checkpoint 前提供可整合的 branch 或 PR', '指出技術風險、降級方案與驗收方式'],
    tasks: ['核心 domain logic', '關鍵 API／模型串接的薄切片', '會阻塞其他人的 shared interface', '最需要深度 debugging 的單一問題'],
    avoid: ['同時認領多個互相無關的大功能', '未通知 Integration Owner 就改 shared interface', '讓 Codex 自行選擇大規模重構', '直接在 main 開發或替別人解 conflict'],
    workflow: ['與 P2、Integration Owner 確認 interface 與 acceptance criteria', '從最新 main 建立 feature/<short-name>', '要求 Codex 先讀相關檔案、提出小範圍計畫', '分段實作並執行精準測試', '自己 review diff 與 secrets，再開小 PR', '交叉 review 後立即協助整合驗證'],
    prompt: `你是 Primary Developer 1 的 coding agent。\n\n任務：在目前 repository 完成「<單一核心任務>」。\n範圍：只允許修改 <檔案／模組>。\n先做：讀取 AGENTS.md、相關程式碼與現有測試，回報你理解的 interface 與最小實作計畫。\n禁止：修改 shared interface、加入 dependency、接觸 secrets、force push、reset 或處理別人的 branch。\n驗收：<可觀察行為>；執行 <測試指令>；最後列出 diff 摘要、測試結果與仍有風險。\n若需求與現有 interface 衝突，停止並詢問我，不要自行猜測。`,
  },
  {
    code: 'P2', title: 'Primary Developer 2', subtitle: '第二功能線 Owner',
    mission: '建立與核心路徑可獨立推進的第二條功能線，並用清楚介面降低平行開發碰撞。',
    responsibilities: ['主導第二條使用者路徑或技術模組', '與 P1 對齊輸入、輸出、錯誤與 loading state', '替關鍵 edge case 建立測試或替身資料', '在整合前清楚標出尚未完成或暫時 mock 的區域'],
    tasks: ['獨立頁面或流程', '資料轉換與錯誤處理', '可與核心功能透過 contract 連接的模組', '關鍵測試、mock adapter 或 fallback'],
    avoid: ['在未確認的情況下重做 P1 的程式碼', '把多個功能塞進一個 PR', '跳過測試只靠 Demo 目測', '讓 Agent 改 lockfile 或設定卻不說明'],
    workflow: ['確認這條功能線不會和 P1 改同一批檔案', '從最新 main 建立小 branch', '先寫清楚輸入、輸出與失敗狀態', '讓 Codex 實作一個可測試切片', 'review diff、測試、提交小 PR', '在 checkpoint 與 P1 互相 review'],
    prompt: `你是 Primary Developer 2 的 coding agent。\n\n目標：完成「<第二功能線的小任務>」，且不得破壞 Primary Developer 1 的核心路徑。\n允許修改：<檔案清單>。\n既定 contract：輸入 <...>；成功輸出 <...>；失敗狀態 <...>。\n請先檢查現有測試與呼叫端，再提出最多 5 步的小計畫。\n實作時要包含 loading、empty、error 中與本任務相關的狀態，以及最小測試。\n不要自行改 shared types、dependency 或設定檔；需要時先停下來回報。\n完成後提供：修改摘要、執行的指令、結果、可供 reviewer 注意的 3 個重點。`,
  },
  {
    code: 'IS', title: 'Integration & Support', subtitle: '整合節奏 Owner',
    mission: '保護 main、消除團隊阻塞、讓每 90 分鐘都產生一個可運作的整合版本。',
    responsibilities: ['維護任務看板、branch owner 與 checkpoint 時間', '協調 shared interface、dependency 與設定變更', '協助小 PR review、merge 後驗證與回歸', '處理或主持 conflict 分析，但不猜測他人意圖', '在 feature freeze 後只接受 demo-critical fix'],
    tasks: ['建立共同型別與 mock contract', 'CI、測試指令與 build 修正', '跨模組整合、回歸測試與排障', '協助 D 處理 Git 狀態或縮小任務'],
    avoid: ['成為所有功能的實作者而失去整合視角', '未詢問原作者就解語意 conflict', '用 reset 或 force push 快速「整理」別人的工作', '同時 merge 多個未驗證的大 PR'],
    workflow: ['每輪開始更新任務表、風險與 owner', '提早定義或鎖定 shared interface', '持續查看 PR 大小、CI 與可能碰撞檔案', 'checkpoint 前暫停新功能，逐一 merge 小 PR', '在乾淨 main 上執行 lint、typecheck、test、build', '發布整合結果與下一輪調整'],
    prompt: `你是 Integration & Support 的分析 agent。\n\n任務：評估目前 branch／PR「<名稱>」能否安全整合到 main。\n請先只做唯讀檢查：讀 AGENTS.md、git status、git diff、相關測試與 shared interface。\n檢查：範圍是否超出、是否有 secrets、dependency／lockfile 變更、interface breaking change、測試缺口、與其他工作可能衝突。\n未經我確認，不得 merge、rebase、reset、force push 或解 conflict。\n輸出：1) 可合併／需修改／必須停下；2) 具體證據；3) 最小修正清單；4) 建議驗證指令。\n若需要修改，等我授權後才動手。`,
  },
  {
    code: 'D', title: 'Beginner & Slides', subtitle: '簡單功能與 Demo Owner',
    mission: '完成低耦合、容易驗證的工作，同時持續累積 Demo data、畫面素材與簡報故事線。',
    responsibilities: ['處理小型 UI、文案、測試、demo data 與文件', '每次只認領一個清楚、可回復的小任務', '保留畫面截圖、Demo 步驟與簡報重點', '遇到不明 Git 狀態立即找 Integration Owner'],
    tasks: ['單一元件的文案、樣式或 loading／empty state', '明確輸入輸出的簡單函式', '測試案例、fixture、mock data', 'README、Demo 腳本、簡報大綱與回歸清單'],
    avoid: ['shared interface、核心架構或 dependency 升級', 'conflict、rebase、reset、force push', '需要同時修改很多模組的任務', '把 key、真實客戶資料或 private URL 放進 demo data'],
    workflow: ['請 Integration Owner 給一張有檔案範圍與驗收條件的任務卡', '更新 main 後建立自己的小 branch', '讓 Codex 先解釋將修改什麼，再允許實作', '逐項照驗收清單檢查畫面或測試', '先給 Integration Owner review，再 push／開 PR', '同步更新 Demo 與簡報素材'],
    prompt: `你是協助 Hackathon 新手的 coding agent。請用繁體中文、短句、一步一步進行。\n\n小任務：「<任務>」。\n只允許修改：<1–2 個檔案>。\n完成標準：<可直接看到或測到的結果>。\n開始前先：1) 讀 AGENTS.md；2) 說明目前 Git 狀態；3) 用 3 點以內說明你會改什麼。\n不要修改 shared interface、package.json、lockfile、設定檔或別人的程式碼。\n不要執行 rebase、reset、force push，也不要自行處理 conflict。\n每次修改後告訴我要執行哪一個安全檢查。若 Git 狀態不明或出現 conflict，立刻停止並叫我找 Integration Owner。`,
  },
]

export function RolesPage() {
  return <>
    <PageIntro kicker="ROLE CARDS" title="四個角色，一條整合線。" description="Primary Developers 拉開平行工作線，Integration & Support 守住 main；Beginner & Slides 用低風險任務支援產品與 Demo。" aside={<><span className="status-chip">2 × PRIMARY</span><span className="status-chip">1 × INTEGRATION</span><span className="status-chip">1 × BEGINNER</span></>} />
    <Notice title="角色不是職稱，是當下的責任邊界">每個 90 分鐘 checkpoint 都重新確認 owner。任何人都可以幫忙，但只有 owner 決定該工作線的取捨。</Notice>
    <section className="section-block content-section">
      <SectionTitle kicker="ROLE MANUALS" title="角色操作手冊" description="展開角色卡，直接把 Prompt 中的尖括號內容換成當下任務。" />
      <div className="role-manuals">
        {roles.map((role, index) => <details className="role-manual" key={role.code} open={index === 0}>
          <summary><span className="role-code">{role.code}</span><span><small>{role.subtitle}</small><strong>{role.title}</strong><em>{role.mission}</em></span><b aria-hidden="true">＋</b></summary>
          <div className="role-body">
            <div className="role-columns">
              <section><h3>主要責任</h3><List items={role.responsibilities} tone="safe" /></section>
              <section><h3>適合認領</h3><List items={role.tasks} /></section>
              <section><h3>不要自行處理</h3><List items={role.avoid} tone="danger" /></section>
              <section><h3>工作流程</h3><ol className="number-list">{role.workflow.map((item) => <li key={item}>{item}</li>)}</ol></section>
            </div>
            <div className="prompt-panel"><div><p className="eyebrow">CODEX PROMPT</p><h3>可直接複製</h3></div><CopyBlock value={role.prompt} label="複製 Prompt" /></div>
          </div>
        </details>)}
      </div>
    </section>
    <Notice tone="warning" title="D 的硬性停止線">一旦看到 conflict、rebase、reset、detached HEAD、不明 staged files 或不確定的 Git 提示，停止操作並找 Integration Owner；不要叫 Agent 猜。</Notice>
  </>
}
