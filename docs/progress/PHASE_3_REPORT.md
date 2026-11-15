# Phase 3 — Research Administration Staff Workspace

โครงการ Personal Research Grant Management System for Mae Fah Luang University — 404 Team Found

Target v1.6 | ดำเนินการ 15 November 2026 | หยุดก่อน Phase 4

## ขอบเขตและหลักฐานอ้างอิง

พัฒนาเฉพาะ Staff Workspace N-S01–N-S10 และ Shared/Domain/Backend guards ที่จำเป็น ไม่ Deploy ไม่แก้ข้อมูล Firebase จริง และไม่รัน Migration ข้อมูลเดิม ใช้ Local Demo และ Firebase Emulator แยกกัน

อ่าน AGENTS.md, รายงาน Phase 0–2, docs/audit/ ทั้งหกไฟล์ และเอกสาร v1.6 วันที่ 14 November 2026 จาก `C:/Users/User/Downloads/เอกสารความต้องการ/` ได้แก่ `requirement (1).md`, `Workflow (1).md`, `User Flow.md`, `Use Case Diagram (1).md`, `Use Case Specification (1).md`, `State Transition Diagram (1).md` ตำแหน่งตรงกับ AGENTS.md และไม่มีการแก้เอกสารต้นฉบับ เอกสาร Audit เป็นข้อเสนอออกแบบเดิม ไม่ใช่หลักฐานว่าฟังก์ชันทำงานแล้ว

ก่อนเริ่ม Phase นี้ Unit Tests เดิมผ่าน 97 tests; ใช้ฐาน Canonical v1.6 จาก Phase 0–2 โดยตรวจ implementation และผลทดสอบจริง ไม่เปลี่ยน 9 State IDs, 3 Roles หรือ TR-01–TR-17

## Completed Pages และ Traceability

Route ในตารางเป็นค่า page ใน Demo Router ไม่ใช่การเพิ่ม Backend endpoint แยกทุกหน้า หน้าที่มี Project Context ต้องแนบ Project ID และผ่านสิทธิ์ก่อน render

| Page | Route/page | งานที่ทำและ Business Rules | Requirement / Transition |
|---|---|---|---|
| N-S01 Staff Dashboard | dashboard | ยอดเฉพาะ Workspace ที่เข้าถึงได้, 11 summary queues, Recent Submissions, Action Required; การรอ Reviewer/นักวิจัยไม่แสดงเป็นงาน Staff ที่ต้องทำทันที; cards เปิด Registry queue เดียวกัน | FR-ADM-01,08; FR-REG-01–04; อ่านข้อมูล ไม่เปลี่ยน state |
| N-S02 Project Registry | projects | ID/title/researcher/affiliation/submission/duration/status/next task; search, state/queue filters, sort/order, pagination 6 rows; contextual actions; แสดงข้อจำกัด Excel Mapping | FR-ADM-08; FR-REG-01–04; ไม่มี status dropdown |
| N-S03 Proposal Review | staff-review | Structured RS-1, budget, actual document references, versions/signatures/consent/history; ขอแก้พร้อมเหตุผลและ Local Demo sections; ตรวจหลักฐานก่อน Pass | FR-ADM-01–05, FR-RES-16–17, FR-SIG-02–05; TR-06,08 |
| N-S04 Acknowledgement & Certification | administrative-records | บันทึก meeting/date/reference/notes/evidence ของการรับเรื่องเพื่อทราบ แยกจากยืนยันรับรอง; Research Standards เป็นข้อมูลและหลักฐาน ไม่มี universal blocker ที่ยัง OPEN | FR-ADM-06–07, FR-STD-01–03, BR-13; acknowledgement ไม่เปลี่ยน state, certification TR-09 |
| N-S05 Change & Extension Records | project-change-record | Staff บันทึกผล approved/rejected ภายนอก, previous/updated values, reason/ref/date/documents; extension ไม่เกิน 2 ครั้งที่อนุมัติ ครั้งละไม่เกิน 6 เดือน; ไม่ตัดสิน month-end policy เอง | FR-ADM-09, BR-14; TR-10 และ record_project_change คง IN_PROGRESS |
| N-S06 Closure Review | closure-review / closure | ข้อมูลส่งปิด, รายงาน/ผลงานเผยแพร่, เอกสารจริง, ขอเพิ่มเติม, ตรวจครบ; Publication ปิดได้หลังตรวจโดยไม่มอบหมาย Reviewer | FR-CLS-01–08,11–12; TR-12,14 |
| N-S07 Reviewer Assignment | reviewer-assignment | เลือกผู้ใช้ Reviewer ที่มีอยู่และ active จำนวน 3 คนไม่ซ้ำ ผูก report version; confirmation ก่อนมอบหมาย; ไม่สร้างบัญชีจริง | FR-CLS-07, FR-REV-01; TR-13 |
| N-S08 Evaluation Tracking & Release | evaluation-tracking | แยก pending/draft/submitted, นับ submitted เท่านั้น 0/3–3/3; release ครั้งเดียวเมื่อครบ พร้อม actor/time/notes; PDF รายบุคคลแสดง Service Pending และปิดปุ่ม | FR-REV-01,05–10; TR-15 self-transition |
| N-S09 Final Verification & Closure | final-verification | แสดง original/revised actual document references และ release; ขอไฟล์เพิ่ม/ตรวจฉบับแก้ไข/ยืนยันปิดแยกคำสั่ง; ไม่มีรอบประเมินซ้ำ; บันทึก external closure notice หลังปิด | FR-CLS-09–12, FR-REV-08; TR-15,16 |
| N-S10 Cancellation Preparation | cancellation | reason RESIGNED/EXCEEDED_DURATION/OTHER, details, references และ validation preview; ปุ่ม mutation ปิดทุกโหมดตาม OPEN-20; อ่าน CANCELLED fixture/history ได้ | FR-CAN-01–02, FR-REG-03; TR-17 PENDING ไม่เปิดใช้ |

