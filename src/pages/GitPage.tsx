import { CopyBlock, Notice, PageIntro, SectionTitle } from '../components/Content'

type GitItem = { term: string; zh: string; does: string; when: string; example: string; command: string; decision: '繼續' | '小心' | '停止'; error: string }

const gitItems: GitItem[] = [
  { term: 'repository', zh: '專案倉庫', does: '保存程式碼、檔案與每一次 commit 歷史；本機與 GitHub 上各有一份。', when: '要開始一個受 Git 管理的專案，或確認目前連到哪個遠端。', example: '這個網站是一個 repository；實際比賽產品必須是另一個 repository。', command: `git rev-parse --show-toplevel\ngit remote -v`, decision: '停止', error: '若顯示的根目錄或 remote 不是預期專案，立刻停止，避免改錯 repository。' },
  { term: 'clone', zh: '複製整個倉庫', does: '從 GitHub 下載 repository、history 與預設 branch，並建立 remote origin。', when: '第一次把遠端專案帶到自己的電腦；同一位置只需一次。', example: '比賽開始前，每位成員 clone 公開或團隊授權的 repository。', command: `git clone <repository-url>\nSet-Location <repository-folder>\ngit status`, decision: '停止', error: '目標資料夾已存在、URL 不對或無權限時不要改名硬做，先確認正確位置與 repository。' },
  { term: 'status', zh: '查看現在狀態', does: '顯示所在 branch、已修改、staged、未追蹤與 conflict 檔案；不會改任何內容。', when: '每個 Git 動作前後都可以使用；不確定時第一個就跑它。', example: '準備換 branch 前，先確認沒有未完成修改。', command: `git status\ngit status --short --branch`, decision: '繼續', error: 'status 本身是安全的。看不懂輸出就保留畫面並詢問，不要用 reset 讓它「乾淨」。' },
  { term: 'branch', zh: '獨立工作線', does: '讓一個小任務與 main 分開開發，完成後再用 PR 合併。', when: '從最新 main 開始任何功能、修正、文件或測試工作。', example: '新增 loading state 使用 feature/loading-state；修空資料用 fix/empty-response。', command: `git switch main\ngit pull --ff-only origin main\ngit switch -c feature/<short-name>`, decision: '停止', error: 'branch 已存在、main 不乾淨或起點不明時停止。不要覆蓋同名 branch。' },
  { term: 'add', zh: '放入待提交區', does: '把指定檔案目前的變更放進 staging area，準備下一個 commit；不會上傳。', when: 'review 完 diff，確定哪些檔案屬於同一小任務之後。', example: '只把 LoadingState.tsx 與對應測試加入 staged。', command: `git add src/features/result/LoadingState.tsx\ngit diff --cached --stat\ngit diff --cached`, decision: '小心', error: '若 staged 出現不明檔案，使用 git restore --staged <file> 只取消 stage，再找 owner；不要直接刪檔。' },
  { term: 'commit', zh: '建立本機存檔點', does: '把 staged 變更與訊息記錄成一個不可變的歷史節點。', when: '一個小任務完成、已測試且 staged diff 已 review。', example: 'feat: add loading state；fix: handle empty response；test: cover invalid input。', command: `git diff --cached\ngit commit -m "feat: add loading state"\ngit status`, decision: '小心', error: 'commit 失敗時先讀 hook／lint 訊息並修原因；不要用 --no-verify 跳過保護。' },
  { term: 'push', zh: '上傳自己的 branch', does: '把本機 commit 發到 GitHub 的同名 branch，供 PR、CI 與隊友查看。', when: 'commit 完成並確認 branch 名稱正確後。', example: '第一次 push feature/loading-state 時建立 upstream。', command: `git branch --show-current\ngit push -u origin feature/loading-state`, decision: '停止', error: '遠端拒絕或已有不同 history 時停止。絕對不要改用 --force。' },
  { term: 'pull', zh: '抓取並整合遠端更新', does: '通常等於 fetch 加上把遠端變更整合進目前 branch。使用 --ff-only 可避免意外產生 merge commit。', when: '更新乾淨的 main；確認沒有本機未提交修改。', example: '每輪開始與 merge 後同步 main。', command: `git status\ngit switch main\ngit pull --ff-only origin main`, decision: '停止', error: '顯示 divergent、conflict 或不是 fast-forward 就停。D 找 Integration Owner。' },
  { term: 'fetch', zh: '只下載遠端資訊', does: '更新你對遠端 branch／commit 的認知，不修改目前工作檔案。', when: '想先看遠端發生什麼，還不想整合。', example: 'review 前更新 origin，再比較自己 branch 與 main。', command: `git fetch origin\ngit log --oneline --decorate --max-count=10 origin/main`, decision: '繼續', error: 'fetch 是安全唯讀更新；驗證失敗通常是網路或權限，處理前不要換 remote URL。' },
  { term: 'Pull Request', zh: '請求審查與合併', does: '在 GitHub 呈現 branch 與 main 的差異、CI、討論與 approval；不是 Git 指令本身。', when: '小任務完成、push 後，邀請不同成員交叉 review。', example: 'B 開 loading state PR，A review UI 邏輯，Integration Owner 確認不影響 shared interface。', command: `gh pr create --base main --head feature/<short-name>\ngh pr diff\ngh pr checks`, decision: '小心', error: 'base／head 選錯、夾帶多任務或 checks 失敗時先修正，不要 merge。' },
  { term: 'merge', zh: '合併工作線', does: '把已 review 的 branch 變更加入 main。團隊可用 squash 讓一個 PR 對應一個 commit。', when: 'PR 已 approval、CI 綠燈、無 conflict，且 Integration Owner 同意整合時機。', example: 'checkpoint 逐一合併小 PR，每合一個就驗證 main。', command: `gh pr checks\ngh pr merge --squash --delete-branch`, decision: '停止', error: '任何 check 紅燈或 conflict 都先停止；Agent 不得自行 merge。' },
  { term: 'conflict', zh: '同一處無法自動判斷', does: '兩條工作線改到相同或相關內容，Git 無法決定哪一邊才對。它需要語意判斷。', when: 'pull、merge 或 rebase 時可能出現；不是靠猜測刪掉標記。', example: 'P1 與 P2 同時改 shared response type，必須由兩位 owner 與 Integration Owner 對齊。', command: `git status\ngit diff --name-only --diff-filter=U`, decision: '停止', error: '保留現場、不要 add／commit／reset。D 立即找 Integration Owner；原作者共同決定正確內容。' },
  { term: 'stash', zh: '暫存未完成修改', does: '把工作樹修改暫時收起來，之後可還原；容易忘記或在還原時產生 conflict。', when: '只有在清楚知道要暫停什麼、Integration Owner 同意且先記錄內容時。', example: '緊急切換去驗證 main，但目前小任務尚未能 commit。', command: `git status\ngit stash push -u -m "WIP: <task>"\ngit stash list\n# 還原前先確認 branch\ngit stash pop`, decision: '停止', error: '新手不要自行 stash。pop conflict 或 stash 內容不明時停止，別 drop。' },
  { term: 'restore', zh: '還原檔案或取消 stage', does: '可取消 staging，也可丟棄工作檔案變更；後者可能無法復原。', when: '最安全用法是只取消 stage；丟棄內容前必須確認那是自己不要的修改。', example: '不小心 add 了 README，只將它移出 staged。', command: `git restore --staged README.md\ngit status\n# 不要隨意執行：git restore <file>`, decision: '停止', error: '要使用不帶 --staged 的 restore 前先看 diff 並詢問；它會丟棄未 commit 內容。' },
  { term: 'reset', zh: '移動歷史／重設狀態', does: '依參數可能取消 commit、改 staging，甚至刪掉未提交修改。--hard 風險最高。', when: 'Hackathon 新手流程不需要自行使用；交由 Integration Owner 在確認備份與影響後處理。', example: '發現 commit 放錯 branch 時，先停下說明，不要自行 reset。', command: `# 安全地先提供資訊，不執行 reset\ngit status\ngit log --oneline --decorate --max-count=8`, decision: '停止', error: 'D 看到 reset 建議必須停止。Agent 不得 reset 他人工作或用 --hard 清理狀態。' },
  { term: 'force push', zh: '強制改寫遠端歷史', does: '讓遠端 branch 接受不相容 history，可能讓隊友 commit 消失或 PR 失真。', when: '本團隊 Hackathon 流程禁止讓 Agent 或新手使用；main 永遠禁止。', example: 'push 被拒絕不是改用 --force 的理由，而是 branch history 需要人類確認。', command: `# 禁止：git push --force\n# 禁止：git push -f\n# 改做：git status; git log; 找 Integration Owner`, decision: '停止', error: '看到 non-fast-forward 就保留訊息、停止操作。不要嘗試 --force-with-lease 來繞過規則。' },
]

