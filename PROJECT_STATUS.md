# PROJECT STATUS

This document provides a factual, source-code-verified status audit of the **Career-Ops** repository.

---

## Implemented

### 1. Zero-Token Job Discovery & ATS Providers
- **Status**: ✅ Implemented
- **Evidence**: `loadProviders()` dynamically scans `providers/` and executes provider `fetch()` methods against public JSON APIs.
- **Files**: `scan.mjs`, `scan-ats-full.mjs`, `providers/_base.mjs`, `providers/_registry.mjs`, `providers/greenhouse/index.mjs`, `providers/lever/index.mjs`, `providers/ashby.mjs`
- **Complexity**: Low
- **Priority**: Critical
- **Dependencies**: `node:fetch`, `js-yaml`

### 2. Autonomous Application Runner & 9-Point Auto-Submit Policy
- **Status**: ✅ Implemented
- **Evidence**: `AutonomousRunner.runApplication()` executes Playwright form filling, validates 9-point policy (`verifyAutoSubmissionPolicy`), captures pre/post screenshots, and auto-submits.
- **Files**: `lib/domain/ApplicationMode.mjs`, `lib/engine/AutonomousRunner.mjs`
- **Complexity**: High
- **Priority**: Critical
- **Dependencies**: `playwright`, `providers/_base.mjs`

### 3. Session Recovery & Human-in-the-Loop Pause
- **Status**: ✅ Implemented
- **Evidence**: `SessionManager.saveSession()` serializes browser `storageState`, `localStorage`, `sessionStorage`, URL, and form field values to `data/sessions/*.json` on CAPTCHA/2FA pause.
- **Files**: `lib/services/SessionManager.mjs`
- **Complexity**: Medium
- **Priority**: High
- **Dependencies**: `playwright`, `node:fs`

### 4. Multi-Channel Notification Service
- **Status**: ✅ Implemented
- **Evidence**: `NotificationService.notify()` dispatches structured payloads to Discord, Telegram, Slack, Email, and Desktop channels.
- **Files**: `lib/services/NotificationService.mjs`
- **Complexity**: Low
- **Priority**: Medium
- **Dependencies**: `node:https`, `node:http`

### 5. Multi-Model AI Evaluators & Prompt System
- **Status**: ✅ Implemented
- **Evidence**: Standalone scripts execute `modes/oferta.md` prompts via Google Gemini, OpenRouter, OpenAI, and Ollama APIs.
- **Files**: `openrouter-runner.mjs`, `gemini-eval.mjs`, `openai-eval.mjs`, `ollama-eval.mjs`, `modes/_shared.md`, `modes/oferta.md`
- **Complexity**: Medium
- **Priority**: High
- **Dependencies**: `@google/generative-ai`, `dotenv`

### 6. Cover Letter & AI Intelligence Engines
- **Status**: ✅ Implemented
- **Evidence**: `CoverLetterEngine` generates short/long cover letters, recruiter emails, LinkedIn messages, and referral requests; `AiEnhancer` scores match and handles form question answering.
- **Files**: `lib/ai/CoverLetterEngine.mjs`, `lib/ai/AiEnhancer.mjs`, `generate-cover-letter.mjs`
- **Complexity**: Medium
- **Priority**: High
- **Dependencies**: None (pure ESM / regex / strings)

### 7. Resume Compilation & ATS Normalization
- **Status**: ✅ Implemented
- **Evidence**: `generate-pdf.mjs` renders HTML/LaTeX templates into PDFs via Playwright Chromium and normalizes problematic Unicode characters via `normalizeTextForATS`.
- **Files**: `generate-pdf.mjs`, `build-cv-html.mjs`, `build-cv-latex.mjs`, `generate-latex.mjs`
- **Complexity**: Medium
- **Priority**: High
- **Dependencies**: `playwright`

