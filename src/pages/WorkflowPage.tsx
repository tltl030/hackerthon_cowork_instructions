import { CopyBlock, List, Notice, PageIntro, SectionTitle } from '../components/Content'

const steps = [
  { title: '認領任務', owner: 'Human', why: '先把範圍、owner、驗收與碰撞檔案寫清楚。', command: `# 任務卡範例\nOwner: B\nTask: 結果頁 loading state\nFiles: src/features/result/*\nDone: loading 時顯示 skeleton；既有測試通過`, stop: '若兩人可能修改同一檔案，先由 Integration Owner 切界線。' },
  { title: '更新 main', owner: 'Human', why: '從團隊最新、可運作的版本開始。先確認目前沒有未完成修改。', command: `git status\ngit switch main\ngit pull --ff-only origin main\ngit status`, stop: 'status 不乾淨或 pull 不是 fast-forward：停止，不要 stash 或 reset 來硬過。' },
  { title: '建立 branch', owner: 'Human', why: '一個小任務一個 branch；branch 名稱說明工作類型與短名稱。', command: `git switch -c feature/loading-state\n# 其他例：fix/empty-response、docs/git-guide`, stop: '若 branch 已存在或起點不是 main，先確認 owner 與 commit 再繼續。' },
  { title: '開始使用 Codex', owner: 'Human + Agent', why: '先給 Agent 目標、範圍、禁止事項與驗收；先讀再改。', command: `先讀 AGENTS.md 與 src/features/result。\n只完成 loading state，不改 API contract 或 dependency。\n先回報最小計畫；我確認後再實作。\n完成後執行相關測試並摘要 diff。`, stop: 'Agent 建議跨模組重構、改 dependency 或 shared interface：先停下請 Integration Owner 判斷。' },
  { title: '修改與測試', owner: 'Human + Agent', why: '每次只完成一個可驗證切片；優先執行與變更最相關的檢查。', command: `npm run lint\nnpm run typecheck\nnpm run build`, stop: '檢查失敗要先讀錯誤。只修與本任務相關的原因；不要順手清理整個專案。' },
  { title: 'Review diff', owner: 'Human', why: 'Agent 產出的程式碼仍由人類負責；確認範圍、意圖與公開安全。', command: `git status --short\ngit diff --stat\ngit diff\ngit diff --check`, stop: '看到不認識的檔案、secret、lockfile 或超出範圍的修改：不要 add，先查清楚。' },
  { title: 'Commit', owner: 'Human', why: '只 stage 本任務檔案，讓 commit 保持單一目的。', command: `git add src/features/result/LoadingState.tsx\ngit diff --cached --stat\ngit diff --cached\ngit commit -m "feat: add loading state"`, stop: '不要使用 git add . 略過檢查。staged diff 不符合任務就先取消該檔 stage。' },
  { title: 'Push', owner: 'Human', why: '把 branch 發到遠端，讓團隊與 CI 可以看到。', command: `git push -u origin feature/loading-state`, stop: '遠端拒絕或顯示 branch 已由別人使用：停止；不得 force push。' },
  { title: 'Pull Request', owner: 'Human', why: '小 PR 提供變更目的、驗證證據、畫面與 reviewer 重點。', command: `gh pr create --base main --head feature/loading-state --title "feat: add loading state" --body "Summary: add result loading UI\nChecks: lint, typecheck, build\nRisk: visual only"`, stop: 'PR 夾帶其他任務或 diff 太大時，先拆小，不要請 reviewer 猜意圖。' },
  { title: 'Review', owner: 'Teammate', why: '至少一位不同成員交叉 review；關鍵介面由 Integration Owner 加看。', command: `gh pr diff\ngh pr checks`, stop: 'CI 紅燈、interface 不明、缺測試或 conflict：回到作者修正，不要直接 merge。' },
  { title: 'Merge', owner: 'Human', why: '確認 approval 與 checks 後 merge。偏好 squash，保留乾淨的任務歷史。', command: `gh pr merge --squash --delete-branch`, stop: '只能由團隊確認的 human 執行；Agent 不得自行 merge 或解 conflict。' },
  { title: 'Merge 後同步', owner: 'Everyone', why: '每個人回到乾淨 main，再更新自己的後續 branch；checkpoint 驗證 main。', command: `git switch main\ngit pull --ff-only origin main\nnpm run typecheck\nnpm run build`, stop: '自己 branch 與新 main 衝突時，先找 Integration Owner；D 不自行 rebase。' },
]

