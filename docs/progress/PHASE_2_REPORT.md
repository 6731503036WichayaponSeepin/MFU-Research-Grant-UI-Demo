# Phase 2 Report — Researcher Workspace v1.6

Project: Personal Research Grant Management System for Mae Fah Luang University · 404 Team Found  
วันที่ 15 November 2026 · สถานะ: ส่งตรวจ Phase 2 และหยุดก่อน Phase 3

## 1. ขอบเขตและเอกสารอ้างอิง

พัฒนา Researcher Workspace N-R01–N-R09 และ shared/domain logic ที่จำเป็นบน Phase 0/1 อ่านคำสั่งจากไฟล์แนบ Phase 2, AGENTS.md, Requirements/Workflow/User Flow/Use Case Specification/State Transition v1.6 ใน `C:/Users/User/Downloads/เอกสารความต้องการ/`, audit 01–06 และรายงาน Phase 0/1 ประกอบ source จริงและผลทดสอบ ไม่ใช้ชื่อไฟล์หรือรายงานเดิมแทนการตรวจพฤติกรรม

ก่อนแก้รัน regression ผ่าน 90/90 จริง ฐานเดิมมี domain contracts และ shared pages แต่ canonical researcher action screens ยัง pending งาน Phase 2 จึงเชื่อม UI กับ execute contract ไม่ใช้ legacy save/reducers เปลี่ยนสถานะ canonical records

คำตอบเพิ่มเติมของผู้ใช้อนุญาต Temporary Design สำหรับ Local Demo เท่านั้น บันทึกแยกใน [LOCAL_V16_OPEN04_OPEN13.md](../decisions/LOCAL_V16_OPEN04_OPEN13.md) Requirements ยังคง OPEN-04/OPEN-05/OPEN-13 และไม่เปลี่ยนเป็น Stakeholder CONFIRMED ไม่ deploy ไม่แก้ Firebase Records จริง ไม่เริ่ม Staff/Reviewer UI phases

## 2. Page Inventory — Existing / New / Modified Features