### 8. Application Tracking & Derived SQLite Query Index
- **Status**: ✅ Implemented
- **Evidence**: `data/applications.md` acts as canonical Markdown table; `tracker.mjs` syncs and queries the derived `data/applications.db` SQLite database using `node:sqlite`.
- **Files**: `data/applications.md`, `tracker.mjs`, `tracker-parse.mjs`, `set-status.mjs`
- **Complexity**: Medium
- **Priority**: Critical
- **Dependencies**: `node:sqlite`

### 9. Analytics Engine & Historical Learning
- **Status**: ✅ Implemented
- **Evidence**: `AnalyticsEngine` computes funnel conversion rates; `LearningEngine` identifies top-performing resume versions across historical application records.
- **Files**: `lib/analytics/AnalyticsEngine.mjs`, `lib/ai/LearningEngine.mjs`, `stats.mjs`, `funnel-velocity.mjs`
- **Complexity**: Medium
- **Priority**: Medium
- **Dependencies**: `node:fs`

### 10. Background Job Queue & Autonomous Scheduler
- **Status**: ✅ Implemented
- **Evidence**: `JobQueueService` handles concurrent retries and task deduplication; `AutonomousScheduler` triggers periodic background discovery cycles.
- **Files**: `lib/queue/JobQueueService.mjs`, `lib/scheduler/AutonomousScheduler.mjs`
- **Complexity**: High
- **Priority**: High
- **Dependencies**: `node:fs`

### 11. Security Vault & Audit Logging Ledger
- **Status**: ✅ Implemented
- **Evidence**: `Vault` encrypts keys using AES-256-GCM and logs immutable audit rows to `data/audit-log.tsv`.
- **Files**: `lib/security/Vault.mjs`
- **Complexity**: Medium
- **Priority**: Critical
- **Dependencies**: `node:crypto`

### 12. Web Control Plane & Go TUI Dashboards
- **Status**: ✅ Implemented
- **Evidence**: Next.js 16 web app (`web/`) and Go Bubbletea TUI (`dashboard/`) provide full visual monitoring and runner API gateways.
- **Files**: `web/package.json`, `web/src/app/`, `web/src/app/api/autonomous/route.ts`, `dashboard/main.go`
- **Complexity**: High
- **Priority**: Medium
- **Dependencies**: `next`, `react`, `go`

### 13. Docker Containers & CI/CD Pipeline
- **Status**: ✅ Implemented
- **Evidence**: Dockerfile with Jammy Playwright preinstalled, `docker-compose.yml` with host volume mounts, and `.github/workflows/ci.yml`.
- **Files**: `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`
- **Complexity**: Low
- **Priority**: Medium
- **Dependencies**: `docker`, `github-actions`

---

## Partially Implemented

### 1. Web Application User Authentication
- **Status**: ⚠ Partially Implemented
- **Evidence**: Web dashboard in `web/` reads local workspace files directly via server actions and API routes, but lacks multi-user authentication middleware (e.g. NextAuth/OAuth). Single-user local setup.
- **Files**: `web/src/app/api/`
- **Complexity**: Medium
- **Priority**: Low
- **Dependencies**: `next`

### 2. Auth-Gated ATS Portals
- **Status**: ⚠ Partially Implemented
- **Evidence**: Core providers cover no-auth public JSON endpoints; login-gated portals are handled via Playwright DOM automation (`AutonomousRunner`) or opt-in external plugins (`plugins/apify/`).
- **Files**: `providers/`, `plugins/apify/`
- **Complexity**: High
- **Priority**: Medium
- **Dependencies**: `playwright`, `plugins`

---

## Missing

### 1. User Authorization & Role-Based Permissions (RBAC)
- **Status**: ❌ Missing
- **Evidence**: No user roles, permission checks, or access control matrices exist in the codebase.
- **Files**: None
- **Complexity**: Medium
- **Priority**: Low
- **Dependencies**: Authentication service

### 2. Puppeteer Integration
- **Status**: ❌ Missing
- **Evidence**: `package.json` contains no Puppeteer dependency. Playwright Chromium is used exclusively.
- **Files**: `package.json`
- **Complexity**: Low
- **Priority**: N/A (Playwright is superior alternative)
- **Dependencies**: None
