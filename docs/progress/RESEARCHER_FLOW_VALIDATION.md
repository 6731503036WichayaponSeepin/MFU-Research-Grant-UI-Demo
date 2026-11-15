# Researcher Flow Validation & Realistic Demo Data

15 November 2026 · Requirements v1.6 · Local Demo only

## Changes

- แก้ bug ใน `ResearcherFiles`: หลังสลับ Report/Publication ค่า Document Type ที่ใช้ upload ต้องอยู่ในรายการชนิดไฟล์ของเส้นทางปัจจุบันจริง ไม่ค้างเป็น `report` ขณะหน้าจอแสดง `summary_report`; ตรวจทั้งสองทิศทางแล้ว Upload ยังไม่เปลี่ยนสถานะ
- ข้อมูลสมมติ 22 scenarios (14 default + 4 Researcher + 4 Staff) มีชื่อวิจัยไทย/อังกฤษไม่ซ้ำ เลขอ้างอิงไม่ซ้ำ ชื่อนักวิจัย/เจ้าหน้าที่/Reviewer ไทย ต้นสังกัด งบประมาณ 65,000–86,000 บาท และวันเริ่ม/สิ้นสุดที่มีอยู่จริง ครบ 9 สถานะ คง UID/Project ID/Document ID/Version ID/assignment/consent relationships และสถานการณ์เดิม
- ตั้งชื่อไฟล์ตามประเภทและเลขโครงการ พร้อมปรับชื่อใน generated fixture audit document metadata ให้ตรงกัน ไฟล์แนบ seed ยังคงเป็น PDF ตัวอย่างที่เปิดได้ ไม่อ้างว่าเป็นเอกสารวิจัย/ลายเซ็นจริง
- UI ใช้เลขอ้างอิง ชื่อบุคคล เหตุการณ์/ประเภทเอกสาร/หัวข้อแก้ไขที่อ่านเข้าใจ วันที่ไทย/อังกฤษ และชื่อสถานะแทน enum; Researcher Results reuse `evaluationRows` เดิม รวมคำตอบและ conditional details ที่บันทึกแล้ว
- ค้นหาจากเลขอ้างอิงที่แสดงได้ทั้งสามบทบาท เก็บการค้นด้วย internal ID เดิมไว้ ใช้ internal IDs เดิมใน routes, draft storage keys และ commands
- รักษา Researcher JSX/CSS design ล่าสุดและ DEMO MODE; Staff/Reviewer เปลี่ยนเฉพาะข้อมูลและข้อความแสดงผล ไม่มีการ redesign layout หรือเปลี่ยน permission/workflow

ข้อมูลใหม่ใช้กับการเริ่ม Local Demo ครั้งแรก การเพิ่ม scenarios ที่ยังไม่มี และ Reset ที่ผู้ใช้ยืนยันผ่านหน้าต้อนรับเดิม **ไม่เขียนทับ local records/working drafts ที่บันทึกไว้แล้ว** หากเครื่องมี seed ชุดเก่า ต้องเลือก Reset Local Demo เดิมจึงจะเปลี่ยน seed ทั้งชุด (Reset แทนที่เฉพาะ fictional project namespace ตามข้อความยืนยันเดิม) ไม่มี auto-migration หรือ Firebase write

## Workflow / requirement evidence

| Scope | References | Result |
|---|---|---|
| สร้าง/กรอก/กู้ร่าง/ตรวจทาน/บันทึก | FR-RES-01–03,09; TR-01–02 | PASS ทั้ง 72 supported fields: fill → reload/recover → Review/Confirm → ตรวจค่าที่บันทึก; คง DRAFT |
| Upload/Extract, PDF, signed submission | FR-RES-04–15; FR-SIG-01–06; TR-03–05 | PASS ภายในขอบเขต Demo adapter: invalid PDF, preview ไม่ mutation, latest PDF, signed/evidence gate, conditional consent; TR-03 ใช้ temporary Local decision เท่านั้น |
| Correction / handoff / certification | FR-RES-16–19; FR-ADM-01–08; TR-06,08–09 | PASS scoped fields, version/evidence ใหม่, resubmit คง STAFF_REVIEW, owner isolation, Staff ตรวจผ่าน/เสนอเพื่อทราบ/รับรอง |
| Changes / extensions | FR-ADM-09,13; BR-06,14; TR-10 | PASS integration: Staff บันทึกผลภายนอก, before/after, limits เดิม, คง IN_PROGRESS; ไม่มี e-Office API |
| Publication closure | FR-CLS-01,03–08; TR-11–12,14 | PASS upload/submit/supplement/check/explicit Staff close; ไม่มี reviewer assignment |
| Report / release / revised / closure | FR-CLS-02,07,09–10; FR-REV-01–10; TR-13,15–16 | PASS exactly 3 unique, drafts ไม่นับ, independent results, 3/3 release once, PDF read-only, revised actual PDF, ไม่ประเมินซ้ำ, Staff verify และ close แยกกัน |
| Visibility / history / navigation | FR-COM-01–05; NFR-01–03; FR-RES-18–20 | PASS role/owner/assigned guards, 9-state display, documents, Back/Forward, notification read persistence, append-only event history; readable audit rendering ไม่แก้ค่าต้นฉบับ |
| OPEN transitions | TR-07/OPEN-05; TR-17/OPEN-20 | BLOCKED positive mutations ตาม policy เดิม; negative guards/terminal fixtures PASS |