const examplePrompt = `你正在 feature/loading-state branch。\n\n請先讀 AGENTS.md、package.json、src/features/result 與相關測試。\n目標：當結果 API 尚未完成時，結果區顯示既有設計語言的 loading state。\n允許修改：src/features/result 內的元件與其測試。\n禁止：修改 API contract、shared types、package.json、lockfile、路由與其他頁面。\n驗收：loading=true 時可見；loading=false 時既有結果不變；鍵盤與螢幕閱讀器可理解；lint、typecheck、相關測試通過。\n先提出最多 4 步計畫，不要立即修改。若現況與描述不一致，停止並列出問題。`;

export function WorkflowPage() {
  return <>
    <PageIntro kicker="DELIVERY LOOP" title="從任務卡到 main，十二個小步驟。" description="不直接在 main 開發。一個小任務對應一個 branch、一個清楚 commit、一個可以快速交叉 review 的小 PR。" aside={<><span className="status-chip lime">SMALL PR</span><span className="status-chip">CROSS REVIEW</span><span className="status-chip amber">90 MIN SYNC</span></>} />
    <div className="principle-strip"><span>BRANCH</span><b>→</b><span>CODE + TEST</span><b>→</b><span>DIFF REVIEW</span><b>→</b><span>SMALL PR</span><b>→</b><span>MAIN</span></div>
    <section className="section-block content-section">
      <SectionTitle kicker="STANDARD OPERATING PROCEDURE" title="標準協作流程" description="每一步都標示停止線。出錯時先保留現場，不要用破壞性指令把訊息消掉。" />
      <ol className="workflow-list">
        {steps.map((step, index) => <li key={step.title} className="workflow-step">
          <div className="workflow-index">{String(index + 1).padStart(2, '0')}</div>
          <div className="workflow-content"><div className="workflow-title"><h3>{step.title}</h3><span>{step.owner}</span></div><p>{step.why}</p><CopyBlock value={step.command} label="複製指令／範例" /><div className="stop-line"><b>STOP LINE</b><span>{step.stop}</span></div></div>
        </li>)}
      </ol>
    </section>
    <section className="section-block scenario-section">
      <SectionTitle kicker="FULL EXAMPLE" title="完整情境：新增 loading state" description="B 認領一個低耦合 UI 任務；Integration Owner 確認檔案範圍不與核心功能碰撞。" />
      <div className="scenario-grid">
        <article><span className="scenario-tag">TASK CARD</span><h3>結果頁 loading state</h3><List items={['Owner：B', 'Branch：feature/loading-state', '範圍：結果區元件與測試', '驗收：loading 與非 loading 都可用', 'Reviewer：A 或 Integration Owner']} /></article>
        <article className="scenario-code"><span className="scenario-tag">POWERSHELL</span><CopyBlock value={`git switch main\ngit pull --ff-only origin main\ngit switch -c feature/loading-state\n# 使用 Codex 完成並檢查變更\nnpm run lint\nnpm run typecheck\nnpm run build\ngit diff --check\ngit add <本任務檔案>\ngit diff --cached\ngit commit -m "feat: add loading state"\ngit push -u origin feature/loading-state`} label="複製完整流程" /></article>
      </div>
      <div className="prompt-panel wide"><div><p className="eyebrow">CODEX PROMPT</p><h3>範例任務 Prompt</h3><p>把目標、範圍、禁止事項與可驗收結果一次說清楚。</p></div><CopyBlock value={examplePrompt} label="複製 Prompt" /></div>
    </section>
    <Notice tone="warning" title="Agent 的 Git 邊界">Agent 可以讀 status、diff、log，也可以在明確授權下 add／commit／push自己的 branch；不得自主 force push、reset 他人工作、改寫 history 或猜測式解 conflict。</Notice>
  </>
}
