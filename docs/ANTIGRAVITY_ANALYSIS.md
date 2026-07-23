# Antigravity AI Platform & Architecture Analysis — Research Report

**Document Status**: Final Technical Research Report  
**Target Path**: `docs/ANTIGRAVITY_ANALYSIS.md`  
**Scope**: Comprehensive Analysis of Antigravity Agentic Infrastructure & Career-Ops Autonomous Job Agent System  

---

## Executive Summary

This document presents a deep-dive research analysis of **Antigravity**, the Google DeepMind agentic AI coding environment and pair-programming architecture, alongside its integration with the **Career-Ops** autonomous AI job application engine. The research details product architecture, tech stack, AI workflows, browser automation, security, feature matrices, and actionable recommendations.

---

## 1. Product Overview

- **What Antigravity Is**: Antigravity is an advanced, state-aware agentic AI developer platform developed by Google DeepMind. It operates as an autonomous pair programmer and task orchestrator capable of reading file contexts, running commands, spawning subagents, performing headless browser automation, and maintaining reactive workflows.
- **Primary Purpose**: To automate complex multi-file engineering tasks, execute system refactoring, run continuous background jobs, perform intelligent job discovery and application processing, and enforce strict human-in-the-loop safety boundaries.
- **Target Audience**: Staff/Principal Software Engineers, AI Systems Architects, Technical Leads, and Autonomous Career Developers.
- **Main Workflow**:
  ```
  User Goal / Event -> System Context & Knowledge Ingestion -> Multi-Model Reasoning 
     -> Tool Execution (File/Command/Browser) -> Verification Gate -> Artifact & Log Output
  ```
- **Overall Philosophy**:
  1. **Local-First & Data Sovereignty**: All user identity, CVs, and application databases stay strictly on the local filesystem.
  2. **AI-Agnostic Elasticity**: Reasoning and scoring are decoupled from specific LLMs (supports Gemini, Claude, OpenAI, Ollama, OpenRouter).
  3. **Strict Human-in-the-Loop Oversight**: Automation operates autonomously when safe, but immediately enters a `PAUSED` state upon encountering security challenges (CAPTCHA, 2FA, OTP) or low confidence.

---

## 2. Tech Stack

| Layer | Technologies / Frameworks |
| :--- | :--- |
| **Frontend / Control Plane** | Next.js 16.2, React 19, Tailwind CSS 4, TypeScript 6, Lucide React icons, Go Bubbletea TUI (`dashboard/`) |
| **Backend & Engine** | Node.js (ESM, `>=22.5.0` for native `node:sqlite`), Express/Next API Routes, Go 1.23 |
| **Database & Storage** | Markdown canonical tables (`data/applications.md`), native `node:sqlite` derived query index (`data/applications.db`), TSV ledgers (`data/status-log.tsv`, `data/audit-log.tsv`) |
| **AI Models & Frameworks** | Gemini 3.6 Flash (High), Gemini 3.0 Pro, `@google/generative-ai` SDK, OpenRouter API auto-rotation, OpenAI API standard compatibility, Ollama local HTTP API |
| **Browser Automation** | Playwright Chromium (`1.61.1`) headless/headed automation, DOM tree snapshot extractions, WebP media recordings |
| **Queue & Scheduling** | `JobQueueService.mjs` (SQLite/disk backed), `AutonomousScheduler.mjs` (configurable cron/interval worker) |
| **Authentication & Security** | Scoped tool execution permissions (`ask_permission`), AES-256-GCM secret encryption (`Vault.mjs`), append-only audit logger |
| **DevOps & Containers** | Docker (`Dockerfile` based on `mcr.microsoft.com/playwright:v1.61.1-jammy`), `docker-compose.yml`, GitHub Actions CI (`.github/workflows/ci.yml`) |

---

## 3. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Presentation Layer                               │
│              (Next.js Control Plane, Terminal TUI, CLI Commands)            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / Events
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            Application Layer                                │
│       (AutonomousScheduler, AutonomousRunner, JobQueue, Notifier)           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Core Interfaces
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             Domain Layer                                    │
│        (ApplicationModePolicy, AiEnhancer, LearningEngine, Vault)           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Infrastructure
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                          Infrastructure Layer                               │
│     (Playwright Automation, ATS Provider Plugins, SQLite / Markdown Repo)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow & Workflows
1. **Job Search Workflow**: Zero-token scanner (`scan.mjs`) calls 60+ modular ATS providers (`providers/`), filters via positive/negative title keywords and `data/blacklist.md`, deduplicates via SimHash JDs (`fingerprint-core.mjs`), and appends to `data/pipeline.md`.
2. **AI Evaluation Workflow**: Evaluator reads `modes/oferta.md` + `modes/_shared.md` alongside `cv.md` to compute match score (1.0-5.0), missing skills, and salary gap estimates.
3. **Resume Workflow**: Candidate profile (`cv.md`, `config/profile.yml`) compiles via HTML builder (`build-cv-html.mjs`) or LaTeX builder (`build-cv-latex.mjs`), sanitizes Unicode characters for ATS compatibility (`normalizeTextForATS`), and renders to PDF via Playwright (`generate-pdf.mjs`).
4. **Browser Automation Workflow**: Playwright navigates to apply URL, pre-fills form fields via ATS provider (`prefillForm`), takes pre-submission screenshot, evaluates 9-point Auto-Submit Policy, and submits autonomously or enters `PAUSED` state.

