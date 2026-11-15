# Final End-to-End Test Report

16 พฤศจิกายน 2026 · Asia/Bangkok · **Local Demo เท่านั้น**

## ผลรวม

รันทดสอบจริงด้วย Playwright + installed Chrome headless ไม่ใช่เพียงตรวจ source มีการกรอก กดปุ่ม อัปโหลด PDF บันทึก draft เปลี่ยน persona ยืนยันส่ง และปิดโครงการจริงใน isolated browser stores

| ชุดตรวจ | ผลล่าสุด |
|---|---|
| Unit/domain regressions (`npm test`) | **PASS 116/116** |
| Browser suites ทั้งหมดที่รัน | **33 PASS / 0 FAIL** จาก 33 Local Demo suites |
| Checks ที่ผ่านใน browser suites | **1,634 checks** รวม render/responsive checks; ไม่ใช่จำนวน unique requirements |
| Current v1.6 role/workflow/UI suites | **PASS** |
| Migrated `demo.browser.mjs`, `navigation.browser.mjs` | **PASS 58 / 61 checks**; ตรวจ current v1.6 ไม่คืน deprecated behavior |
| Lint / build | **PASS / PASS**; build มี bundle-size warning เดิม >500 kB |
| Firebase Sign In / emulator / real Backend authorization | **NOT TESTED** ใน Local Demo scope |

ผลล่าสุด **Local Demo regression suites ผ่านครบ** หลังเปลี่ยนสอง scripts เป็น assertions ของ v1.6 และ execute จริงใหม่ ไม่ใช้ skip หรือ suppression เพื่อเปลี่ยน FAIL เป็น PASS ทั้งนี้ BLOCKED / NOT TESTED ด้านล่างยังคงเดิม

อ่าน AGENTS.md, Requirements v1.6/Workflow/User Flow/Use Case Specification/State Transition Specification จาก `C:/Users/User/Downloads/เอกสารความต้องการ/`, DESIGN_SYSTEM, audit 05/06 และรายงาน Phase/Researcher/Staff/Reviewer validation ก่อนตรวจ คง temporary Local Demo OPEN-04/13 และ policy ที่ยัง OPEN

## ผลแยกตามบทบาท — Expected / Actual

| Role / งาน | Expected | Actual / Result |
|---|---|---|
| Researcher: R01–R09, shared pages | เห็นเฉพาะโครงการตนเอง; filters/counts/routes สอดคล้อง | **PASS** Common 44, Researcher regression 29, full-field validation 168 checks และ cross-role E2E |
| RS-1 Manual Entry | ทุกฟิลด์เดิม bind/save/recover ถูกต้อง; missing/invalid input ถูกปฏิเสธ | **PASS** ตรวจ 72 field bindings/recovery ผ่าน browser; proposal validation/domain negative tests ผ่าน |
| Proposal PDF / submission | Preview/upload/save ไม่เปลี่ยน state; ต้องมี signed RS-1/evidence/consent ก่อนส่ง | **PASS** ตรวจ real PDF bytes/viewer, guards และ TR-03 temporary confirmation / TR-05 |
| Correction | แก้เฉพาะหัวข้อที่ Staff ระบุ; ส่ง version ใหม่โดยคง STAFF_REVIEW | **PASS** ขอแก้ชื่อเรื่องบนโครงการใหม่ แก้และแนบหลักฐานใหม่แล้วส่งกลับ Staff ผ่าน UI |
| Researcher closure / revised report | สองเส้นทาง; ไม่เห็นผลก่อน release; revised report ไม่สร้างรอบสองหรือปิดเอง | **PASS** ทั้ง seeded regression และโครงการที่สร้างใหม่ครบสองเส้นทาง |
| Staff: S01–S10, X01–X04 | queues/counts/forms/actions/documents ตาม role/state | **PASS** Staff regression 42 และ 12 UI suites รวม 390 checks |
| Acknowledgement/certification | เพื่อทราบ ไม่ใช่อนุมัติ; record และ transition แยกกัน | **PASS** acknowledgement อยู่ COMMITTEE_ACKNOWLEDGEMENT; certification จึงไป IN_PROGRESS |
| Changes/extensions | บันทึกผลภายนอก; rejected ไม่แก้ค่า; limits/history/state ถูกต้อง | **PASS** change/extension UI 20 checks + unit coverage รวม denied outcomes, 2 extensions และ six-month limits |
| Staff final closure | verify latest report ก่อน และต้องกดปิดแยก | **PASS** verify คง REPORT_EVALUATION; explicit close → CLOSED; external notice/history คงอยู่ |
| Reviewer: V01–V05, X01–X04 | assignment-only, private answers/files, status/counts/next action ถูกต้อง | **PASS** 8 Reviewer UI suites รวม 431 checks และ Reviewer regression 21 |
| V02/V03 split workspace | PDF/form scroll แยก, resize, controls และ draft ไม่สูญหาย | **PASS** pointer/keyboard resize, 2-page PDF, independent scrolling, sticky actions, reload/route recovery |
| Evaluation fields/validation | Demo criteria เดิมครบ; conditional reasons/utilization/narratives บันทึกตรงค่า | **PASS** เพิ่ม final negative suite 17 checks: ทั้ง 4 categorical reasons, 4 narratives, 5 utilization options, 4 conditional utilization details, final reason/comments และ feedback upload |
| Submit / duplicate / editing | ต้อง valid + confirm; submitted ล็อก แก้/ส่งซ้ำไม่ได้ | **PASS** invalid form/cancel tested; submitted editor/answers route แสดง read-only; duplicate save/submit และ duplicate command ถูกปฏิเสธใน domain tests |
| Submitted PDF | เฉพาะของตนจาก submitted snapshot; ไม่เปลี่ยน state/ไม่สร้างลายเซ็น | **PASS** bytes/preview/download, exact snapshot metadata, actor identity และ post-CLOSED guard ผ่าน |
| Notifications/history/documents | recipient/owner/assignment permissions, read markers persist, audit ไม่แต่งเพิ่ม | **PASS** mark-one/all/header counts/reload/3-persona isolation; actual event ordering/no synthetic events; unknown/unassigned/foreign feedback denied |

