# Career-Ops Repository Map & Developer Handbook

**Document Purpose**: Developer reference guide for navigating, understanding, and extending the **Career-Ops** codebase.  
**Scope**: Factual documentation of current directories, modules, exports, dependencies, flow diagrams, and recommended developer learning order.  

---

## Directory Reference

### 1. `lib/`
- **Purpose**: Core application logic, domain policies, runner engines, background queue, scheduling, security, and analytics.
- **Responsibilities**:
  - Encapsulates domain logic (`ApplicationModeConfig`).
  - Manages browser automation runner (`AutonomousRunner`).
  - Implements session recovery dumps and state loading (`SessionManager`).
  - Dispatches multi-channel alerts (`NotificationService`).
  - Enforces AES-256-GCM encryption and audit logging (`Vault`).
  - Provides background task queues (`JobQueueService`) and periodic execution (`AutonomousScheduler`).
  - Evaluates candidate match scoring and question answering (`AiEnhancer`, `CoverLetterEngine`, `LearningEngine`, `AnalyticsEngine`).
- **Public API**:
  - `ApplicationModeConfig`, `APPLICATION_MODES`
  - `AutonomousRunner`
  - `SessionManager`
  - `NotificationService`
  - `Vault`
  - `JobQueueService`
  - `AutonomousScheduler`
  - `AiEnhancer`, `CoverLetterEngine`, `LearningEngine`, `AnalyticsEngine`
- **Who Calls It**: `web/src/app/api/autonomous/route.ts`, `openrouter-runner.mjs`, CLI utilities, test suites (`tests/*.test.mjs`).
- **What It Depends On**: `playwright`, `providers/_registry.mjs`, Node.js native `crypto`, `fs`, `https`, `http`, `path`.
- **Execution Flow**: Called by CLI scripts or web API routes to orchestrate evaluation, form filling, auto-submission, session dumping, and notifications.

---

### 2. `providers/`
- **Purpose**: ATS scrapers and form automation drivers for company career portals.
- **Responsibilities**:
  - Defines the abstract provider lifecycle interface (`BaseProvider`).
  - Discovers open jobs from public JSON APIs zero-token style.
  - Extracts form field schemas.
  - Pre-fills candidate profile data into form inputs.
  - Submits job applications autonomously via Playwright.
- **Public API**:
  - `BaseProvider` class (`providers/_base.mjs`).
  - `loadProviders()`, `resolveProvider()` (`providers/_registry.mjs`).
  - Provider instances (e.g. `GreenhouseProvider`, `LeverProvider`).
- **Who Calls It**: `scan.mjs`, `scan-ats-full.mjs`, `verify-portals.mjs`, `lib/engine/AutonomousRunner.mjs`.
- **What It Depends On**: `providers/_http.mjs`, `providers/_trust-validator.mjs`, `providers/_types.js`, `playwright`.
- **Execution Flow**: Registry loads provider modules -> resolves provider by URL or ID -> calls `fetch()` for discovery or `prefillForm()` / `submitForm()` for application submission.

---

### 3. `plugins/`
- **Purpose**: External integrations for third-party tools (Apify scrapers, Notion database mirrors, Gmail lead ingest).
- **Responsibilities**:
  - Handles external API integrations isolated from core zero-token scrapers.
  - Manages plugin trust validation and consent pinning (`plugins/_lock.mjs`, `plugins/_engine.mjs`).
- **Public API**: `plugins.mjs` CLI tool, plugin engine `mergeProviderPlugins()`.
- **Who Calls It**: `scan.mjs`, `plugins.mjs`.
- **What It Depends On**: `js-yaml`, external HTTP APIs (Apify REST, Notion API, Gmail OAuth).

---

### 4. `web/`
- **Purpose**: Next.js 16 web control plane and visual application dashboard.
- **Responsibilities**:
  - Provides a modern React 19 interface for tracking applications, viewing analytics, toggling active modes, and triggering autonomous runs.
  - Exposes REST API gateways (`web/src/app/api/autonomous/route.ts`, `web/src/app/api/status/route.ts`).