| Page ID / Page | Existing Features ที่นำกลับมาใช้ | New Features | Modified Features / ผลจริง |
|---|---|---|---|
| N-R01 Researcher Dashboard | Shared shell, badge, scoped projection/navigation | 7 project summary groups + Action Required, matching-filter links, Recent Projects, Upcoming Deadlines, Create New Proposal | นับเฉพาะ own/workspace/canonical 9 states; legacy ไม่ปนยอด; ไม่มี email/reminder cadence ใหม่; มี opt-in labelled Contract Fixtures เฉพาะ Local Demo |
| N-R02 My Projects | Search/status URL routing, project link/status | Action Required filter, group filter, pagination 6/page, updated date, next permitted action, create link | แสดงเฉพาะ 9 State IDs ไม่ auto-map legacy; filters/Back/Forward ใช้ URL และไม่เปลี่ยน State |
| N-R03 RS-1 Proposal Editor | ManualEntry: Project Overview, Part A/B/C, RS-1 fields/options, researcher/participants/advisor/research/work plan/outcomes/budget/standards/signature sections | Adapter เข้า canonical create/save, private working copy scope workspace+UID+project, draft recovery, correction field lock ตาม requested sections | รักษาฟอร์มเดิม ไม่เพิ่ม mandatory field ใหม่; incomplete draft บันทึกได้; Save Draft ครั้งแรก TR-01 และครั้งถัดไป TR-02/04/06; ไม่มีการ submit จาก Save Draft |
| N-R04 Import & Extraction | PDF.js text reading, Mammoth DOCX text reading, 9-field pattern mapping, editable values/raw text/file validation | Reviewed-value confirmation, missing-field highlight, scoped extraction working copy, source metadata archive, optional actual PDF source attachment | Failure ไม่ reset ร่างเดิมหรือ preview ที่สกัดสำเร็จแล้ว; blank ที่ผู้ใช้แก้เองล้างค่าได้ แต่ missing key ไม่แต่งข้อมูลหรือทับค่าร่าง; ไม่อ้าง AI/OCR |
| N-R05 PDF & Affiliation Preparation | Existing generateRS1PDF with local Sarabun fonts, PDF.js viewer | Select saved Proposal Version, completeness check, signatory list, Generate Preview, archive PDF linked to version, Local Confirm Ready modal/provenance | Preview/Generate/Download ไม่ mutate aggregate; archive PDF เป็น attachment self-state; TR-03 ทำได้เฉพาะ Temporary Local policy เมื่อมี current-version PDF และ explicit confirmation; TR-04 สร้างฉบับใหม่โดยไม่ส่งเข้า staff เอง |
| N-R06 Signed Proposal Submission | Phase 0 document/consent/current snapshot validations, shared viewer/modal | Signed RS-1 + affiliation evidence OR choice, signatory checklist, explicit e-sign usage, conditional consent, version association, receipt; correction instructions/editor/resubmit | Upload ไม่เปลี่ยน State; confirm ที่ผ่าน gate จึง TR-05; consent เก็บ Project ID/version/document/actor/time; คำรับรองไม่ใช่ signature authenticity verification; TR-06 คง STAFF_REVIEW |
| N-R07 Closure Submission | Phase 0 two-path reducer and document kinds | Report / Publication forms, save draft, upload/preview/selection/remove, confirm modal/receipt, supplemental submission | รายงาน 5 บทต้องมี report; เผยแพร่ต้อง summary_report + publication; Remove เป็น deselect ไม่ลบไฟล์/audit; TR-11 เข้าสู่ CLOSURE_REVIEW; TR-12 คงเดิม; ไม่ถือว่าแทน e-Office หรือปิดโครงการแล้ว |
| N-R08 Revised Report Submission | One-round release/revised-report contract | Instructions, released date/link, new revised PDF version/support files, explicit submit, receipt | เปิดเฉพาะหลัง release และ actionRequiredBy=researcher; ต้อง new revised_report document IDs; คง REPORT_EVALUATION ไม่ reset evaluations/assignments และไม่เริ่มรอบสอง; Staff ต้องตรวจและปิดเอง |
| N-R09 Released Evaluation Results | Phase 0 role projection/release guard | แสดง submitted evaluations 3 คน, feedback attachments, submitted/released dates, revision instructions, go-to-revised link | ก่อน staff release แม้ 3/3 ก็ไม่แสดงผล; PDF service ยังไม่พร้อมจึง disabled พร้อมข้อความ Phase 5 ไม่มี fake generated/download success |

In Progress: จาก Project Overview ไป Activity & History เพื่อดูผล changes/extensions/old-new/external references ตามสิทธิ์ พร้อมคำแนะนำให้ยื่นผ่าน e-Office ไม่มี researcher request/approval form, ไม่มี e-Office API และไม่ให้ Researcher แก้ approved project fields โดยตรงใน IN_PROGRESS

Shared Overview เชื่อม Researcher contextual actions ตาม capability ส่วน Staff/Reviewer canonical action pages ยัง pending ตาม phase เดิม Legacy dataset แยกไว้รักษาร่าง/ฟอร์มและข้อมูลเดิม ไม่ประกาศว่า legacy workflow ตรง v1.6 และไม่ migrate โดยอัตโนมัติ

## 3. Temporary Local Policy และ Backend Boundary

Implementation: `src/domain/localDemoPolicy.js` / Decision ID `LOCAL-V16-OPEN04-13`