Browser ตรวจการสร้าง/บันทึกใหม่และ proposal submission จาก prepared draft; cross-role report browser เริ่มจาก prepared closure scenario แล้วส่งต่อสามบทบาทบน record เดียว Unit integration ตรวจ lifecycle จาก create project จน publication closure รวม correction/certification/change/extension ไม่อ้างว่า Browser เดียวกรอกใหม่แล้วเดินทุกเส้นทางทั้งหมด หรือว่า validation ครอบคลุมทุก input combination

## Tests

| Command / suite | Result |
|---|---|
| `npm test` | PASS 115/115 |
| `node tests/researcherFlow.browser.mjs` | PASS 168 checks: 72 field bindings/recovery, upload path switch regression, 9 states, reference search, TH/EN at 1440/390px |
| Phase 1 / 2 / 3 / 4 / 5 Browser | PASS 44 / 29 / 42 / 21 / 25 checks (รวมกับ suite ใหม่ 329 browser checks) |
| `npm run lint` | PASS |
| `npm run build` | PASS; existing >500 kB chunk warning |
| Live Firebase / deployment / emulator rerun / cross-browser UAT | NOT TESTED ในงานนี้; ไม่มี Backend contract change และไม่ deploy |

ปรับ regression expectations เฉพาะชื่อข้อมูล/ชื่อปุ่ม/ชื่อเหตุการณ์ที่เปลี่ยน และเมนู Researcher 3 รายการตาม UI ปัจจุบัน แทน expectation 4 รายการที่ล้าสมัย ไม่ตัด assertions ด้าน workflow/permission ออก Console invalid PDF ระหว่าง Phase 2 เป็น negative case ที่ตั้งใจทดสอบ

## Files

- Data: `src/data/researchDemoProfiles.js`, `foundationDemo.js`, `researcherScenarios.js`, `staffScenarios.js`
- Shared display/search: `src/utils/researchDisplay.js`, `researcherWorkspace.js`, `staffWorkspace.js`, `reviewerWorkspace.js`
- Components: `ResearcherFiles.jsx`, `ProjectStateBadge.jsx`, `DemoEntry.jsx`, `SharedWorkspace.jsx`
- Pages: `ResearcherHome`, `ResearcherDashboardView`, `ResearcherEditor`, `ResearcherProposalPDF`, `ResearcherSubmission`, `ResearcherClosure`, `ResearcherResults`, `SharedProjectOverview`, `ActivityHistory`, `ProjectDocuments`, `NotificationsTasks`, `StaffHomeV16`, `StaffPages`, `ReviewerHomeV16`, `ReviewerPages` (`src/pages/*.jsx`)
- Tests: `tests/researcherFlow.browser.mjs`, `finalDemoV16.test.js`, `foundation.test.js`, `reviewerWorkspaceV16.test.js`, `phase1.browser.mjs`, `phase2.browser.mjs`, `phase3.browser.mjs`, `phase5.browser.mjs`; existing screenshot outputs refreshed by suites

## Blockers / limits

- OPEN-04/13 ยังคง temporary Local-only ตาม `docs/decisions/LOCAL_V16_OPEN04_OPEN13.md`; Production ไม่เปิด TR-03/correction permission เอง TR-07 และ cancellation authority ยังปิด
- Official RS-1 mapping/field list, scanned OCR/file policy, rubric, publication acceptance, standards blocking, reminder cadence และ post-CLOSED evaluation PDF ยังคง OPEN ตามเอกสาร ไม่ประกาศอนุมัติหรือ production-ready
- เอกสาร PDF seed เป็น fictional sample bytes ที่ใช้ทดสอบการเปิด/ดาวน์โหลด; proposal/evaluation PDF ที่ generate ใช้ข้อมูลที่บันทึกจริงตาม guards เดิม ไม่มีการสร้างลายเซ็นแทนบุคคล
- ไม่แก้ Requirements, state enums/TR, Backend contract, live Firebase records หรือ deploy