- **Public API**: Next.js Route Handlers (`GET /api/autonomous`, `POST /api/autonomous`, `POST /api/status`).
- **Who Calls It**: End-user web browser.
- **What It Depends On**: `next`, `react`, `tailwind-merge`, `lucide-react`, `lib/engine/AutonomousRunner.mjs`.

---

### 5. `dashboard/`
- **Purpose**: Terminal User Interface (TUI) dashboard built in Go.
- **Responsibilities**:
  - Displays pipeline status, application metrics, and report details directly inside terminal environments.
- **Public API**: Standalone CLI executable compiled from `dashboard/main.go`.
- **Who Calls It**: User terminal invocation (`npm run serve:dashboard` / `go run .`).
- **What It Depends On**: Go 1.23, Bubbletea TUI framework (`github.com/charmbracelet/bubbletea`).

---

### 6. `config/`
- **Purpose**: System and candidate configuration templates.
- **Responsibilities**:
  - Stores candidate identity, target job titles, comp expectations (`config/profile.example.yml`).
  - Configures target company career page URLs (`portals.yml`).
  - Defines fact-checking rules (`config/cv-facts.example.json`) and plugin toggles (`config/plugins.example.yml`).
- **Who Calls It**: `scan.mjs`, `generate-pdf.mjs`, `openrouter-runner.mjs`, `prepare-application.mjs`.

---

### 7. `data/`
- **Purpose**: User layer application state, persistent database, logs, and session dumps.
- **Responsibilities**:
  - Canonical Markdown application table (`data/applications.md`).
  - Unprocessed URL inbox (`data/pipeline.md`).
  - Derived SQLite query index database (`data/applications.db`).
  - TSV ledgers (`data/status-log.tsv`, `data/scan-history.tsv`, `data/audit-log.tsv`).
  - Browser session dumps (`data/sessions/*.json`) and screenshots (`data/screenshots/*.png`).
- **Who Calls It**: `tracker.mjs`, `set-status.mjs`, `SessionManager.mjs`, `Vault.mjs`.

---

### 8. `modes/`
- **Purpose**: Prompt engineering as code instructions for AI CLI agents.
- **Responsibilities**:
  - `modes/_shared.md`: Core 1-5 scoring rules, posting legitimacy heuristics, and global constraints.
  - `modes/oferta.md`: Detailed A-G evaluation instructions.
  - `modes/apply.md` / `modes/auto-pipeline.md`: Form answering and pipeline workflow instructions.
- **Who Calls It**: Claude Code CLI, OpenCode CLI, Antigravity CLI, `openrouter-runner.mjs`, `gemini-eval.mjs`.

---

### 9. Root Utility Scripts (`*.mjs`)
- **Purpose**: Dedicated single-purpose CLI utilities.
- **Key Modules**:
  - `scan.mjs`: Zero-token ATS job discovery CLI.
  - `tracker.mjs`: Markdown table sync and SQLite derived index query tool.
  - `generate-pdf.mjs`: Playwright Chromium HTML/LaTeX to PDF compiler.
  - `openrouter-runner.mjs`: Standalone multi-model LLM runner.
  - `prepare-application.mjs`: Field mapping and prefill summary generator.
  - `browser-extract.mjs`: Headless Playwright DOM text extractor.
  - `update-system.mjs`: System auto-updater preserving user data contract.

---

### 10. `tests/`
- **Purpose**: Node.js test runner unit and integration test suites.
- **Key Test Files**:
  - `tests/autonomous-engine.test.mjs`
  - `tests/ai-enhancer.test.mjs`
  - `tests/analytics-engine.test.mjs`
  - `tests/job-queue.test.mjs`
  - `tests/vault-security.test.mjs`
  - `tests/autonomous-scheduler.test.mjs`
  - `tests/cover-letter-engine.test.mjs`
  - `tests/learning-engine.test.mjs`

---

## Important File Inventory