- TR-03 ต้อง trusted mode=local-demo, simulation actor, workspace=local-demo-v16 และ fictional/simulationOnly project; ต้อง DRAFT + complete Demo data + PDF linked กับ latest saved proposal snapshot + confirmed=true หลัง modal
- เก็บ ready Proposal Version, PDF/document version, source version, Actor, Timestamp และ Decision ID ใน proposalReady/version/history
- Staff correction request ใน Local Demo ระบุ editableSections จาก mapping ที่บันทึกใน Decision นักวิจัยเปลี่ยนได้เฉพาะ fields เหล่านั้น Domain เปรียบเทียบ changed keys ก่อน save และบันทึก before/after
- Identity/state/staff/certification/audit ไม่อยู่ใน RS-1 allowlist จึงเขียนผ่าน proposal payload ไม่ได้; UI lock และ domain guard ทำงานร่วมกัน ไม่ใช้การซ่อนปุ่มอย่างเดียว
- ส่งใหม่ต้อง current saved proposal version และ signed_rs1 + affiliation_evidence ที่อ้าง version เดียวกัน พร้อม declarations/consent; เก็บ submission bundle/snapshot และ resubmitted version/history แล้วกลับงานให้ Staff โดยคง STAFF_REVIEW
- PDF/evidence ของการแก้ไขแนบใหม่ได้เพื่อผ่าน submission gates; support file เพิ่มเติมต้องมี requested supportingDocuments section
- Backend สร้าง mode=backend เอง ไม่เปิด Temporary Policy จาก approved/enableOpen/context/profile flags; TR-03 ยังคงปฏิเสธ OPEN-04 และ scoped correction policy ชั่วคราวใช้ไม่ได้ใน production (OPEN-13)
- TR-07 ยังคง PENDING/disabled ทุกโหมด ไม่สร้าง requirement ว่าต้องกลับต้นสังกัดจากชนิดการแก้ไขเอง

ไม่มีการแก้ labels/approval status ใน Requirements หรือเพิ่ม main state ใหม่ ยังคง 3 roles, 9 State IDs และ TR-01–TR-17

## 4. Data / Action Contracts ที่เชื่อมจริง

| งาน | Commands / References | ผลต่อ State |
|---|---|---|
| First Save / Edit | create_project / save_proposal; immutable proposalVersions | DRAFT / self-state ตาม TR-02/04/06 |
| Import | create/save with reviewed importSource metadata; attach rs1_source เมื่อมี actual PDF bytes ใน adapter ที่รองรับ | DRAFT เท่านั้น; archive metadata ไม่อ้างว่ามี DOCX bytes ใน private Storage |
| PDF | generateRS1PDF เป็น read; attach proposal_pdf พร้อม proposalVersionId เมื่อผู้ใช้เก็บลงคลัง | ไม่เปลี่ยน State |
| Ready | confirm_ready + documentId/confirmed; Local-only policy | DRAFT → AFFILIATION_REVIEW |
| Signed Submission | submit_proposal / resubmit_proposal + exact version/document IDs/signatures/e-sign/consent | TR-05 หรือ TR-06 self |
| Closure draft / submission | save_closure_draft / submit_closure / supplement_closure | self / TR-11 / TR-12 self |
| Revised report | submit_revised_report + new document IDs + explicit confirmation | TR-15 self, ไม่ประเมินซ้ำ |
| Preview/download/results/history | projected records/authorized actual files | ไม่มี workflow command |

signatureConsent เพิ่ม Project ID ชัดเจนร่วมกับ existing proposalVersionId, signedDocumentId, confirmedBy/At. File metadata รองรับ proposalVersionId; document IDs/versions เดิมยัง immutable ไม่ overwrite

Reviewed source records เก็บ filename/size/type/mapped fields/reviewedBy/At/proposalVersionId และ `text-patterns-not-OCR` ใน importSources ส่วนไฟล์ PDF ต้นทางที่อยู่ในขนาด adapter ถูกเก็บใน documents.kind=rs1_source ไม่ duplicate binary ลง metadata; DOCX/large PDF ใช้เพื่อ extraction และมี source metadata ตามข้อจำกัดเดิม ไม่อ้างว่าเก็บ source bytes ครบทุกชนิดแล้ว

Private working copies ใช้ `mfu-researcher-v16:{workspace}:{uid}:{projectId|new}` และ scoped navigation draft keys ไม่ใช้ legacy global draft key สำหรับ canonical editor หากบันทึกล้มเหลว/ข้อมูลเดิมเสีย ยังคงข้อมูลเดิมและแจ้ง error ไม่มี automatic migration/reset ของ browser data เดิม

