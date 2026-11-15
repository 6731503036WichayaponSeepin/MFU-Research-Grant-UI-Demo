# Expert Reviewer Flow Validation & Demo Refinement

วันที่ 15 พฤศจิกายน 2026 — Local Demo เท่านั้น

## Reference / Scope

ตรวจ AGENTS.md, DESIGN_SYSTEM, temporary decision LOCAL-V16-OPEN04-13 และเอกสารต้นฉบับ v1.6 วันที่ 14 November 2026 ใน `C:/Users/User/Downloads/เอกสารความต้องการ/`: Requirements, Workflow, User Flow, Use Case Specification (3.14–3.18), State Transition Specification รวมรายงาน Phase 4/5 และ Reviewer UI ล่าสุด

อ้างอิง FR-REV-01–10, FR-CLS-09–12, BR-07/08, TR-13/15/16 และ role/document permissions เดิม ไม่เปลี่ยน Requirements หรือ OPEN เป็น CONFIRMED

## Fixes / Data Refinement

- พบ display gap: PDF Local Demo แสดง UID, fixture identifiers, raw metadata keys และ ISO timestamps เป็นเนื้อหาปกติ ปรับเป็นเลขอ้างอิงโครงการ ชื่อผู้ประเมิน ชื่อรายงานและวันที่อ่านง่ายจาก source จริง
- จำกัด PDF presentation ใหม่เฉพาะ explicitly fictional Local Demo; renderer ปกติเมื่อไม่มี display options คงเดิม snapshot/IDs/answers ไม่เปลี่ยน และเก็บ snapshot ตรงต้นฉบับใน PDF metadata เพื่อการตรวจสอบ
- V05 heading ใช้ชื่อเอกสารอ่านง่ายแทน generated filename ที่มี internal IDs; download filename contract เดิมคงไว้
- แสดง assignment due date ด้วย localized formatter เดิม และเปลี่ยน rubric notice เป็นข้อความสำหรับผู้ใช้ โดยยังแจ้งว่าแบบฟอร์มทางการรอยืนยัน
- ไม่พบ workflow gap เพิ่มที่ยืนยันได้จากการตรวจและชุดทดสอบครั้งนี้ จึงไม่เปลี่ยน domain, permissions, routes, submission/release logic หรือ UI layout
- ตรวจ seed สมจริงเดิม 22 โครงการ (default + optional scenarios) ชื่อ/reference ไม่ซ้ำ ครบ 9 states, budgets/relationships/versions ถูกต้อง และ Reviewer 3 personas แยกผลกัน ข้อมูล Local Storage เดิมไม่ถูก migrate/reset/เขียนทับ

## Coverage & Results

| หน้า/Flow | ผล | หลักฐานที่ตรวจ |
|---|---|---|
| V01 Dashboard | PASS | assigned-only list, 4 canonical counts, search/filter, pending/draft tasks, submitted-only completion chart, 3 personas |
| V02/V03 Workspace | PASS | assigned PDF 2 หน้า/controls/download, full existing fields/conditional validation, independent form/PDF scrolling, pointer/keyboard divider, sticky buttons, draft/reload/route recovery |
| V04 Review/Submit | PASS | all answers/comments/result, read-only, invalid submit disabled, Return to Edit retains answers, cancel/confirm handlers |
| V05 Submitted PDF | PASS | own submitted result only, real PDF bytes/preview, exact snapshot metadata, human-readable Local Demo text, no project mutations, post-submission lock |
| X01 Overview | PASS | personal progress, status actions → workspace/V05, authorized doc count, no lifecycle/other-review results |
| X02 Documents | PASS | permitted assigned report/own feedback, no pending evaluation PDF, V05 links, unauthorized/unknown document denial |
| X03 History | PASS | actual personal events + assignment only, recorded ordering/timestamps, no internal staff records; empty history creates no synthetic events |
| X04 Notifications | PASS | authorized recipient list, project links, mark-one/mark-all/header counts, per-persona persistence, empty state |
| Access / duplicate guards | PASS | wrong owner/workspace/unassigned routes and files denied; duplicate save/submit after submission rejected in domain tests; submitted editor locked in browser |
| Cross-role workflow | PASS | actual browser assignment of 3 unique reviewers, each saves draft and submits; drafts excluded from 3/3; Staff blocked before 3/3, releases once; Researcher denied before release then gains results/PDF access; revised report and explicit Staff close, no second round |
| Other-role regression | PASS | Researcher and Staff browser workflows plus Common pages; latest theme/layout preserved |