Reviewer UI suites: dashboard 66 / split 26 / review 17 / submitted PDF 58 / overview 85 / documents 52 / history 67 / notifications 60. ตัวเลขของ cross-role/negative suites แยกจาก 431 นี้

## Complete Cross-role Journeys — โครงการเดียวกันตั้งแต่สร้างจนปิด

เพิ่ม `tests/finalCrossRole.browser.mjs` ใช้ Playwright fill/select/click/upload จริง ไม่มีการเรียก domain action เพื่อข้ามขั้นตอน มีเพียงอ่าน canonical store เพื่อ assert ผล

| เส้นทาง | Actual project ID ใน isolated browser | Expected / Actual |
|---|---|---|
| Report | `117fb87e-cb2f-49a7-8feb-3862a5424eeb` | สร้าง proposal → draft recovery → PDF/confirm ready → signed evidence/consent → Staff correction → Researcher resubmit → Staff pass → acknowledgement → certification → report upload/closure submission → exactly 3 unique assignments → Reviewer ทั้ง 3 บันทึก draft/submit → Staff release → Researcher PDF/revised report → Staff verify/explicit close: **PASS, CLOSED version 29** |
| Publication | `c593bb7c-efff-420a-88a4-d2f39727141e` | สร้าง proposal และยื่นครบขั้น → รับรอง → summary/publication evidence → Staff check/record publication closure: **PASS, CLOSED version 14; assignments/evaluations = 0** |

**55 checks** ผ่านใน E2E ใหม่นี้ รวม same-project audit/notification closure events ส่วน Phase 5 browser อีก **25 checks** ตรวจ draft ไม่นับ 3/3, release ครั้งเดียว, researcher ก่อน/หลัง release, PDF async cancellation และ assignment/evaluation records ไม่เปลี่ยนเป็นรอบสอง

ข้อมูล/step outcomes จริงอยู่ [journeys.json](evidence/final-e2e/journeys.json) แต่ละ path ใช้ record เดียวข้ามบทบาท ไม่ใช่การสลับ fixture คนละโครงการเพื่อจำลองว่าจบ flow

## Coverage ของ 9 States และ Pages

- เดินผ่านจริงจาก UI: DRAFT → AFFILIATION_REVIEW → STAFF_REVIEW → COMMITTEE_ACKNOWLEDGEMENT → IN_PROGRESS → CLOSURE_REVIEW → REPORT_EVALUATION → CLOSED; publication ข้าม REPORT_EVALUATION ตามกฎ
- CANCELLED: **PASS display/read-only/terminal guards** ด้วย fictional terminal fixture; **BLOCKED positive TR-17 mutation** เพราะ OPEN-20 ไม่ยกเลิกโครงการจริงหรืออ้างว่าทดสอบ positive cancellation ผ่าน
- Survey 31 proposed page definitions: **30 Local Demo definitions × 2 languages × 4 widths = 240 PASS route/overflow checks**; N-C02 Firebase Sign In เป็น **NOT TESTED**
- เก็บ inventory **748 rendered controls** จาก 30 definitions และ screenshots แต่การพบ control ใน inventory **ไม่ถือว่ากดทดสอบ action นั้นผ่าน** ดู [page-controls.json](evidence/final-e2e/page-controls.json), [page-results.json](evidence/final-e2e/page-results.json)
- Shared pages ของ Staff/Reviewer มี UI suites เพิ่มจาก common survey; TH/EN และ 1440/1280/768/390px ผ่าน ไม่เปลี่ยน theme/layout