Local dispatch รองรับ first creation, ใช้ trusted current time และส่ง update event หลัง durable localStorage write เท่านั้น Firebase command bridge ใช้ existing authenticated execute endpoint/private file pipeline พร้อม expectedVersion, server acknowledgement, owner/workspace validation และ generation/account-change fences ไม่ใช้ local actor เป็น Firebase authorization

## 5. Routes และการนำทาง

| Page | Route |
|---|---|
| N-R01 | #/researcher/dashboard |
| N-R02 | #/researcher/projects?group=...&status=...&action=required&search=...&page=... |
| Preparation choice | #/researcher/choose |
| N-R03 new / existing | #/researcher/manual หรือ #/researcher/projects/{id}/manual |
| N-R04 | #/researcher/upload หรือ #/researcher/projects/{id}/upload (DRAFT) |
| N-R05 | #/researcher/projects/{id}/proposal-pdf |
| N-R06 / correction resubmit | #/researcher/projects/{id}/submission |
| N-R07 | #/researcher/projects/{id}/closure |
| N-R08 | #/researcher/projects/{id}/revised-report |
| N-R09 | #/researcher/projects/{id}/results |

ไม่เพิ่ม context pages ทุกหน้าเป็น Sidebar main menu หน้าต่าง ๆ เข้าได้จาก Project Overview/next action; route permission และ owner/workspace filtering ทำก่อน render ข้อมูล ใช้ router/history/unsaved guards จาก Phase 1 ต่อ

## 6. ไฟล์ที่แก้ไข / เพิ่ม

| กลุ่ม | ไฟล์ | หน้าที่ใน Phase 2 |
|---|---|---|
| Researcher UI ใหม่ | src/pages/ResearcherHome.jsx, ResearcherEditor.jsx, ResearcherProposalPDF.jsx, ResearcherSubmission.jsx, ResearcherClosure.jsx, ResearcherResults.jsx | N-R01–09 โดย reuse Closure component แบบ revised และ Home แบบ dashboard/list |
| Components ใหม่ | src/components/ResearcherPages.jsx, ResearcherFiles.jsx | Route composition และ scoped file upload/selection/version/preview |
| Existing form/import | src/pages/ManualEntry.jsx, UploadDocument.jsx | เพิ่ม adapter/scoped draft/field lock; reuse field set เดิม; แยก extraction utility; reviewed confirmation และ failure preservation |
| Shared integration | src/App.jsx, src/components/SharedWorkspace.jsx, src/pages/SharedProjectOverview.jsx, src/shared.css | เชื่อม canonical researcher pages/actions, dashboard/list และ responsive styles โดยรักษา common/other-role behavior |
| Utilities ใหม่ | src/utils/researcherWorkspace.js, researcherCommands.js, rs1FieldMapping.js, rs1Extraction.js | Filtering/actions/draft scope/file validation/commands; mapping กับ extraction library ที่นำออกจาก component เดิม |
| Store/remote bridge | src/utils/foundationStore.js, sharedStore.js, firebaseSharedStore.js, foundationApi.js | First-create, update events, opt-in fixtures, authenticated command acknowledgement และ session fences |
| Router/role rules | src/utils/demoRouter.js, commonWorkspace.js | เพิ่ม proposal-pdf/revised-report และ researcher-only route policy |
| Domain / shared server contract | src/domain/actions.js, model.js, localDemoPolicy.js | Local temporary gate, scoped correction, exact evidence-version validation, ready/source/consent provenance |
| Fixtures | src/data/foundationDemo.js, researcherScenarios.js | Signed evidence version refs, explicit Phase 2 scenarios ที่ไม่ overwrite existing ID |
| Server packaging | scripts/sync-server-domain.mjs, functions/domain/src/domain/actions.js, model.js, localDemoPolicy.js | Package exact shared reducer/guard รวม Local policy module; mode=backend ยังคงไม่เปิด Temporary Policy |
| Tests/scripts | tests/researcher.test.js, phase2.browser.mjs, foundation.test.js, phase1.browser.mjs, phase1.auth.browser.mjs, scripts/test-phase2-auth.mjs, package.json | Tests ใหม่ + meaningful regression adaptations + runnable scripts |
| Documentation | AGENTS.md, docs/decisions/LOCAL_V16_OPEN04_OPEN13.md, docs/progress/PHASE_2_REPORT.md, screenshots/phase2-*.png | Authorization/policy boundary/report/screenshots |