## Actual Test Runs

| ชุดทดสอบ | ผลล่าสุด |
|---|---|
| `npm test` | PASS 116/116 |
| Reviewer UI suites: dashboard / split / review / submitted | PASS 66 / 26 / 17 / 58 checks |
| Reviewer UI suites: overview / documents / history / notifications | PASS 85 / 52 / 67 / 60 checks |
| Common / Researcher / Staff / Reviewer / cross-role browser regression | PASS 44 / 29 / 42 / 21 / 25 checks |
| Browser รวม | PASS 592 checks, 13 suites |
| `npm run lint` | PASS |
| `npm run build` | PASS; existing >500 kB bundle warning |
| Firebase emulator / real authentication / live data persistence | NOT TESTED ในรอบ Local Demo นี้ |
| Stakeholder UAT / official rubric equivalence | NOT TESTED / BLOCKED pending official form |

ตัวทดสอบ PDF ใหม่รอบแรก FAIL เพราะเรียก cleanup API ผิด แก้เป็น loadingTask.destroy ตาม library และรันทวนผ่าน 58 checks โดยไม่ลด assertions JSON evidence เก็บผลก่อนแก้ไว้ใน previousRun ส่วน latest status ของทั้ง 13 suites เป็น PASS

Invalid PDF console error ใน Researcher negative test เป็นพฤติกรรมที่ตั้งใจทดสอบ ไม่ใช่ unhandled workflow failure

## Evidence / Reproduction

- ผลราย suite: `docs/progress/evidence/REVIEWER_FLOW_VALIDATION.json`
- Runner: ตั้ง `MFU_PLAYWRIGHT_MODULE` เป็น Playwright module ที่ติดตั้ง แล้วรัน `node scripts/test-reviewer-validation.mjs` (local Chrome/localhost, isolated fictional stores)
- Runner คัดลอก regression scripts โดยเปลี่ยนเฉพาะ screenshot destinations ไป `tmp/reviewer-flow-validation/` เพื่อไม่เขียนทับภาพเก่าที่อาจถูกล็อก Assertions/handlers เดิมครบ
- Screenshots/PDFs เพิ่มเติม: `tmp/reviewer-*-ui/`, `tmp/pdfs/`; เป็น temporary artifacts ไม่ใช่เอกสารจริงหรือหลักฐาน UAT

## Unresolved / Remaining Blockers

- OPEN-11: official evaluation criteria/template ยังไม่ยืนยัน ใช้ Demo rubric เดิม ไม่เพิ่มคะแนนหรือ checklist จาก mockup
- PDF access หลัง CLOSED, combined PDF และ retention policy ยังไม่ยืนยัน; post-CLOSED guard คงปิด ไม่อ้างว่า PDF ขั้นนี้ใช้งานได้แล้ว
- TR-07 / cancellation OPEN-20 ยังคง disabled; Local temporary OPEN-04/13 ไม่ขยายเป็น Production policy
- ไม่มี Email Service หรือรอบแจ้งเตือนที่ยืนยัน จึงไม่อ้างว่าส่งอีเมลจริง และไม่เพิ่ม cadence เอง
- PDF preview ยังคง on-demand: กด Download PDF แล้วแสดง bytes ชุดเดียวกัน ไม่สร้างไฟล์อัตโนมัติหรือเพิ่มลายเซ็น
- ข้อมูล Demo ที่บันทึกไว้ก่อนปรับ seed ไม่ถูกเขียนทับ หากต้องการเริ่มชุด seed ล่าสุดให้ใช้ Reset Local Demo ที่มีอยู่ (จะรีเซ็ต progress ตามพฤติกรรมเดิม)
- ผล Local Demo ไม่ใช่หลักฐาน Backend/emulator/production readiness; ไม่มี deployment, live migration หรือ Firebase data changes

## Files Changed In This Validation

`src/components/EvaluationPdfAction.jsx`, `src/utils/evaluationPDF.js`, `src/pages/ReviewerPages.jsx`, `src/pages/ReviewerSubmittedEvaluation.jsx`, `tests/reviewerEvaluationUI.browser.mjs`, `tests/reviewerSubmittedUI.browser.mjs`, `scripts/test-reviewer-validation.mjs`, JSON evidence และรายงานนี้ การเปลี่ยน UI จากงานก่อนหน้าที่มีอยู่ก่อนเริ่มตรวจถูกคงไว้
