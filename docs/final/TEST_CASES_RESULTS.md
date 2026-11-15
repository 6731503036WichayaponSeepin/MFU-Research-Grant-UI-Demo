# Test Cases & Results

Final run: 15 November 2026 (Asia/Bangkok); JSON started timestamps เป็น UTC. PASS หมายถึง command/scope ที่ระบุผ่าน ไม่แทนทุก FR/UAT. FAIL=รันแล้วผิด, NOT TESTED=ไม่ได้รัน, BLOCKED=ต้องรอนโยบาย/เอกสาร/authorization

| Suite / command scope | Result | Actual summary | Evidence |
|---|---|---|---|
| unit | PASS | ℹ tests 113; ℹ pass 113; ℹ fail 0 | [log](evidence/unit.log) |
| lint | PASS | exit 0 | [log](evidence/lint.log) |
| build | PASS | exit 0 | [log](evidence/build.log) |
| build-firebase | PASS | exit 0 | [log](evidence/build-firebase.log) |
| phase1-browser | PASS | PASS Phase 1 browser: 44 checks; screenshots=docs/progress/screenshots; no external requests | [log](evidence/phase1-browser.log) |
| phase2-browser | PASS | PASS Phase 2 browser: 29 checks | [log](evidence/phase2-browser.log) |
| phase3-browser | PASS | PASS Phase 3 browser: 42 checks | [log](evidence/phase3-browser.log) |
| phase4-browser | PASS | PASS Phase 4 browser: 21 checks; PDF=tmp/pdfs/phase4-evaluation.pdf | [log](evidence/phase4-browser.log) |
| phase5-browser | PASS | PASS Phase 5 browser: 25 checks; one shared project across three roles/personas | [log](evidence/phase5-browser.log) |
| phase6-browser | PASS | PASS Phase 6 browser: 240 route/language/viewport checks; sign-in separate; project data unchanged | [log](evidence/phase6-browser.log) |
| migration-dry-run | PASS |   "writes": 0,;     "needs_review": 11, | [log](evidence/migration-dry-run.log) |
| foundation-http | PASS | PASS: 22 v1.6 authenticated HTTP emulator requests, projections, private file verification and one-round closure | [log](evidence/foundation-http.log) |
| staff-reviewer-http | PASS | PASS Phase 3 HTTP: 33 authenticated requests; rejected commands preserve full records; emulators only; PASS Phase 4 HTTP: 13 authenticated requests; independent drafts, submitted locks and response projections | [log](evidence/staff-reviewer-http.log) |
| canonical-acl | PASS | PASS: 28 Firestore emulator access-control checks; PASS: 17 v1.6 Storage emulator access-control checks | [log](evidence/canonical-acl.log) |
| login-legacy | PASS | PASS: 46 login-only emulator checks: existing-account login, three protected roles, removed API, denied signup writes, retained legacy records, proposal submission, corrections and fresh sign-in persistence. | [log](evidence/login-legacy.log) |
| legacy-acl | PASS | PASS: 28 Firestore emulator access-control checks | [log](evidence/legacy-acl.log) |
| auth-researcher | PASS | PASS Phase 1 Auth browser: 17 checks; 3 server-profile roles; emulators only | [log](evidence/auth-researcher.log) |
| auth-staff | PASS | PASS Phase 1 Auth browser: 17 checks; 3 server-profile roles; emulators only | [log](evidence/auth-staff.log) |
| auth-reviewer | PASS | PASS Phase 1 Auth browser: 17 checks; 3 server-profile roles; emulators only | [log](evidence/auth-reviewer.log) |

## Acceptance cases / limits

| Case | Result | Verified scope / excluded scope |
|---|---|---|
| Q01 Domain | PASS / BLOCKED | 9 states / 17 contracts, valid/invalid/self loops; TR-07/17 positive blocked, local-only TR-03 and scoped TR-06 exception |
| Q02 Proposal | PASS / BLOCKED | manual/import/partial draft/reload/PDF/signed evidence/consent/version/correction; official field list/formats/mapping still OPEN |
| Q03 Review | PASS | exactly 3, draft != submitted, independent results, 3/3 once, revised actual file, no second round, explicit staff close |
| Q04 Permissions | PASS | 3 role auth profiles, owner/workspace/assignment URLs/API/projections and Firestore/Storage denial; no production pen-test |
| Q05 Closure/cancel | PASS / BLOCKED | both closure paths and terminal guards; actual cancellation mutation remains blocked |
| Q06 Integrity | PASS | actor/time/version/history, stale update/duplicate guards, missing Storage object, quota/data preservation, copy parity, fixtures consent refs |
| Q07 PDFs | PASS / BLOCKED | individual submitted Thai/English PDF bytes/privacy/multipage rendered QA; official RS-1 form equivalence and post-CLOSED PDF blocked |
| Q08 Navigation | PASS | current Phase1–5 browser Back/Forward/refresh, guards, deep links and persistence; historical legacy browser scripts not executed |
| Q09 UI | PASS | 30 Local definitions × 2 languages × 4 viewports = 240; Sign In via auth emulator; keyboard focus/labels existing suites, mobile container scrolling; not full WCAG |
| Q10 UAT | NOT TESTED / BLOCKED | no stakeholder study, official metrics or production sign-off |

30 route definitions were smoke-tested without mutating canonical records; N-C02 Sign In is tested in three authenticated emulator runs, not on Local Demo. Page smoke is not a full field/action test; use workflow suite evidence for behavior.

PDF extraction/render results: [PDF QA](evidence/pdf/results.json). Visual review covers all four rendered evaluation pages and selected final Thai mobile screens. No generated PDF is presented as an official signed artifact.

NOT TESTED: historical demo/navigation browser, advisor/reviewer-example/full legacy Firebase suites, production/cloud Node22, performance, accessibility certification, real email/e-Office, official template equivalence. Maintained final suite FAIL count = 0. Blockers remain in Matrix/Known Issues.

Migration is read-only offline dry-run on synthetic legacy fixtures: 12 records, 1 candidate, 11 needs_review, 0 invalid, writes=0, applyAllowed=false.
