# Phase 6 — Final Testing & UI/UX

MFU / 404 Team Found · Requirements v1.6 · 15 November 2026

## Changes

- แก้ cloned fictional fixtures ให้ signature consent และ version submission consent อ้าง Project ID ของตนเอง เพิ่ม regression tests; ไม่แก้ saved local/Firebase records หรือ auto-migrate
- ปรับ Mobile tables ให้เลื่อนใน container ที่มีความกว้างอ่านได้ ไม่บีบคอลัมน์จนข้อความแตกมากเกินไป ไม่มี document overflow ใน viewport ที่ทดสอบ
- เปลี่ยนชื่อชุด Demo ที่ล้าสมัย และข้อความเหตุผลใน Reviewer form โดยรักษา handlers/validation/permissions/minimal theme
- อัปเดต README/AGENTS, สร้าง final page/requirement/test/readiness documentation และ reproducible QA runner พร้อม raw JSON/log evidence

Files: `src/data/foundationDemo.js`, `src/data/researcherScenarios.js`, `src/components/DemoEntry.jsx`, `src/pages/ReviewerPages.jsx`, `src/theme.css`, `tests/finalDemoV16.test.js`, `tests/phase6.pages.mjs`, `tests/phase6.browser.mjs`, `scripts/phase6-checks.mjs`, `scripts/write-phase6-docs.mjs`, `package.json`, `.gitignore`, `README.md`, `AGENTS.md`, `docs/final/` และรายงานนี้ ไม่แก้ main states/TR/Backend policy

## Verification summary

| Scope | PASS | FAIL | BLOCKED / NOT TESTED |
|---|---|---|---|
| 75 FR review | 48 ในขอบเขต Demo AC | 0 unresolved ในขอบเขตที่รัน | 27 มี OPEN/official artifact dependency; ไม่ใช่ 75 FRs production-approved |
| 17 TR review | 13 contracts | 0 | TR-03/06 production policy, TR-07/17 positive cases BLOCKED; Local temporary positives/negative guards ทดสอบแล้ว |
| 31 functional page definitions | mapping ครบ; 30 Local definitions × 2 languages × 4 widths = 240 smoke checks; Sign In ผ่าน auth emulator | 0 | Cancellation mutation และ features ที่ OPEN ยังคง BLOCKED แม้หน้าจอ render ผ่าน |
| Unit tests | 113/113 | 0 | เพิ่ม fixtures regression 2 จาก baseline 111 |
| Role/E2E Browser | Phase1 44, Phase2 29, Phase3 42, Phase4 21, Phase5 25 checks | 0 | Chrome localhost; ไม่แทนทุก browser/UAT |
| Authenticated HTTP | foundation 22 + Staff 33 + Reviewer 13 = 68 requests | 0 | Emulator/prepared fixtures; มี actual private revised PDF upload verification |
| ACL / compatibility | Firestore 28 + Storage 17; login compatibility 46; legacy Firestore 28 | 0 | เป็นขอบเขตของ tests ที่ระบุ ไม่ใช่ production security audit |
| Auth UI | Researcher/Staff/Reviewer write modes อย่างละ 17 checks | 0 | Server profile roles enforced; ไม่มี live sign-in |
| PDF | สอง individual evaluation PDFs / 4 rendered pages, ไทย/อังกฤษ/exact reviewer/no other result/metadata | 0 | Official template equivalence/post-CLOSED policy ไม่ยืนยัน |
| Lint / builds | lint, Local build, Firebase-mode build | 0 | warning chunks >500 kB; cloud Node22 NOT TESTED |
| Migration | dry-run 12 legacy fictional records, writes=0 | 0 | 1 candidate + 11 needs_review; applyAllowed=false; live migration NOT TESTED |

หลักฐานรอบนี้อยู่ [Test Cases & Results](../final/TEST_CASES_RESULTS.md), [local results](../final/evidence/local-results.json), [emulator results](../final/evidence/emulator-results.json), [page checks](../final/evidence/page-results.json) การรันซ้ำหลังปรับ Mobile table/labels ผ่าน 240 checks และ lint/build ทั้งสองโหมดแล้ว ไม่มีการแต่ง PASS ให้รายการที่ไม่ได้ทดสอบ

## Deliverables

- [Final Page Inventory](../final/FINAL_PAGE_INVENTORY.md) — 31 definitions พร้อม routes/source/reuse ไม่บวก tabs/modals เป็นหน้า
- [Requirement Traceability Matrix](../final/REQUIREMENT_TRACEABILITY_MATRIX.md) — 75 FRs/17 TRs, source labels, page/test references, result และ blocker รายข้อ
- [Test Cases & Results](../final/TEST_CASES_RESULTS.md) — acceptance scopes, executable commands และ evidence
- [Known Issues](../final/KNOWN_ISSUES.md)
- [Demo User Guide](../final/DEMO_USER_GUIDE.md)
- [Deployment Readiness](../final/DEPLOYMENT_READINESS.md)
- [Updated README](../../README.md)

## Blockers / stop

Production readiness = **BLOCKED**: official artifacts/OPEN policies โดยเฉพาะ TR-03, correction permissions, cancellation authority, standards/registry/Excel/rubric/retention ยังไม่ยืนยัน ไม่เปิด positive mutation เอง โดยคง Local Demo temporary decision ตามเดิม

NOT TESTED: production environment, deployment, live migration, real email/e-Office, official form equivalence, cloud Node22, load/performance, complete WCAG/cross-browser/stakeholder UAT และ historical suites ที่ระบุใน Known Issues

จบ Phase 6 เท่านั้น ไม่มี Deploy/live migration/Firebase จริงเปลี่ยนแปลง ไม่ลบประวัติ ไม่ overwrite งาน Phase ก่อนหน้า และหยุดรอผู้ใช้ตรวจรับ