ไม่มีการแก้ Staff/Reviewer workflow UI, production API entrypoint/rules/database schema deployment หรือ migration writer ในงานนี้ Working tree ยังมีงานเก่าจาก Phase 0/1 และก่อนหน้า ไม่ควรตีความ git status ทั้งหมดเป็นไฟล์ Phase 2

## 7. Requirement Traceability

| Pages / งาน | References | หลักฐาน |
|---|---|---|
| N-R01/02 | FR-COM-02–04, FR-RES-18–20, NFR-01/02/08 | canonical owner list, summary→filter, action filters/pagination, contextual navigation/deadlines |
| N-R03 | FR-RES-01–03/12/16–17, FR-SIG-01, TR-01/02/04/06 | reuse RS-1, partial draft persistence/recovery, scoped correction snapshots; OPEN-13 Local Decision |
| N-R04 | FR-RES-04–08, NFR-06/07, TR-02 | existing PDF/DOCX text extraction, nine-field mapping, explicit review, no invented values, source references/failure preservation |
| N-R05 | FR-RES-09–12, FR-SIG-01, NFR-05, TR-03/04 | saved snapshot PDF, validation/signatory display, latest PDF + modal local trigger; OPEN-04 remains open for production |
| N-R06 | FR-RES-13–17, FR-SIG-02–06, BR-03/04/11/12, AC-TR-05, TR-05/06 | signed + affiliation OR, conditional consent, exact version, actor/time/receipt, unchanged staff-review state |
| In Progress | FR-RES-18–20, FR-ADM-09/13, BR-06, TR-10/11 | read recorded results/history; e-Office guidance, no researcher direct approved-change edit |
| N-R07 | FR-CLS-01–08, BR-07/09, TR-11/12/14 | two minimum bundles, draft/upload no transition, supplemental self-state; Staff still closes |
| N-R08 | FR-CLS-09/10, FR-REV-08/10, BR-08/09, TR-15/16 | release gate, new revised file, no evaluator/assignment reset, Staff verification remains required |
| N-R09 | FR-REV-07/09/10, NFR-01/02/05, AC-TR-15 | 3 submitted results only after release; PDF pending honest service boundary |
| Audit/permissions | FR-COM-05, FR-ADM-10, NFR-03/04/10/11 | authoritative identities/history/versions, wrong-owner/role/state/version rejection, backend denial of Local policy |

รายการ completeness เป็น current Demo validation ตามผู้ใช้ ไม่ถือว่ารายการ field/source-template/accuracy ที่ยัง OPEN ได้รับ Stakeholder approval แล้ว; ไม่สร้าง FR/BR/TR ใหม่

## 8. Testing Results