## Confirmed Bug Fixed

**Feedback upload → Save Draft ถูกปฏิเสธทั้งที่เป็นไฟล์ของ Reviewer เอง**

- Reproduction: Reviewer กรอก conditional fields → Upload feedback PDF → Save Draft; actual error ก่อนแก้: `Only the evaluator’s own feedback files are allowed`
- Root cause: `ResearcherFiles` หา new documents โดยเทียบ full command response กับ role-projected input ทำให้เอกสารเก่าที่ถูกซ่อนจาก Reviewer ถูกนับว่าเป็นไฟล์ใหม่ และเพิ่ม ID เหล่านั้นเข้า selected feedback IDs
- Fix: เลือกเฉพาะ `document.id` ของไฟล์ที่ upload สำเร็จ ไม่เปรียบเทียบความต่างของ aggregate ทั้งชุด คง domain permission guard เดิมไว้
- Traceability: FR-REV-03/05/06, NFR-01/02 และ document ownership เดิม; ไม่เปลี่ยน TR/state/Backend contract
- Retest: **PASS final negative 17 checks** ตรวจ selected IDs เท่ากับ feedback ที่ upload เพียงไฟล์เดียว, save/recover/review/submit สำเร็จ, values ทุกช่องคงเดิม, Reviewer อีกคนเปิด feedback ไม่ได้ และ submitted result ยังล็อก
- รันทวนหลังแก้: Researcher, Staff, Reviewer, Phase 5 integration, field/recovery tests และ full two-path cross-role journeys **PASS**; unit/lint/build **PASS**

Application change มีเพียง selection fix ใน `src/components/ResearcherFiles.jsx` ไม่ redesign UI หรือแก้ business rules

## Previous Failures / Regression Cleanup

| รายการ | Expected / Actual / การจัดการ |
|---|---|
| `tests/demo.browser.mjs` | เดิม FAIL เพราะ UI/workflow เก่า → **PASS 58 checks** หลัง rewrite เป็น canonical scenario/permission/correction/external-result/PDF/evaluation/reset tests |
| `tests/navigation.browser.mjs` | เดิม FAIL เพราะ selector/approval page เก่า → **PASS 61 checks** หลังตรวจ current draft keys, browser Back/Forward, cancelled role switch, files, saves และ deep links |
| Retired behavior | ยืนยัน route correction แสดง Retired และใช้ scoped STAFF_REVIEW correction / external e-Office outcome แทน ไม่คืน Web approval, staged wizard, fabricated readable report หรือ second evaluation round |
| Isolated legacy reviewer harness | ครั้งแรก launch ไม่พบ bundled Chromium; แก้ default test launcher ให้ใช้ installed Chrome โดยคง explicit executable override เดิม แล้ว **PASS 24 checks** ไม่ใช่หลักฐาน Firebase/official rubric |
| New full-chain test locator | ครั้งแรกใช้ชื่อปุ่ม publication closure ไม่ตรง UI; แก้เป็น `Record Publication Closure` แล้วรันทวนครบทั้งสอง paths ผ่าน ไม่มีการแก้ Application ในประเด็นนี้ |


## Cleanup Coverage Mapping

| Assertions เดิม | Current v1.6 coverage ที่ execute แล้ว |
|---|---|
| Legacy scenario cards / state strings / fixed nine-node timeline | Demo 58: canonical nine-state scenario visits, role menus, project context, actual history, Back/Forward/reload; conditional closure/personal progress ตรวจใน role UI suites |
| Wizard RS-1 submission | Current continuous form/bindings/draft recovery ใน Researcher 168, Phase 2 29 และ two-new-project E2E 55 ซึ่งยื่น signed evidence/consent ผ่าน UI จริง |
| Web correction approval | Demo: missing scope/reason denied, TR-06 same state, requested section enabled/unrequested protected, Retired route remains retired; resubmission/certification ตรวจใน full-chain/Staff suites |
| In-Web project change approval | Demo: rejected external e-Office outcome appends history without changing project/state; limits/approved outcomes ใน Staff change/extension suite |
| Fabricated readable report / staged reviewer form | Real permitted PDF viewer/download; split workspace, private draft → review/cancel/submit → read-only; other reviewer/unassigned denial และ no auto-release |
| Old automatic closure / re-evaluation | Full E2E: report requires three submitted evaluations, staff release, revised report and explicit close; publication closes without reviewers; no second round |
| Old role switch / Back controls | Navigation 61: cancelled/accepted browser Back, sidebar leave and role selection; current tabs; direct editor Back falls back to dashboard; no obsolete Back restored |
| Correction/admin/evaluation/closure draft navigation | Navigation: proposal/import/closure/scoped correction/acknowledgement/external record/reviewer drafts survive Back/Forward/reload; uploaded external evidence selection retained; save clears leave warning |
| Reset / pagination / notification navigation | Demo reset cancellation/confirmation/namespace sentinel and role menu links; registry pagination ใน Phase 2/3; current compact notification/read markers ใน role UI suites |
| No reloads/errors/API requests | Normal SPA navigation does not load a new document; explicit reload recovery tested separately; both migrated suites reject page errors, external requests and same-origin `/api/` calls |