N-S06 ใช้สอง page tokens สำหรับ Context เดิมร่วมกัน ไม่ถือว่าเป็นสอง Workflow ใหม่ Sidebar แสดงเฉพาะเมนูระดับบทบาท หน้าย่อยเข้าผ่าน Overview/Next Action ข้อมูล CLOSED/CANCELLED คงแยกจากกัน ไม่ลบประวัติหรือเปลี่ยนชื่อสถานะเดิม

## Shared Components และ Command Safety

- `StaffActionForm` เก็บ working draft ตามผู้ใช้/โครงการ ใช้ confirmation, busy/error/success และ snapshot ของ project version/payload ณ เปิด Modal เมื่ออีกแท็บแก้ข้อมูลระหว่างนั้น คำสั่งเก่าถูกปฏิเสธด้วย expectedVersion
- `StaffPages` ใช้ shared file library สำหรับไฟล์ที่ได้รับสิทธิ์ แสดง metadata/version/reference ไม่สร้าง Readable Report แทนไฟล์จริง; Upload/Preview/Download ไม่เปลี่ยนสถานะหลัก
- `workspaceCommand` รวมการส่งคำสั่งหลายบทบาทโดยยังใช้ authenticated Server Profile ที่ Backend; `researcherCommand` เป็น compatibility export ไม่เปิดสิทธิ์ Staff ให้ Researcher
- Backend ตรวจสิทธิ์และ validation ซ้ำ ไม่เชื่อถือ actor/role จาก request payload; Local Demo policy OPEN-04/13 ไม่ถูกเปิดบน Backend
- ยุติ Web Correction Approval เดิมทั้ง UI route, local helper และ permission bypass จาก legacy `correction.state=approved` ใน proposal save ฝั่ง Client/Backend โดยคงข้อมูลเดิม ไม่ auto-migrate

## Domain และ Data Model

นำ Project/Document/History/Closure/Assignment/Evaluation model เดิมกลับมาใช้ ไม่มี collection หรือ state ซ้ำ เพิ่มข้อมูลอ้างอิงให้คำสั่งเดิม: acknowledgement meeting/notes/documentIds, certification notes/documentIds, external change date, closure checking notes, final verification notes และ closure notice notes/documentIds

Pass Proposal ตรวจ signed_rs1 และ affiliation_evidence references อีกครั้ง Final Verification และ Close Report ต้องมี revised_report references ที่ใช้ได้จริง ไม่ยอมรับเพียง boolean ว่า complete การตรวจเนื้อหาทางวิชาการ/ความครบ 5 บทยังเป็นงานเจ้าหน้าที่ ไม่อ้างว่า parser ตรวจความถูกต้องแทนได้

ประวัติเดิมคงไว้ ทุก canonical mutation ผ่าน contract และ audit เดิม การ release ไม่เปลี่ยน REPORT_EVALUATION; การรับเรื่องเพื่อทราบไม่ใช่การอนุมัติของคณะกรรมการ การบันทึก notice หลัง CLOSED เป็น administrative history โดยไม่เปิดแก้โครงการทั่วไป

## Local Demo Fixtures