---

## 4. Features Inventory

### Core Features
- Dual-Layer System/User Boundary (`DATA_CONTRACT.md`).
- Canonical Markdown tables with derived SQLite query index (`tracker.mjs`).
- Atomic file writes and report number reservation lock (`reserve-report-num.mjs`).

### AI Features
- Semantic resume matching & scoring engine (`AiEnhancer.mjs`).
- STAR story injection for form question auto-answering.
- Cover letter intelligence (`CoverLetterEngine.mjs`: short, long, recruiter email, LinkedIn, referral).
- Historical learning engine (`LearningEngine.mjs`).

### Automation Features
- Autonomous Runner (`AutonomousRunner.mjs`) supporting `Manual`, `Assisted`, and `Autonomous` modes.
- 9-point Auto-Submission Policy verification.
- Human-in-the-loop pause & resume state dumps (`SessionManager.mjs`).
- Pre- and post-submission full-page screenshots.

### Dashboard Features
- Next.js 16 Web Dashboard (`web/`) with live job kanban, runner controls, analytics, and session manager.
- Go Bubbletea Terminal UI (`dashboard/`).

### Analytics Features
- Funnel metrics (`Discovered -> Evaluated -> Applied -> Interview -> Offer`), response rates %, top companies, monthly trends (`AnalyticsEngine.mjs`).

### Security & Queue Features
- AES-256-GCM secret vault (`Vault.mjs`).
- Append-only audit logger (`data/audit-log.tsv`).
- Background job queue (`JobQueueService.mjs`).
- Autonomous scheduler (`AutonomousScheduler.mjs`).

---

## 5. Application Workflow

```
[1. Search / Discovery] ---> scan.mjs + providers/*.mjs -> data/pipeline.md
          │
[2. Liveness & Blacklist] -> liveness-api.mjs + data/blacklist.md check
          │
[3. AI Ranking & Score] ---> modes/oferta.md + AiEnhancer.mjs (1.0 - 5.0)
          │
[4. Resume & Cover] -------> generate-pdf.mjs + CoverLetterEngine.mjs
          │
[5. Form Prefill] ---------> Playwright + Provider.prefillForm()
          │
[6. Policy Check] ---------> 9-Point Auto-Submit Verification
       ├── (Pass) ---------> Provider.submitForm() -> Screenshot -> Tracker Sync
       └── (Fail / CAPTCHA)-> Save Session (cookies, form) -> PAUSED State -> User Alert
```

---

## 6. AI Features & Prompt Engineering

- **Prompt Engineering as Code**: Prompts reside in `modes/*.md`. `modes/_shared.md` acts as the shared scoring kernel.
- **Model Selection & Rotation**: Auto-rotates OpenRouter models, supports Google Gemini SDK (`gemini-eval.mjs`), OpenAI REST API (`openai-eval.mjs`), and local Ollama (`ollama-eval.mjs`).
- **Learning Loop**: `LearningEngine.mjs` analyzes past applications to determine which resume version and message style produce the highest interview conversion rate.

---

## 7. Automation Infrastructure

- **Browser**: Playwright Chromium headless/headed.
- **Form Filling**: Provider plugins (`providers/greenhouse/`, `lever/`, etc.) extract selectors and auto-fill candidate profile metadata.
- **Auto-Submission**: Executed only when all 9 policy conditions pass.
- **Failure Recovery**: On CAPTCHA, 2FA, OTP, or structural page changes, execution enters `PAUSED` state, dumps cookies/session/form values to `data/sessions/*.json`, and notifies the candidate.

---

## 8. Dashboard

- **Next.js Web Interface** (`web/`): Full React 19 visual dashboard featuring application kanban, real-time analytics graphs, runner control toggles, and live session recovery modal.
- **Go Terminal UI** (`dashboard/`): Compact TUI built with Bubbletea for terminal-native browsing of pipeline and evaluation reports.

---

## 9. Job Search Pipeline

- **Providers**: Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Breezy, Teamtailor, BambooHR, and 50+ custom portals.
- **Zero-Token Scrapers**: Hits public JSON APIs without consuming LLM tokens.
- **Filters & Deduplication**: Positive/negative title keywords in `config/profile.yml`, blacklist check, and SimHash JD fingerprinting (`fingerprint-core.mjs`).

---

## 10. Resume Management

- **Storage & Formats**: `cv.md` (canonical markdown source), `templates/` (HTML & LaTeX templates).
- **ATS Sanitization**: `normalizeTextForATS` strips non-standard Unicode characters (smart quotes, em-dashes).
- **Compilation**: `generate-pdf.mjs` via Playwright Chromium with section order validation.

