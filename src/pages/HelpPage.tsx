import { useMemo, useState } from 'react'
import { CopyBlock, PageIntro } from '../components/Content'

type IssueKey = 'unknown' | 'conflict' | 'push' | 'lost' | 'secret' | 'build'

const issues: Record<IssueKey, { label: string; sign: string; action: string; owner: string; prompt: string }> = {
  unknown: { label: '看不懂 Git 狀態', sign: 'status 顯示陌生檔案、訊息或 branch', action: '不要改動，先讓 AI 做唯讀檢查。', owner: 'Integration Owner', prompt: '我看不懂目前 Git 狀態。請保留現場，只執行唯讀檢查並用新手能懂的方式解釋。' },
  conflict: { label: '出現 conflict', sign: '看到 CONFLICT、both modified 或 unmerged paths', action: '停止 merge／rebase，不要自行選擇要保留哪一版。', owner: 'Integration Owner + 檔案 Owner', prompt: '我遇到 merge conflict。請不要解 conflict，也不要 reset 或 rebase。只列出衝突檔案、可能涉及的 owner 與需要人工決定的內容。' },
  push: { label: 'Push 被拒絕', sign: '看到 rejected、non-fast-forward 或遠端已有更新', action: '不要 force push；保留訊息並確認 remote branch。', owner: 'Integration Owner', prompt: '我的 git push 被拒絕。請不要 force push。只讀取目前 branch、remote 與 log，解釋原因並整理給 Integration Owner 的資訊。' },
  lost: { label: '擔心修改不見了', sign: '找不到剛才的程式碼或切換 branch 後內容不同', action: '不要 reset、restore、clean 或刪除檔案。', owner: 'Integration Owner', prompt: '我擔心修改不見了。請不要執行任何刪除或還原操作。只讀取 git status、branch、log 與 reflog，告訴我可能在哪裡。' },
  secret: { label: '可能放入 Secret', sign: '檔案、diff 或 log 出現 key、token、password', action: '停止 commit／push，不要複製或顯示完整值。', owner: 'Integration Owner + 憑證 Owner', prompt: '可能有 secret 出現在專案中。請停止 commit 與 push，不要顯示完整值。只確認檔名、追蹤狀態與是否可能已推送，並列出通知與撤銷步驟。' },
  build: { label: '測試或 Build 失敗', sign: 'lint、typecheck、test 或 build 出現錯誤', action: '保留完整錯誤，只修與本任務直接相關的原因。', owner: '任務 Owner；必要時找 P1／P2', prompt: '檢查失敗了。請先解釋錯誤與可能原因，不要修改任務外程式碼。列出最小修正方案與會動到的檔案，等我確認後再修。' },
}

export function HelpPage() {
  const [issueKey, setIssueKey] = useState<IssueKey>('unknown')
  const issue = issues[issueKey]
  const prompt = useMemo(() => `${issue.prompt}\n\n請用繁體中文回報：\n1. 現在發生什麼事\n2. 我的修改是否還安全\n3. 哪些操作絕對不要做\n4. 要交給 ${issue.owner} 的資訊`, [issue])
  return <>
    <PageIntro kicker="KEEP THE SCENE" title="不確定，就先不要動。" description="保留畫面與錯誤訊息，比猜一個 Git 指令更安全。選擇最接近的狀況，把產生的 Prompt 交給 AI。" aside={<><span className="status-chip amber">STOP FIRST</span><span className="status-chip">READ ONLY</span></>} />
    <section className="help-workspace">
      <div className="issue-picker"><p className="picker-label"><span>1</span>你看到什麼？</p>{(Object.entries(issues) as [IssueKey, typeof issues[IssueKey]][]).map(([key, item]) => <button key={key} type="button" className={issueKey === key ? 'active' : ''} aria-pressed={issueKey === key} onClick={() => setIssueKey(key)}><strong>{item.label}</strong><small>{item.sign}</small><b aria-hidden="true">→</b></button>)}</div>
      <aside className="rescue-card" aria-live="polite">
        <div className="rescue-status"><span>現在先做</span><strong>STOP · 保留現場</strong></div>
        <h2>{issue.label}</h2><p>{issue.action}</p>
        <div className="do-not-run"><span>不要執行</span><code>reset</code><code>rebase</code><code>force push</code><code>clean</code></div>
        <CopyBlock value={prompt} label="複製求救 Prompt" />
        <div className="ask-owner"><span>接著找誰</span><strong>{issue.owner}</strong></div>
      </aside>
    </section>
    <section className="evidence-guide"><div><p className="eyebrow">交給隊友的資訊</p><h2>截圖前先遮住敏感資料</h2></div><ol><li><span>01</span><p>你原本想做什麼</p></li><li><span>02</span><p>最後一個成功步驟</p></li><li><span>03</span><p>完整錯誤訊息，但遮住 key、token、帳號與 private URL</p></li><li><span>04</span><p>AI 的唯讀診斷摘要</p></li></ol></section>
  </>
}