เพิ่มชุด opt-in 4 โครงการ: `V16-PUBLICATION-REVIEW`, `V16-FINAL-VERIFY`, `V16-EVALUATION-DRAFT`, `V16-REPORT-ASSIGN` เพื่อทดลอง publication closure, revised verification, draft 0/3 และ assignment ตามลำดับ เริ่มต้น 14 รายการ เมื่อเลือกเพิ่มครบเป็น 18 รายการ เพิ่มซ้ำไม่เขียนทับ ID เดิม มีป้าย synthetic contract fixture และไฟล์ PDF ตัวอย่างจริง ไม่มีการสร้างบัญชี Firebase ไม่มีการ import/migrate ข้อมูลจริง

Fixture history ที่เตรียมไว้เป็นสถานการณ์จำลอง ไม่ใช่หลักฐานว่ามีผู้ใช้ส่งผลจริงหรือ Reviewer Workspace Phase 4 เสร็จแล้ว

## ไฟล์ที่เพิ่มและแก้ใน Phase นี้

| กลุ่ม | ไฟล์ |
|---|---|
| New Staff UI | `src/pages/StaffHomeV16.jsx`, `src/pages/StaffPages.jsx`, `src/components/StaffActionForm.jsx` |
| Shared integration | `src/App.jsx`, `src/components/SharedWorkspace.jsx`, `src/components/Sidebar.jsx`, `src/pages/SharedProjectOverview.jsx`, `src/shared.css`, `src/utils/commonWorkspace.js`, `src/utils/demoRouter.js` |
| Commands/queries | `src/utils/workspaceCommands.js`, `src/utils/researcherCommands.js`, `src/utils/staffWorkspace.js`, `src/utils/staffLinks.js` |
| Domain/backend/legacy guards | `src/domain/actions.js`, generated `functions/domain/src/domain/actions.js`, `functions/securePolicy.js`, `src/utils/projectStorage.js`, `src/utils/demoCorrection.js` |
| Fixtures | `src/data/staffScenarios.js`, `src/utils/foundationStore.js` |
| Tests/runners | `tests/staffWorkspaceV16.test.js`, `tests/interactiveDemo.test.js`, `tests/phase3.browser.mjs`, `tests/phase3.api.integration.mjs`, `tests/phase1.auth.browser.mjs`, `scripts/test-phase3-auth.mjs`, `package.json` |
| Documentation | `AGENTS.md`, รายงานนี้ และ screenshots ด้านล่าง |

Repository มีงาน Phase ก่อนหน้าที่ยังไม่ commit อยู่ก่อนเริ่ม รายการ git status ทั้งหมดจึงไม่ใช่การเปลี่ยนของ Phase 3 ทั้งหมด Generated server domain ใช้ sync script เดิม ไม่แก้สำเนาแยกนโยบาย

## Testing Results

| การทดสอบ | ผล |
|---|---|
| `npm test` | PASS 104/104 (เพิ่ม Staff 7 tests จาก baseline 97) |
| `npm run lint` | PASS |
| `npm run build` | PASS Local Demo build |
| `npx vite build --mode firebase --outDir dist/firebase-phase3` | PASS Firebase-mode build; ไม่ Deploy |
| `npm run test:phase3:browser` | PASS 42 checks รวม 10 pages, filters/sort/pagination, workflows, modal concurrency, other-role denial, mobile layouts, ไม่มี unexpected external requests/page errors |
| `npm run test:phase3:auth` | PASS 17 checks จาก server-profile roles, route guards, authentication feedback และ Staff canonical write ผ่าน Emulator |
| `npm run test:phase3:api` | PASS 33 authenticated HTTP requests; rejected requests ตรวจว่า record เดิมไม่ถูกแก้ |
| Firestore / Storage Emulator ACL ในชุด API | PASS 28 / 17 checks |
| Phase 1 Browser regression | PASS 44 checks |
| Phase 2 Browser regression | PASS 29 checks |

Unit tests ครอบคลุม scope/role/queues, submitted evidence, correction sections, ack/cert แยกกัน, rejected/approved external records, extension limits/month-end OPEN, exactly-three reviewers, draft ไม่นับ submitted, release once, revised document guards, terminal guards, cancellation disabled และ fixture no-overwrite

ปรับ Regression Test เดิมใน `interactiveDemo.test.js` ซึ่งเคยคาดหวัง Web Correction Approval อนุญาตแก้หลังรับรอง ให้ตรวจการปฏิเสธและรักษาข้อมูลเดิมแทน เพราะขัดข้อกำหนด Phase 3 ที่ยุติ workflow นี้ ไม่ลบ test เพื่อซ่อน failure

