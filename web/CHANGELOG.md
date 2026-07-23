# Changelog

## [0.4.0](https://github.com/damiencloud/Ai-saas-Job-Portal/compare/web-v0.3.0...web-v0.4.0) (2026-07-23)


### Features

* **cv,ai:** add native PDF/DOCX extraction with pdf-parse and mammoth, modes/discover.md prompt, and latest PDF fallbacks ([5b1eabc](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/5b1eabcfe087b1a58c201ab3d0089c6f87006c42))
* Evolve Career-Ops into Antigravity AI Career OS monorepo ([bfd960c](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/bfd960c456d05c4495cbb0d4d50f7704ea3ce6f3))
* experimental local-first web UI (opt-in alpha) ([#1451](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1451)) ([1791dc4](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/1791dc4e3a14aeb10decd852c927bb636aefe00d))
* **patterns:** per-agency advance-rate analysis from the Via channel ([b6ce551](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/b6ce551e4404f15b20404ecc642886cfe8a2c4c5))
* **pipeline:** optional per-offer note in the pipeline writer ([#1483](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1483)) ([6435b1a](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/6435b1a4dc93a9d441df8768e481d878e3309ae3))
* **tracker:** Via channel — end employer vs recruiter/agency intermediary ([#1599](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1599)) ([b66c0b4](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/b66c0b4a76e9f3738bbddac2ebeb612053e0a9cc))
* **web:** Config microcopy humanized (P1.5) ([#1538](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1538)) ([8ae3475](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/8ae347502b8380692a5f80f490bc59f20d1c8491))
* **web:** cost affordance — CostBadge muted (P1.6) ([#1536](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1536)) ([b212bb3](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/b212bb3591de4c374347dec40fc400c4d6ab9bda))
* **web:** dedupe bug reports at write — stable fingerprint + click-gated similar-issue search ([#1473](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1473)) ([e13a4f3](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/e13a4f37d6df9d21c0acca1d1716993df036e01d))
* **web:** empty-state free-scan button (P0.1) ([#1534](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1534)) ([28f12e3](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/28f12e39e3e41104bb7a1f3650a0a508701f82fe))
* **web:** extract cleanChips to a tested module + tab/CR paste delimiter ([#1516](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1516)) ([7e676f4](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/7e676f403e16c84231bb08669c79218615a88c83))
* **web:** inbox triage — Abundance → Triage → Shortlist → Opt-in Score ([#1569](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1569)) ([f1e6cc0](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/f1e6cc0ef2dae1f134e9d6bbb152611107a36308))
* **web:** mobile tap-targets ≥44px + FAB clearance ([#1542](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1542)) ([7f6fd1c](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/7f6fd1c8f34fd0137a995bd2bb4b1f295c8a9303))
* **web:** orange hierarchy — brand-soft Mark-applied + inbox cost legend (P1.4) ([#1537](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1537)) ([85d8290](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/85d829018c7b7225a1bbd547c53b817fd165924d))
* **web:** report progressive disclosure (P0.3+P1.8) ([#1535](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1535)) ([30fa1d1](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/30fa1d19d00bf9a269adcef6778c52a1627d668c))
* **web:** richer bug-report diagnostics — data-shape fingerprint, core version, API errors ([#1469](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1469)) ([6a13d8a](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/6a13d8a7a5448c5f488cac1631a1da471c070335))


### Bug Fixes

* **ai:** add openrouter prompt engine support for CV parsing and AI assistant console ([e796963](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/e796963bb87c009385807f419d82eb50773b016f))
* correctness sweep across tracker, providers, and eval reporting ([#1528](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1528)) ([bd2a44f](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/bd2a44f4ee1ea6c6def70200d7750969e67ebadf)), closes [#1527](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1527)
* **deps:** update npm dependencies ([#1593](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1593)) ([253c571](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/253c5719df403cdaa493db27cdd17349f54f7889))
* **prod:** Finalize Next.js production build config and dynamic imports ([66e1324](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/66e1324a223991c2c93a494065c26d87ce7638ca))
* **tracker:** retrofit remaining positional readers onto the shared header-aware parser ([#1598](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1598)) ([369a5ff](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/369a5ffcf6623750fcbedbd16be7d3c1c84f1111))
* **vercel:** Cap serverless function maxDuration to 60 for Vercel Hobby plan compliance ([269e2e8](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/269e2e8a5614dd3c774fe284f574b1fff6886032))
* **web:** 44px tap-targets at the component level ([#1629](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1629)) ([388542f](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/388542f3c0a2f82eeac83be8db5b616c213225b9))
* **web:** bump FOLLOW-UPS DUE tap-targets to 44px on mobile ([#1568](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1568)) ([f5e8362](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/f5e836268c8a16707566becb51675d0b52a670dd))
* **web:** contrast tokens — AA across both themes ([#1627](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1627)) ([ee89bea](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/ee89bea997702d40d1cc01620f727bbb66146b9b))
* **web:** Fix Turbopack static dynamic import resolution for AutonomousRunner in Vercel build ([d995c88](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/d995c881cd1f5bdafc9f83accd9fbeae43303550))
* **web:** pin turbopack.root to prevent Windows postcss OOM ([#1530](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1530)) ([8560153](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/8560153ad8aa37a3993418d32f951f25c868c6c4))
* **web:** point the 'Get one free' link at the free-AI-engine guide ([#1540](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1540)) ([8369b40](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/8369b4001ba63be78818240b9dbc3aa94aebe2e8))
* **web:** portals copy + analytics semantics ([#1628](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1628)) ([f8daa19](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/f8daa19d8ea164dd2bbb63834f2d048a34ccaa63))
* **web:** resolve button functionality issues, CLI auto-detection, and Apply button lock ([8641f10](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/8641f10eb376c612a49009ad1d573247f8b7c975))
* **web:** restore the report-a-bug kit lost between the RC branch and main ([#1456](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1456)) ([b11231f](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/b11231ffc77dfbd36b745b35df0b6ded3bb73720))
* **web:** ux-audit cleanup — CostBadge global CSS + last sub-44 stragglers ([#1648](https://github.com/damiencloud/Ai-saas-Job-Portal/issues/1648)) ([786b960](https://github.com/damiencloud/Ai-saas-Job-Portal/commit/786b960c2761e88a534886eafdc9d59f82aba56b))

## [0.3.0](https://github.com/santifer/career-ops/compare/web-v0.2.0...web-v0.3.0) (2026-07-07)


### Features

* **patterns:** per-agency advance-rate analysis from the Via channel ([b6ce551](https://github.com/santifer/career-ops/commit/b6ce551e4404f15b20404ecc642886cfe8a2c4c5))
* **tracker:** Via channel — end employer vs recruiter/agency intermediary ([#1599](https://github.com/santifer/career-ops/issues/1599)) ([b66c0b4](https://github.com/santifer/career-ops/commit/b66c0b4a76e9f3738bbddac2ebeb612053e0a9cc))


### Bug Fixes

* **deps:** update npm dependencies ([#1593](https://github.com/santifer/career-ops/issues/1593)) ([253c571](https://github.com/santifer/career-ops/commit/253c5719df403cdaa493db27cdd17349f54f7889))
* **tracker:** retrofit remaining positional readers onto the shared header-aware parser ([#1598](https://github.com/santifer/career-ops/issues/1598)) ([369a5ff](https://github.com/santifer/career-ops/commit/369a5ffcf6623750fcbedbd16be7d3c1c84f1111))
* **web:** 44px tap-targets at the component level ([#1629](https://github.com/santifer/career-ops/issues/1629)) ([388542f](https://github.com/santifer/career-ops/commit/388542f3c0a2f82eeac83be8db5b616c213225b9))
* **web:** contrast tokens — AA across both themes ([#1627](https://github.com/santifer/career-ops/issues/1627)) ([ee89bea](https://github.com/santifer/career-ops/commit/ee89bea997702d40d1cc01620f727bbb66146b9b))
* **web:** portals copy + analytics semantics ([#1628](https://github.com/santifer/career-ops/issues/1628)) ([f8daa19](https://github.com/santifer/career-ops/commit/f8daa19d8ea164dd2bbb63834f2d048a34ccaa63))
* **web:** ux-audit cleanup — CostBadge global CSS + last sub-44 stragglers ([#1648](https://github.com/santifer/career-ops/issues/1648)) ([786b960](https://github.com/santifer/career-ops/commit/786b960c2761e88a534886eafdc9d59f82aba56b))

## [0.2.0](https://github.com/santifer/career-ops/compare/web-v0.1.0...web-v0.2.0) (2026-07-05)


### Features

* experimental local-first web UI (opt-in alpha) ([#1451](https://github.com/santifer/career-ops/issues/1451)) ([1791dc4](https://github.com/santifer/career-ops/commit/1791dc4e3a14aeb10decd852c927bb636aefe00d))
* **pipeline:** optional per-offer note in the pipeline writer ([#1483](https://github.com/santifer/career-ops/issues/1483)) ([6435b1a](https://github.com/santifer/career-ops/commit/6435b1a4dc93a9d441df8768e481d878e3309ae3))
* **web:** Config microcopy humanized (P1.5) ([#1538](https://github.com/santifer/career-ops/issues/1538)) ([8ae3475](https://github.com/santifer/career-ops/commit/8ae347502b8380692a5f80f490bc59f20d1c8491))
* **web:** cost affordance — CostBadge muted (P1.6) ([#1536](https://github.com/santifer/career-ops/issues/1536)) ([b212bb3](https://github.com/santifer/career-ops/commit/b212bb3591de4c374347dec40fc400c4d6ab9bda))
* **web:** dedupe bug reports at write — stable fingerprint + click-gated similar-issue search ([#1473](https://github.com/santifer/career-ops/issues/1473)) ([e13a4f3](https://github.com/santifer/career-ops/commit/e13a4f37d6df9d21c0acca1d1716993df036e01d))
* **web:** empty-state free-scan button (P0.1) ([#1534](https://github.com/santifer/career-ops/issues/1534)) ([28f12e3](https://github.com/santifer/career-ops/commit/28f12e39e3e41104bb7a1f3650a0a508701f82fe))
* **web:** extract cleanChips to a tested module + tab/CR paste delimiter ([#1516](https://github.com/santifer/career-ops/issues/1516)) ([7e676f4](https://github.com/santifer/career-ops/commit/7e676f403e16c84231bb08669c79218615a88c83))
* **web:** inbox triage — Abundance → Triage → Shortlist → Opt-in Score ([#1569](https://github.com/santifer/career-ops/issues/1569)) ([f1e6cc0](https://github.com/santifer/career-ops/commit/f1e6cc0ef2dae1f134e9d6bbb152611107a36308))
* **web:** mobile tap-targets ≥44px + FAB clearance ([#1542](https://github.com/santifer/career-ops/issues/1542)) ([7f6fd1c](https://github.com/santifer/career-ops/commit/7f6fd1c8f34fd0137a995bd2bb4b1f295c8a9303))
* **web:** orange hierarchy — brand-soft Mark-applied + inbox cost legend (P1.4) ([#1537](https://github.com/santifer/career-ops/issues/1537)) ([85d8290](https://github.com/santifer/career-ops/commit/85d829018c7b7225a1bbd547c53b817fd165924d))
* **web:** report progressive disclosure (P0.3+P1.8) ([#1535](https://github.com/santifer/career-ops/issues/1535)) ([30fa1d1](https://github.com/santifer/career-ops/commit/30fa1d19d00bf9a269adcef6778c52a1627d668c))
* **web:** richer bug-report diagnostics — data-shape fingerprint, core version, API errors ([#1469](https://github.com/santifer/career-ops/issues/1469)) ([6a13d8a](https://github.com/santifer/career-ops/commit/6a13d8a7a5448c5f488cac1631a1da471c070335))


### Bug Fixes

* correctness sweep across tracker, providers, and eval reporting ([#1528](https://github.com/santifer/career-ops/issues/1528)) ([bd2a44f](https://github.com/santifer/career-ops/commit/bd2a44f4ee1ea6c6def70200d7750969e67ebadf)), closes [#1527](https://github.com/santifer/career-ops/issues/1527)
* **web:** bump FOLLOW-UPS DUE tap-targets to 44px on mobile ([#1568](https://github.com/santifer/career-ops/issues/1568)) ([f5e8362](https://github.com/santifer/career-ops/commit/f5e836268c8a16707566becb51675d0b52a670dd))
* **web:** pin turbopack.root to prevent Windows postcss OOM ([#1530](https://github.com/santifer/career-ops/issues/1530)) ([8560153](https://github.com/santifer/career-ops/commit/8560153ad8aa37a3993418d32f951f25c868c6c4))
* **web:** point the 'Get one free' link at the free-AI-engine guide ([#1540](https://github.com/santifer/career-ops/issues/1540)) ([8369b40](https://github.com/santifer/career-ops/commit/8369b4001ba63be78818240b9dbc3aa94aebe2e8))
* **web:** restore the report-a-bug kit lost between the RC branch and main ([#1456](https://github.com/santifer/career-ops/issues/1456)) ([b11231f](https://github.com/santifer/career-ops/commit/b11231ffc77dfbd36b745b35df0b6ded3bb73720))
