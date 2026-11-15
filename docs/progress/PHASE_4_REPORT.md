# Phase 4 — Expert Reviewer Workspace

MFU / 404 Team Found · Target v1.6 · 15 November 2026

## Completed

พัฒนาเฉพาะ Phase 4 บน Canonical v1.6 และ Minimal MFU Design System ใช้ AGENTS.md, Requirements/Workflow/User Flow/Use Case/State Specification v1.6 ในตำแหน่งอ้างอิงเดิม, Audit 05/06 และรายงาน Phase ก่อนหน้า ไม่แก้ Requirements ต้นฉบับ

| Page | Route (page token) | ผล / Traceability |
|---|---|---|
| N-V01 Assigned Reviews Workspace | `#/reviewer/dashboard`, `#/reviewer/projects` | รวมข้อมูลมอบหมาย, counts pending/draft/submitted, search/status filter, deadline/report revision และ context links; เฉพาะงานของตน FR-REV-02/05/09 |
| N-V02 Assigned Report Reader | `#/reviewer/projects/:id/assigned-report` | ใช้ ProjectDocuments/DocumentPreview เดิม แสดงเฉพาะ report IDs ที่ผูก assignment พร้อม version; อ่าน/ดาวน์โหลดไม่เปลี่ยน state FR-REV-03; TR-13 context |
| N-V03 Evaluation Editor | `#/reviewer/projects/:id/evaluation` | ใช้ schema/validation เดิม, partial draft, conditional reasons, narratives, utilization และ feedback PDF ผ่าน adapter เดิม; working copy แยก workspace+UID+project+assignment FR-REV-04/05 |
| N-V04 Evaluation Review & Submit | `#/reviewer/projects/:id/answers` | ตรวจคำตอบจาก working draft เดียวกัน, validation, กลับแก้ไข, confirmation snapshot, expectedVersion, busy/duplicate lock; เก็บ actor/time/assignment; ไม่ release หรือปิดเอง FR-REV-06/08; TR-15 self |
| N-V05 My Submitted Evaluation & PDF | `#/reviewer/projects/:id/my-evaluation` | ผลของตนแบบ read-only, receipt, actual feedback links และ on-demand individual PDF จาก submitted snapshot; ไม่สร้างลายเซ็น FR-REV-06–08, NFR-01/05 |

รักษา page tokens เดิม evaluation/answers แทนเพิ่ม nested router ใหม่; ไม่มีเมนูหลักสำหรับทุกขั้นตอน เข้าจาก Assigned Reviews/Project Overview บัญชี Local Demo Reviewer 1–3 ใช้ persona selector เดิม เป็นบทบาทเดียว ไม่มีบัญชีจริงเพิ่ม

## Guards และ PDF

- คง Staff assignment rule exactly 3 unique active reviewers เดิม เพิ่มตรวจ aggregate ว่ามี reviewer/assignment 3 คนตรงกันก่อน save/submit เพื่อปฏิเสธ malformed records ทั้ง Local และ Backend
- Draft ไม่ถูกนับ submitted ผลแยก UID, server response/project projection เห็นเฉพาะ assignment/evaluation ของตน Submitted แก้/ส่งซ้ำไม่ได้ ไม่เปิดรอบสอง ไม่เปลี่ยน Main State เพราะ save/PDF
- Confirmation จับ project version และคำตอบตอนเปิด Modal; Backend ตรวจ role/state/version/validation เดิม UI ไม่เป็น authorization เพียงชั้นเดียว
- Reviewer อ่าน feedback PDF ของตนที่เพิ่งอัปโหลดระหว่างยัง evaluate ได้ เพื่อเลือกประกอบร่าง; อีก Reviewer อ่านไม่ได้ หลังล็อกเข้าถึงตาม documentIds ของผลที่บันทึกเท่านั้น ไม่เพิ่มชนิดไฟล์/size policy ใหม่
- `submittedPdfSnapshot` ตรวจ capability, submitted flag, assignment และ round ก่อนสร้างไฟล์ และตรวจซ้ำก่อน download หลัง async font load PDF ใช้ข้อความ/metadata ของผลจริงครบ รวม raw recorded values, reviewer, submittedAt, assignment, report revision/IDs และ feedback document IDs ไม่มี timestamp หรือ signature ที่แต่งแทนข้อมูลจริง
- PDF สร้างใน browser จาก authoritative scoped records ที่ระบบส่งมาอยู่แล้ว ไม่มี API/schema ใหม่ และไม่บันทึกไฟล์หรือแก้ audit/project เมื่อ download; ใช้ Sarabun local font เดิม

## Files