| Check | ผล | รายละเอียด |
|---|---|---|
| Baseline ก่อนพัฒนา | PASS 90/90 | Node regression จาก source ปัจจุบัน |
| npm test | PASS 97/97, 0 fail/skip | 90 regression + 7 Researcher tests; รวม source/server byte parity ของ Local policy module |
| npm run test:phase2:browser | PASS 29 checks | create/save/recover draft; grouping/pagination; real generated PDF + no state change; modal TR-03; signed/consent gates; versioned TR-05/06; owner denial; report/publication closure; remove preserves bytes; supplementary actual support file; release visibility; revised actual file/no second review; extraction failure preservation/review transfer; mobile layout |
| Phase 1 Common Browser regression | PASS 44 checks | 3 roles/3 reviewer personas, common routes/documents/history/navigation/unsaved state/reset/notifications/9 states; adapted researcher totals and paginated list |
| npm run test:phase2:auth | PASS 17 checks | Auth/Firestore/Functions/Storage emulators; actual Browser→execute API→server canonical DRAFT save verified owner/state/schema; 3 server-profile roles/route protection; no external requests |
| Foundation HTTP emulator | PASS 22 requests | auth, forged context/legacy bypass, backend OPEN rejection, private file existence, 3 evaluator submissions/release, revised file/closure/terminal guards |
| Firestore rules regression | PASS 28 checks | existing access control; expected permission-denied logs เป็น negative tests |
| Storage rules regression | PASS 17 checks | assigned report, own feedback, pre/post release, outsider/revoked/anonymous restrictions |
| npm run lint | PASS | ทั้ง source/scripts/tests ใหม่ |
| npm run build | PASS | Default local bundle ไม่ deploy |
| Firebase-mode build | PASS | `npx vite build --mode firebase --outDir dist/firebase-phase2`; ไม่ deploy |
| git diff --check | PASS | มี LF/CRLF warnings ของ working tree แต่ไม่มี whitespace errors |

Backend tests ใช้ `demo-mfu-secure` และ localhost ที่ assert ก่อน setup ไม่มี production Firebase access. Browser contexts แยกจากบัญชีผู้ใช้จริง มี setup/cleanup เฉพาะ emulators และปิด emulators หลังจบ ต้องใช้ local Java/emulator cache และตั้ง `MFU_PLAYWRIGHT_MODULE` ให้ตรง Playwright runtime ของเครื่อง ไม่เพิ่ม dependency ใหม่

ช่วงทดสอบแรกพบ test fixture UID ชนกันระหว่าง HTTP และ Auth Browser suites ที่ต่อกัน แก้ด้วยการ reset เฉพาะ asserted local demo emulator ใน Phase 2 write-test mode แล้วรันผ่าน ไม่ reset production หรือ user browser data. Corrupt-PDF test ตั้งใจให้ parser รายงาน invalid PDF แต่ไม่มี uncaught browser page error หรือ external service request

### Regression tests ที่ปรับเพราะพฤติกรรมใหม่ที่ได้รับอนุญาต

- foundation.test.js: TR-03 ใน trusted Local Demo ไม่ใช่ unconditional OPEN rejection อีกแล้ว ต้อง reject เมื่อไม่มี latest PDF; backend OPEN denial แยกทดสอบชัดเจน ส่วน TR-07/17 ยังคง reject เหมือนเดิม
- correction regression เพิ่ม explicit editableSections=methodology และแนบ signed/evidence ที่อ้าง current revision ก่อนส่งใหม่ รักษา asserts เรื่อง self-state, stale-version denial, evidence/consent และ immutable history
- Phase 1 Browser tests เดิมคาด dashboard แสดงทุกโครงการใน list เดียว ปรับไปยืนยัน total=14, 9-state filter และ paginated/filtered view เนื่องจาก N-R01 Recent Projects และ N-R02 pagination เป็นพฤติกรรมใหม่ที่ผู้ใช้สั่ง ไม่ลบ owner/visibility/navigation assertions
- Auth Browser reuse ใน PHASE2_WRITE_TEST mode เพิ่ม actual authenticated draft write และตรวจรายการ Staff หลังมี record เพิ่มจาก 14 เป็น 15; ไม่ลด guard เพื่อให้ test ผ่าน

## 9. Screenshots

| ภาพ | ไฟล์ |
|---|---|
| Dashboard / Desktop | [phase2-dashboard-desktop.png](screenshots/phase2-dashboard-desktop.png) |
| PDF/version/local ready / Desktop | [phase2-pdf-desktop.png](screenshots/phase2-pdf-desktop.png) |
| Requested correction / Desktop | [phase2-correction-desktop.png](screenshots/phase2-correction-desktop.png) |
| Publication closure / Desktop | [phase2-publication-desktop.png](screenshots/phase2-publication-desktop.png) |
| Released results / Desktop | [phase2-results-desktop.png](screenshots/phase2-results-desktop.png) |
| RS-1 editor / Desktop | [phase2-editor-desktop.png](screenshots/phase2-editor-desktop.png) |
| RS-1 editor / Mobile | [phase2-editor-mobile.png](screenshots/phase2-editor-mobile.png) |

