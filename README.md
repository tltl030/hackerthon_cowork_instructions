# 一天 Hackathon 多人 AI Agent 協作指南

一個純靜態、公開的四人 Hackathon 協作指南。內容聚焦角色分工、Codex 任務邊界、Git 流程、公開安全與每 90 分鐘 integration checkpoint；不包含實際比賽題目或產品內容。

## 本機啟動

需求：Node.js 24 與 npm。

```powershell
git clone https://github.com/tltl030/hackerthon_cowork_instructions.git
Set-Location hackerthon_cowork_instructions
npm ci
npm run dev
```

Vite 會顯示本機網址。專案設定了 GitHub Pages base path，因此網址包含 `/hackerthon_cowork_instructions/`。

## 檢查

```powershell
npm run lint
npm run typecheck
npm run build
npm run verify
```

- `lint`：檢查 React／TypeScript 常見問題。
- `typecheck`：執行 TypeScript project build，不輸出檔案。
- `build`：建立 production `dist/`。
- `verify`：確認 base path、hash routes、內容標記與 build 靜態資源均存在。

## GitHub Pages 部署

`.github/workflows/pages.yml` 在 push 到 `main` 或手動觸發時執行：

1. `npm ci`
2. lint
3. typecheck
4. production build
5. build verification
6. upload Pages artifact
7. deploy GitHub Pages

Repository 的 **Settings → Pages → Build and deployment → Source** 必須設為 **GitHub Actions**。

公開網站：<https://tltl030.github.io/hackerthon_cowork_instructions/>

## AI 可讀版本

網站另外提供不依賴 JavaScript 的公開純文字入口：

- `llms.txt`：內容索引與各頁入口。
- `ai-guide.txt`：角色、流程、Prompt、Git 規則與安全邊界的完整摘要。

這讓只讀取原始 HTML、不執行 React 的 AI 也能取得網站主要內容。頁尾與 HTML metadata 都會連到純文字版本。

## 公開安全

此 repository 與網站是 Public：

- 不放 API key、token、password、private URL、帳號或客戶資料。
- 不放未公布題目、產品程式碼、私人架構或 private repository 內容。
- 真實環境值只能放在被忽略的 `.env`；`.env.example` 只能使用安全假值。
- commit 前檢查 `git status --short`、`git diff --cached` 與 secret scan 結果。
- 禁止 `force push`、擅自 `reset` 他人工作，或用猜測方式處理 conflict。

更多規則見 [AGENTS.md](./AGENTS.md)。
