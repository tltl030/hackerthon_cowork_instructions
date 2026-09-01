# AGENTS.md

## Purpose and public boundary

This repository contains only the public, generic website **一天 Hackathon 多人 AI Agent 協作指南**. It is not the Hackathon product repository.

- Do not add unpublished challenge details, proposed product directions, product source code, private architecture, customer data, private URLs, credentials, or account information.
- Do not copy content from private repositories or local private workspaces.
- Assume every tracked file, issue, PR, Actions log, and deployed page is public.
- Use Traditional Chinese for site UI and guidance. Git commands and technical terms may remain in English.

## Working rules

- Never develop directly on `main`.
- One small task maps to one branch and one small PR.
- Use `feature/<short-name>`, `fix/<short-name>`, or `docs/<short-name>`.
- Keep commits focused. Examples: `feat: add loading state`, `fix: handle empty response`, `docs: clarify Git workflow`, `test: cover invalid input`.
- Read `git status`, `git diff`, and the staged diff before committing.
- Require cross-review before merge. Keep `main` buildable.
- Do not force push, rewrite history, reset another person's work, or guess at a merge conflict.
- A beginner who encounters conflict, rebase, reset, detached HEAD, or an unknown Git state must stop and ask the Integration Owner.

## Agent autonomy

Agents may read files, inspect Git state, make scoped edits for an assigned task, and run existing lint, typecheck, test, and build commands. Ask a human before:

- adding, removing, or upgrading dependencies;
- changing shared interfaces, schemas, configuration, CI, or deployment;
- deleting files or performing Git history operations;
- accessing external services, accounts, private data, or secrets;
- resolving conflicts, merging PRs, publishing, or changing repository settings.

## Security

- Never commit API keys, tokens, passwords, private URLs, real account identifiers, or customer data.
- Real local values belong in ignored `.env` files. A committed `.env.example` may contain names and clearly fake placeholders only.
- Do not print secrets in prompts, terminal output, screenshots, fixtures, or logs.
- Before every commit, inspect tracked and staged files and run a secret scan. If a secret may have been committed, stop, notify the owner, and rotate or revoke it; do not let an agent rewrite history autonomously.
- Do not run `npm audit fix --force`.

## Required checks

Before a PR or push that changes site behavior, run:

```powershell
npm run lint
npm run typecheck
npm run build
npm run verify
git diff --check
```

The GitHub Pages base path must remain `/hackerthon_cowork_instructions/`. Navigation uses hash routes so refreshing an information page does not return a Pages 404.