Screenshots มาจาก Browser จริง ใช้ข้อมูลสมมติ ป้าย Phase 0 ในชื่อ fixture บางรายการคือชื่อข้อมูลเดิมที่ reuse ไม่ใช่การอ้างว่างาน Phase 2 ยังไม่ได้ทำ

## 10. Dependencies / Pending Issues

1. Temporary Decision ใช้เฉพาะ Local Demo: production Confirm Ready และ production post-submit field policy ยังคง OPEN-04/13; TR-07/OPEN-05 ยัง PENDING ทุกโหมด ไม่มีการเปลี่ยน Requirements เป็น CONFIRMED
2. Staff correction/closure request และ Reviewer release ที่ใช้สาธิตมาจาก labelled Contract Fixtures/Phase 0 contracts; Staff/Reviewer UI ยังไม่พัฒนาใน Phase 2 ไม่แสดงว่าได้ดำเนินงานผ่านหน้าจอจริงแล้ว
3. Individual Evaluation PDF service ยังไม่พร้อมตาม user scope ให้เชื่อมจริง Phase 5; ปุ่ม disabled ไม่สร้าง fake PDF. Combined PDF/retention/post-CLOSED PDF access ยัง OPEN
4. File types/mapping/accuracy (OPEN-01/02/03/16) ยังเป็นข้อจำกัด: import PDF/DOCX up to 10 MB, nine basic text fields, ไม่ OCR; actual private PDF transport ≤2 MB. DOCX/large extraction source bytes ไม่ถูกเก็บใน PDF-only transport แม้ source metadata ถูก archive
5. RS-1 original official templates/แบบประเมินจริง/หลักเกณฑ์ 2569 ยังไม่อยู่ในชุดเอกสาร จึง reuse form/generator เดิมโดยไม่รับรอง fidelity กับต้นฉบับที่ไม่ได้ตรวจ; ไม่เพิ่ม required fields หรืออ้าง extraction accuracy target ที่อนุมัติแล้ว
6. Publication-specific evidence criteria (OPEN-14) และ standards/consent proof (OPEN-15/17) ยังต้องยืนยัน เกณฑ์ minimum bundle ของ Demo ไม่ใช่การตรวจ authenticity/acceptance แทนเจ้าหน้าที่
7. Browser drafts/extraction working copies อยู่เครื่องนี้ File object ของ importer อยู่ memory; หลัง refresh ถ้า source bytes ไม่อยู่แล้วต้องเลือกไฟล์ใหม่ก่อน archive/ส่งต่อ ไม่อ้าง cloud draft sync สำหรับค่าที่ยังไม่กด Save Draft
8. Optimistic conflict/network/upload failure แจ้ง error และเก็บร่างเดิม ต้อง reload/retry เมื่อ server version เปลี่ยน; ไม่มี migration หรือ automatic overwrite ของ old fixture/schema/data
9. Build มี chunk >500kB warning ของแอป/PDF dependencies; Functions emulator ใช้ host Node24 ขณะที่ engine กำหนด Node22 ยังไม่ได้ deploy/ทดสอบ cloud Node22 จริง ไม่มี production UAT/email delivery/usability target certification
10. Legacy dataset ยังเป็น compatibility layer แยกต่างหาก ไม่ auto-map main states หรือ re-evaluation history ย้อนหลัง Canonical My Projects ไม่รวม legacy records โดยดู label แล้วถือว่าตรง v1.6

## 11. จุดหยุด

จบเฉพาะ Phase 2 ส่งรายงาน/Temporary Decision/screenshots ให้ตรวจ ไม่มี deploy ไม่มีการเปลี่ยน Firebase Records จริง ไม่มี migration apply และไม่เริ่ม Phase 3 จนกว่าผู้ใช้สั่ง