| File Path | Purpose | Main Exports / Functions | Used By | Calls Into |
| :--- | :--- | :--- | :--- | :--- |
| `lib/engine/AutonomousRunner.mjs` | Form fill & auto-submission orchestrator | `AutonomousRunner`, `runApplication()` | `web/src/app/api/autonomous/route.ts`, `AutonomousScheduler` | `playwright`, `providers/_registry.mjs`, `SessionManager`, `Vault` |
| `lib/domain/ApplicationMode.mjs` | Execution modes & 9-point submission policy | `ApplicationModeConfig`, `verifyAutoSubmissionPolicy()` | `AutonomousRunner`, unit tests | None |
| `providers/_base.mjs` | Abstract base class for ATS provider plugins | `BaseProvider` (`detect`, `fetch`, `prefillForm`, `submitForm`) | `providers/greenhouse/index.mjs`, `providers/lever/index.mjs` | None |
| `providers/_registry.mjs` | Dynamic provider discovery and routing loader | `loadProviders()`, `resolveProvider()` | `scan.mjs`, `AutonomousRunner` | Provider `.mjs` modules |
| `lib/services/SessionManager.mjs` | HITL session dump & state persistence | `SessionManager`, `saveSession()`, `restoreContext()` | `AutonomousRunner`, Next API route | `playwright`, `node:fs` |
| `lib/services/NotificationService.mjs` | Multi-channel event dispatcher | `NotificationService`, `notify()` | `AutonomousRunner`, `AutonomousScheduler` | `node:https`, `node:http` |
| `lib/security/Vault.mjs` | AES-256-GCM encryption & audit logging | `Vault`, `encrypt()`, `decrypt()`, `logAudit()` | `AutonomousRunner` | `node:crypto`, `data/audit-log.tsv` |
| `lib/queue/JobQueueService.mjs` | Background job queue with retries & dedup | `JobQueueService`, `enqueue()`, `processNext()` | `AutonomousScheduler` | `data/queue.json` |
| `lib/scheduler/AutonomousScheduler.mjs` | Recurring background interval worker | `AutonomousScheduler`, `start()`, `executePipelineRun()` | CLI runner, unit tests | `AutonomousRunner`, `JobQueueService` |
| `generate-pdf.mjs` | Playwright Chromium HTML/LaTeX PDF renderer | `normalizeTextForATS()` | `package.json` script `npm run pdf` | `playwright`, `build-cv-html.mjs` |
| `tracker.mjs` | Markdown sync & native SQLite index builder | `loadSqlite()`, CLI commands | `package.json` script `npm run tracker` | `node:sqlite`, `data/applications.md` |

---

## Architecture Flow Diagrams

### 1. Job Discovery Flow
```
User / Scheduler -> scan.mjs -> providers/_registry.mjs
                        │
                        ▼
               Load provider modules
                        │
                        ▼
           Public ATS JSON API Fetch (Zero-Token)
                        │
                        ▼
     Title Keyword Filter + data/blacklist.md Check
                        │
                        ▼
      SimHash JD Deduplication (fingerprint-core.mjs)
                        │
                        ▼
            Append to data/pipeline.md
```

### 2. AI Evaluation Flow
```
JD Text / URL -> check-liveness.mjs -> Read cv.md & config/profile.yml
                     │
                     ▼
       Load Prompt: modes/oferta.md + modes/_shared.md
                     │
                     ▼
    Call LLM (Gemini SDK / OpenRouter API / OpenAI / Ollama)
                     │
                     ▼
    Parse Score (1.0-5.0), A-G Blocks, Salary Gap, STAR Story
                     │
                     ▼
       Write Report: reports/NNN-{company}-{date}.md
```

### 3. Resume Generation Flow
```
cv.md + config/profile.yml -> build-cv-html.mjs / build-cv-latex.mjs
                                    │
                                    ▼
                     ATS Unicode Sanitization (normalizeTextForATS)
                                    │
                                    ▼
                      Section Order Verification Guard
                                    │
                                    ▼
                     Playwright Chromium Headless Render
                                    │
                                    ▼
                         Save output/<cv>.pdf
```