New: `src/pages/ReviewerHomeV16.jsx`, `src/pages/ReviewerPages.jsx`, `src/utils/reviewerWorkspace.js`, `src/utils/evaluationPDF.js`, `src/components/EvaluationPdfAction.jsx`, `tests/reviewerWorkspaceV16.test.js`, `tests/phase4.browser.mjs`, `scripts/test-phase4-auth.mjs` และรายงานนี้

Modified: `src/components/SharedWorkspace.jsx`, `src/App.jsx`, `src/utils/demoRouter.js`, `src/utils/commonWorkspace.js`, `src/components/Sidebar.jsx`, `src/components/DemoEntry.jsx` (accessible persona label), `src/pages/SharedProjectOverview.jsx`, `src/theme.css`, `src/domain/actions.js`, `src/domain/permissions.js`, generated server copies ของ actions/permissions, `tests/phase3.api.integration.mjs`, `tests/phase1.auth.browser.mjs`, `package.json`, `AGENTS.md`

Reuse: evaluation schema/validateEvaluation, useFormDraft/navigation guards, ProjectStateBadge, Feedback/ConfirmationModal, ResearcherFiles, ProjectDocuments/DocumentPreview, workspaceCommand, foundation fixtures/personas และ server-profile authorization เดิม ไม่มี migration

## Verification

| Test | Result |
|---|---|
| `npm test` | 108/108 PASS (baseline 104 + Reviewer tests 4) |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| Firebase-mode Vite build | PASS; ไม่ Deploy |
| `npm run test:phase4:browser` | 21 checks PASS; 3 personas, assigned report, draft reload/validation, review/confirm/cancel, submitted lock, PDF bytes/read-only, mobile, cross-role/result isolation |
| `npm run test:phase4:auth` | 17 checks PASS; 3 server-profile roles และ Reviewer Browser บันทึกร่างผ่าน authenticated command |
| HTTP emulator suite (`test:phase3:api`, ขยาย Reviewer regression) | Staff 33 + Reviewer 13 authenticated requests PASS; rejected commands ไม่แก้ record, response ไม่เปิดข้อมูล Reviewer อื่น |
| Firestore / Storage emulator ACL | 28 / 17 checks PASS |
| Phase 1 / 2 / 3 browser regressions | 44 / 29 / 42 checks PASS |
| PDF extraction/render | PDF ตัวอย่างจริง 2 หน้า; ตรวจไทย/อังกฤษ, multiline และ exact comments ด้วย pypdf; render ทั้งสองหน้าด้วย PDFium และตรวจภาพจริง |

ไฟล์ PDF สำหรับ QA อยู่ `tmp/pdfs/phase4-evaluation.pdf` (ข้อมูลสมมติจากการ submit ผ่าน UI) และ rendered pages อยู่โฟลเดอร์เดียวกัน ไม่มีการอ้าง sample PDF ว่าเป็นผลจริงของผู้ใช้ ชุด HTTP ใช้ prepared fixtures ใน Emulator ไม่ใช่ production data

Screenshots: [Assigned Reviews](screenshots/phase4/assigned-reviews.png), [Report Reader](screenshots/phase4/report-reader.png), [Editor](screenshots/phase4/evaluation-editor.png), [Review & Submit](screenshots/phase4/review-submit.png), [Submitted Result](screenshots/phase4/submitted-result.png), [Mobile](screenshots/phase4/submitted-mobile.png)

## Pending / Limits

- Official evaluation rubric/หัวข้อ/ชื่อค่าผลประเมินยัง OPEN-11 และ OPEN-07 ตามต้นฉบับ ใช้ schema และ validation Demo ที่มีอยู่พร้อมป้าย ไม่สร้างคะแนนหรือเกณฑ์ใหม่ ไม่อ้างว่าเป็น official template ที่อนุมัติแล้ว
- PDF รวม 3 คน, retention และ PDF หลัง CLOSED ยัง OPEN; disabled ตาม capability guard เดิม CLOSED/CANCELLED ยังคงแยกกัน
- Staff/Researcher PDF service integration ของหน้าจอ Phase ก่อนหน้าไม่ได้ขยายใน Phase 4; reusable generator พร้อมใช้ใน Phase 5 แต่ไม่เปลี่ยน pending buttons ของบทบาทอื่นโดยอัตโนมัติ
- ใช้ PDF adapter เดิม 2 MB ไม่ตัดสิน final attachment policy ใหม่; ไม่มี e-Office API, Email Service หรือบัญชีจริงเพิ่ม
- Build ยังเตือน chunks ใหญ่กว่า 500 kB; ทดสอบ Node 24 ในเครื่อง ขณะที่ Functions target Node 22 ยังไม่ใช่ Production/UAT certification
- Repository มีงานก่อนหน้าที่ยังไม่ commit; ไม่ reset หรือรวมทั้งหมดเป็นงาน Phase 4 ไม่มี Deploy/live Firebase write และหยุดก่อน Phase 5