export function GitPage() {
  return <>
    <PageIntro kicker="GIT FOR BEGINNERS" title="Git 不是魔法，是有順序的存檔系統。" description="先看 status、只在自己的 branch 工作、review staged diff，再 commit 與 push。看不懂時，保留現場比亂下指令更有價值。" aside={<div className="traffic-legend"><span className="go">繼續</span><span className="care">小心</span><span className="halt">停止</span></div>} />
    <Notice title="最安全的第一個指令"><code>git status</code> 只會讀取狀態，不會修改檔案。遇到不明狀況先跑它，貼完整輸出給 Integration Owner。</Notice>
    <section className="section-block content-section">
      <SectionTitle kicker="GLOSSARY + OPERATIONS" title="Git 功能逐項說明" description="每一項都有用途、使用時機、情境、PowerShell 範例，以及出錯時的決策。" />
      <div className="git-grid">
        {gitItems.map((item, index) => <details className="git-item" key={item.term} open={index === 0}>
          <summary><span className="git-term"><code>{item.term}</code><small>{item.zh}</small></span><span className={`decision ${item.decision}`}>{item.decision}</span><b aria-hidden="true">＋</b></summary>
          <div className="git-body">
            <div className="git-explain"><section><h3>它做什麼</h3><p>{item.does}</p></section><section><h3>什麼時候用</h3><p>{item.when}</p></section><section><h3>範例情境</h3><p>{item.example}</p></section></div>
            <CopyBlock value={item.command} label="複製 PowerShell" />
            <div className={`error-decision ${item.decision}`}><b>出錯時：{item.decision}</b><span>{item.error}</span></div>
          </div>
        </details>)}
      </div>
    </section>
    <section className="section-block commit-section">
      <SectionTitle kicker="NAMING RULES" title="Branch 與 commit 的共同語言" description="名稱短、意圖單一，讓隊友不用打開 diff 就先知道這次變更是什麼。" />
      <div className="naming-grid"><article><h3>Branch</h3><CopyBlock value={`feature/<short-name>\nfix/<short-name>\ndocs/<short-name>`} label="複製範例" /></article><article><h3>Commit</h3><CopyBlock value={`feat: add loading state\nfix: handle empty response\ndocs: clarify Git workflow\ntest: cover invalid input`} label="複製範例" /></article></div>
    </section>
    <Notice tone="warning" title="D 的停止清單">conflict、rebase、reset、force push、detached HEAD、stash pop conflict 或任何不明 Git 狀態：停止並找 Integration Owner。</Notice>
  </>
}