### 4. Browser Automation Flow
```
AutonomousRunner -> Launch Playwright Chromium
                         │
                         ▼
             Navigate to Job Apply URL
                         │
                         ▼
        Check Security Challenge / CAPTCHA / 2FA / Login
            ├── (Challenge Found) -> Dump Session -> PAUSED -> Alert
            └── (Clean) ---------> Continue
                         │
                         ▼
         Provider.prefillForm(page, profile, answers)
                         │
                         ▼
               Upload output/<cv>.pdf
```

### 5. Autonomous Runner Flow
```
AutonomousRunner.runApplication(job, profile)
                     │
                     ▼
        Check Active Application Mode
   ├── MANUAL ------> Output prefill summary -> Stop
   ├── ASSISTED ----> Prefill form -> Pause for review -> Stop
   └── AUTONOMOUS --> Verify 9-Point Auto Submit Policy
                           ├── (Policy Passed) -> Provider.submitForm() -> Post Screenshot
                           └── (Policy Failed) -> Trigger HITL Pause -> Save Session
```

### 6. Scheduler Flow
```
AutonomousScheduler.start() -> Set setInterval(intervalMs)
                                     │
                                     ▼
                        executePipelineRun()
                                     │
                                     ▼
                JobQueueService.enqueue('AUTONOMOUS_CYCLE')
                                     │
                                     ▼
                        Run Discovery -> Evaluate -> Apply
```

### 7. Notification Flow
```
Event Triggered -> NotificationService.notify(event)
                         │
                         ├──────> Discord Webhook (JSON Embed)
                         ├──────> Slack Webhook (JSON Block)
                         ├──────> Telegram Bot API (sendMessage)
                         └──────> Email / Desktop Alert
```

### 8. Analytics Flow
```
AnalyticsEngine.computeMetrics() -> Read data/applications.md
                                          │
                                          ▼
                      Parse Rows (Status, Date, Company, Score)
                                          │
                                          ▼
            Compute Conversion Rates (Applied -> Interview -> Offer)
                                          │
                                          ▼
                         Feed Next.js Web Dashboard Charts
```

---

# Learning Order

For a new developer onboarding to this codebase, read the files in the following exact sequence:

1. **[README.md](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/README.md)** — Project overview, architecture principles, local-first philosophy.
2. **[DATA_CONTRACT.md](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/DATA_CONTRACT.md)** — Strict System vs User file boundary rules.
3. **[ARCHITECTURE.md](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/ARCHITECTURE.md)** — Core component map and data flow overview.
4. **[providers/_base.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/providers/_base.mjs)** — Abstract `BaseProvider` class and lifecycle contract.
5. **[providers/_registry.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/providers/_registry.mjs)** — Modular provider discovery and router logic.
6. **[providers/greenhouse/index.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/providers/greenhouse/index.mjs)** — Example concrete provider implementation.
7. **[scan.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/scan.mjs)** — Zero-token job discovery CLI scanner.
8. **[lib/domain/ApplicationMode.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/lib/domain/ApplicationMode.mjs)** — Execution modes and 9-point Auto Submission Policy rules.
9. **[lib/services/SessionManager.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/lib/services/SessionManager.mjs)** — Browser state dumps and Human-in-the-loop pause protocol.
10. **[lib/services/NotificationService.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/lib/services/NotificationService.mjs)** — Multi-channel notification dispatcher.
11. **[lib/security/Vault.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/lib/security/Vault.mjs)** — Secret encryption and security audit logging.
12. **[lib/engine/AutonomousRunner.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/lib/engine/AutonomousRunner.mjs)** — Core Playwright automation and submission orchestrator.
13. **[tracker.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/tracker.mjs)** — Derived SQLite query index sync.
14. **[web/src/app/api/autonomous/route.ts](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/web/src/app/api/autonomous/route.ts)** — Next.js control plane API gateway.
15. **[tests/autonomous-engine.test.mjs](file:///d:/Personal%20Projects/Github%20saas%20Ai%20job/career-ops/tests/autonomous-engine.test.mjs)** — Core test suite demonstrating full execution flow.