---

## 11. Configuration Settings

| File | Purpose |
| :--- | :--- |
| `config/profile.yml` | Candidate identity, targets, salary expectations, title keywords |
| `portals.yml` | Target companies, career URLs, explicit ATS provider overrides |
| `config/cv-facts.json` | Fact-checking allowlist and forbidden phrases |
| `config/plugins.yml` | Opt-in plugin enablement toggles |
| `.env` | Encrypted keys (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `VAULT_KEY`) |

---

## 12. Notification System

Supported channels via `NotificationService.mjs`:
- **Discord Webhooks**
- **Telegram Bot API**
- **Slack Webhooks**
- **SMTP / HTTP Email**
- **Desktop Notifications**

Payloads contain: Company, Role, Reason, Score, Screenshot, Job URL, and Suggested Actions.

---

## 13. Strengths

1. **Strict Data Sovereignty**: 100% local-first data storage.
2. **Zero-Token Discovery Efficiency**: High-speed public ATS API scanning without LLM costs.
3. **Robust Auto-Submit Policy**: 9-point verification ensures zero rogue submissions.
4. **Resilient Session Recovery**: Complete browser state serialization (`cookies`, `localStorage`, form state) on HITL pause.
5. **Multi-Model Elasticity**: Instant fallback between OpenRouter, Gemini, OpenAI, and Ollama.

---

## 14. Weaknesses & Limitations

1. **Headless Browser Resource Usage**: Playwright Chromium renders consume memory during parallel job processing.
2. **Free-Tier API Rate Limits**: High-volume evaluations can trigger free-tier LLM rate limits (mitigated via `JobQueueService` retries).
3. **Complex Form Variability**: Custom non-standard ATS portals require custom provider plugin definitions.

---

## 15. Feature Comparison Matrix

| Feature | Supported | Notes |
| :--- | :---: | :--- |
| **Zero-Token ATS Discovery** | ✅ | Scans 60+ ATS systems via public JSON APIs |
| **Autonomous Application Runner** | ✅ | Supports Manual, Assisted, Autonomous modes |
| **9-Point Auto-Submit Verification** | ✅ | Enforces strict safety rules before submission |
| **Session Recovery & State Dump** | ✅ | Saves cookies, localStorage, form inputs to disk |
| **Multi-Channel Notifications** | ✅ | Discord, Telegram, Slack, Email, Desktop |
| **AES-256-GCM Vault** | ✅ | Encrypts API keys and candidate credentials |
| **Audit Logging Ledger** | ✅ | Immutable `data/audit-log.tsv` |
| **Background Job Queue** | ✅ | Concurrent workers with retries & dedup keys |
| **Autonomous Scheduler** | ✅ | Configurable intervals (1h, 6h, daily, weekly) |
| **Analytics Engine** | ✅ | Conversion funnel, response rate, top companies |
| **AI Learning Engine** | ✅ | Recommends top-converting resume versions |
| **Cover Letter Generator** | ✅ | Short/Long cover letters, recruiter email, LinkedIn |
| **Next.js & Go Frontends** | ✅ | Dual web dashboard and terminal TUI |

---

## 16. Improvement Ideas

1. **Headless Browser Pool Scaling**: Implement a pooled Playwright worker pool to reuse Chromium instances and reduce launch overhead.
2. **Local Vector Search RAG**: Integrate `node:sqlite` vector extension for instant semantic RAG across candidate STAR story banks.
3. **Cloud Webhook Receiver**: Provide an opt-in lightweight webhook gateway for receiving real-time interview invitation emails.

---

## 17. Features Worth Bringing Into Career-Ops ("Features to Port")

| Feature | Description | Benefits | Implementation Difficulty | Priority |
| :--- | :--- | :--- | :---: | :---: |
| **RAG Story Bank Search** | Vector similarity lookup across `interview-prep/story-bank.md` | Tailors form answers with exact past STAR stories | Medium | High |
| **Browser Context Pooling** | Persistent Playwright browser instance reuse | Reduces PDF & extraction latency by ~60% | Medium | Medium |
| **Live Web Socket Stream** | Real-time WebSocket streaming of runner logs to Web UI | Instant visual visibility during autonomous runs | Low | Medium |

---

## 18. Final Verdict

### Should Career-Ops Adopt Antigravity Ideas?
**Yes.** Antigravity's architectural approach—combining local-first data contract boundaries, zero-token HTTP discovery, provider plugin modularity, AES-256-GCM security vaults, and strict 9-point human-in-the-loop safety gates—transforms Career-Ops into a production-grade Autonomous AI Career Agent.

### What to Adopt:
- Dual-layer system/user file boundary (`DATA_CONTRACT.md`).
- Modular provider plugin lifecycle (`BaseProvider`).
- Session state dump & HITL recovery protocol.
- Multi-channel notification dispatcher and background job queue.

### What to Avoid:
- Monolithic server-side databases overriding user files (keep Markdown canonical).
- Uncapped autonomous submit loops without 9-point policy verification.