HTTP tests ใช้ prepared document metadata/inline sample fixtures ไม่ใช่หลักฐานทดสอบ upload ทุกไฟล์ผ่าน Storage UI โดยตรง; Storage ACL มี integration tests แยกตามตาราง การทดลองจริงทั้งหมดใช้ project `demo-mfu-secure` กับ localhost emulators ไม่มี live migration/write

Build มีคำเตือน bundle chunks ใหญ่กว่า 500 kB ต้องปรับ performance ในงานถัดไป Runtime ที่ใช้ทดสอบ Node 24 ขณะที่ Functions ระบุ Node 22 จึงยังไม่รับรอง production runtime parity ไม่มีการทดสอบ Production/UAT หรืออ้างว่าส่ง email จริง

## Screenshots

- [Dashboard Desktop](screenshots/phase3-dashboard-desktop.png)
- [Registry Desktop](screenshots/phase3-registry-desktop.png) / [Mobile](screenshots/phase3-registry-mobile.png)
- [Proposal Review](screenshots/phase3-proposal-review-desktop.png)
- [Certification](screenshots/phase3-certification-desktop.png)
- [Change and Extension](screenshots/phase3-change-extension-desktop.png)
- [Publication Closure](screenshots/phase3-publication-closure-desktop.png)
- [Reviewer Assignment](screenshots/phase3-assignment-desktop.png)
- [Evaluation Tracking](screenshots/phase3-evaluation-tracking-desktop.png)
- [Final Closure](screenshots/phase3-final-closure-desktop.png)
- [Cancellation Desktop](screenshots/phase3-cancellation-desktop.png) / [Mobile](screenshots/phase3-cancellation-mobile.png)

## Known Issues / Pending Requirements

1. OPEN-04/13 ใช้เฉพาะ Temporary Local Demo Decision เดิมใน `docs/decisions/LOCAL_V16_OPEN04_OPEN13.md`; Requirements ไม่เปลี่ยนเป็น CONFIRMED Backend ไม่เปิด Trigger/sections ชั่วคราว TR-07/OPEN-05 ยังคงปิด
2. Official checklist ของ proposal/closure และเกณฑ์ publication ที่ยัง OPEN ต้องยืนยันก่อนบังคับเป็นนโยบายจริง UI แสดงข้อมูลและใช้ validation ที่มีหลักฐาน ไม่สร้าง checklist ทางวิชาการใหม่
3. OPEN-10 เรื่อง month-end extension ยังไม่กำหนดเอง กรณีที่ต้องตัดสินวิธีคำนวณจะถูกปฏิเสธ; ไม่สร้างรอบแจ้งเตือนใหม่
4. OPEN-17 Research Standards ยังไม่กำหนดชนิด/ผู้ตรวจ/กฎบล็อกเริ่มโครงการแบบครอบจักรวาล แสดงข้อมูลและแนบหลักฐานได้ตามสิทธิ์
5. OPEN-18/19 และ OPEN-21 ยังไม่สร้างรอบรับสมัคร, auto-remove, Excel enum หรือ automation จากการเดาความหมาย ขาดต้นฉบับ Excel/Data Dictionary ที่ยืนยัน mapping
6. OPEN-20 Cancellation mutation ปิดทุกโหมด ไม่มีสิทธิ์ Staff cancel เพิ่มโดยพลการ ไม่มี auto-cancel หรือ delete
7. FR-REV-07 PDF ผลประเมินรายบุคคลยัง Service Pending ไม่แสดงว่าใช้งานได้แล้ว ต้องเชื่อม PDF service/template ที่ถูกต้องใน Phase 5; ไฟล์ตัวอย่างไม่ใช่ผลประเมินจริง
8. ไม่มี e-Office API, Email Service หรือการสร้างบัญชี Reviewer จริง การแต่งตั้ง/การอนุมัติภายนอกและ closure notice ยังเป็น external process ที่ Staff บันทึกหลักฐาน

## Remaining Tasks / Handoff

Phase 3 จบในขอบเขตที่พัฒนาได้ตามข้อกำหนดพร้อมรายการ Pending ข้างต้น รอผู้ใช้ตรวจรายงานและหน้าจอ ก่อนเริ่ม Phase 4 Reviewer Workspace; Phase 5 Integration/PDF และ Phase 6 Performance/UAT ยังไม่เริ่ม ไม่แก้ OPEN เป็น CONFIRMED และไม่ปรับเอกสาร Requirements ต้นฉบับ