ไม่มี `.skip`/disabled assertions และไม่มีการลด permissions/validation เพื่อให้ test ผ่าน Async rendering มี explicit waits; textarea recovery ใช้ scoped label locators ที่รองรับค่าร่างโดยยัง assert ค่าเดิมครบ

Cleanup รอบนี้เปลี่ยนเฉพาะ `tests/demo.browser.mjs`, `tests/navigation.browser.mjs` และ report/evidence; **ไม่เปลี่ยน Application UI/business logic/routes/Backend** การแก้ ResearcherFiles ในหัวข้อก่อนหน้าเป็น bug fix ของรอบ Final E2E เดิมซึ่งถูกคงไว้และรันทวนแล้ว

Rerun: `npm test` 116/116, browser runner ทั้ง 33 suites 1,634 checks, `npm run lint`, `npm run build` ผ่านจริง ภายหลังเพิ่ม network guards รันทวนสอง migrated suites อีกครั้งครบ 58/61 checks

## BLOCKED / NOT TESTED

- **BLOCKED**: TR-07, positive cancellation/OPEN-20, post-CLOSED evaluation PDF, official rubric OPEN-11 และ policies ที่ยังไม่ยืนยัน คง guards เดิม ไม่ตัดสิน OPEN อัตโนมัติ
- **NOT TESTED**: real Firebase authentication/profile checks, Backend/Storage/Firestore emulator suites และ live persistence; `advisor.browser.mjs` เป็น exported helper ที่ต้อง auth bundle ไม่ใช่ standalone Local Demo test
- **NOT TESTED**: official signed documents, actual email delivery, stakeholder UAT, real mobile devices/other browser engines, exhaustive combinations ของทุกปุ่มกับทุก state/input ไม่รับรอง 100% interaction coverage จาก render census
- Existing bundle-size warning ยังคงอยู่ ไม่ refactor bundle ในงานนี้
- PDF attachments ที่ใช้เป็น fictional sample bytes ไม่ใช่เอกสารลงนามจริง; Local role simulation ไม่ใช่หลักฐาน server authorization

## Evidence / Reproduction

- ผล intermediate cleanup attempts ก่อน full rerun เก็บที่ `evidence/final-e2e/pre-cleanup-results.json` (ไม่ใช่ latest result)
- [Latest suite results + prior outcomes](evidence/final-e2e/results.json); raw `.log` ราย suite อยู่โฟลเดอร์เดียวกัน
- [Report closed screenshot](evidence/final-e2e/cleanup-screenshots/report-closed.png), [Publication closed screenshot](evidence/final-e2e/cleanup-screenshots/publication-closed.png)
- [Researcher dashboard](evidence/final-e2e/screenshots/N-R01-th-1440.png), [Staff dashboard](evidence/final-e2e/screenshots/N-S01-th-1440.png), [Reviewer dashboard](evidence/final-e2e/screenshots/N-V01-th-1440.png), [Manual form mobile](evidence/final-e2e/screenshots/N-R03-th-390.png)
- ภาพครบ 30 definitions และ temporary PDFs อยู่ `tmp/final-e2e/`; raw results/control catalog และภาพตัวอย่างคัดลอกเก็บใน docs แล้ว
- Runner: ตั้ง `MFU_PLAYWRIGHT_MODULE` ให้ชี้ Playwright ที่ติดตั้ง แล้ว `node scripts/test-final-e2e.mjs`; เลือกรันทวนเฉพาะไฟล์ได้ด้วย arguments ตัว runner คัดลอก tests โดยเปลี่ยนเฉพาะ screenshot destinations ไม่ลด assertions

ไฟล์แก้รอบ Final E2E ก่อน cleanup: `ResearcherFiles.jsx`, `tests/finalCrossRole.browser.mjs`, `tests/finalNegative.browser.mjs`, `tests/phase6.browser.mjs` (control census/screenshots), `tests/reviewerDemo.browser.mjs` (Chrome launcher), `scripts/test-final-e2e.mjs`, evidence และรายงานนี้

ไม่มี deployment, live Firebase changes, live migration หรือ git push ข้อมูล E2E อยู่ใน isolated Local Demo browser contexts เท่านั้น
