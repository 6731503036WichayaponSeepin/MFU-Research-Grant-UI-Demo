# Phase 5 — Workflow Integration

MFU / 404 Team Found · v1.6 · 15 November 2026

## Changes

- เชื่อม `EvaluationPdfAction` เดิมให้ Staff เลือก PDF รายบุคคล และ Researcher ดาวน์โหลดทั้งสามผลหลัง Staff release ใช้ submitted snapshot/capability guard ร่วมกับ Reviewer ไม่เพิ่ม API, schema หรือสถานะ ไม่สร้างลายเซ็น และไม่เปลี่ยน project/audit จากการสร้าง PDF
- เพิ่ม recheck ก่อน download และยกเลิกเมื่อ component ถูกถอดจากหน้า/บัญชีระหว่างโหลด font ป้องกัน async download หลังออกจากบริบทเดิม
- แก้ Shared Action Required ไม่แสดงงานตรวจให้ Staff ขณะรอนักวิจัยแก้ข้อเสนอ/เอกสารปิด และแสดงงาน Staff เมื่อนักวิจัยส่ง revised report แล้ว ใช้ actor/task records เดิม ไม่เพิ่ม Workflow
- เพิ่ม integration tests บน record เดียว และ Local/backend reducer parity พร้อมระบุข้อยกเว้น temporary policy อย่างชัดเจน รักษา Design System เดิม

Files: `src/components/EvaluationPdfAction.jsx`, `src/pages/StaffPages.jsx`, `src/pages/ResearcherResults.jsx`, `src/utils/commonWorkspace.js`, `tests/workflowIntegrationV16.test.js`, `tests/phase5.browser.mjs`, `tests/phase2.browser.mjs`, `package.json`, `AGENTS.md` และรายงานนี้

Phase 2 Browser expectation เดิมที่ตรวจ PDF Service Pending ปรับเป็น released PDF enabled เพราะเชื่อม service แล้ว การดาวน์โหลดไฟล์จริงและไม่เปลี่ยน record ตรวจแยกใน Phase 5 integration

## Workflow Verification

อ้าง AGENTS.md, Requirements/State Specification v1.6, Audit 06 I01–I10, Temporary Decision `LOCAL_V16_OPEN04_OPEN13.md` และรายงาน Phase 0–4 ไม่แก้เอกสารข้อกำหนดหรือยกระดับ DESIGN/OPEN

| Contract | ผลตรวจ |
|---|---|
| 9 states / TR-01–TR-17 | State IDs/17 contracts คงเดิม; CLOSED/CANCELLED แยก Terminal; TR-07/17 ทดสอบการปฏิเสธตาม OPEN |
| TR-01–06,08–09 | Local record เดียวตั้งแต่สร้าง/บันทึก/Ready/แก้จากต้นสังกัด/ส่งหลักฐานและ consent/Staff correction/ฉบับแก้/ตรวจผ่าน/acknowledgement/รับรอง; committee เพื่อทราบ, upload/save ไม่ advance |
| TR-10 | Staff external approved changes/extension; histories before/after; limits เดิม 2 × ≤6 months และ rejected/invalid cases ผ่าน regression; ไม่มี e-Office API |
| TR-11–12,14 | Publication ส่ง minimum bundle/ขอเพิ่มเติม/ตรวจ/Staff close โดยไม่มี assignment หรือ REPORT_EVALUATION |
| TR-13,15 | Report assignment exactly 3 unique, draft ไม่นับ, independent results, release 0–2/3 ถูกปฏิเสธ, 3/3 ครั้งเดียว; Researcher ก่อน release ไม่เห็นผล/PDF |
| TR-15–16 | Researcher ส่ง revised actual file คง REPORT_EVALUATION; ไม่ประเมินซ้ำ; Staff verify แล้วกด close แยก; assignments/evaluations ไม่เปลี่ยนย้อนหลัง |
| TR-17 | ไม่มี permission ใหม่ที่ได้รับการยืนยัน จึงปิด cancellation mutation ทุกโหมดต่อไป; read-only CANCELLED fixture/terminal guards คงเดิม ไม่ auto-cancel/delete |
| PDF / permissions | FR-REV-07, FR-COM-02, NFR-01/05: shared generator รายบุคคลจาก submitted data; own/assigned/released guards; post-CLOSED ยัง disabled |
| Notifications / history | FR-COM-05, FR-ADM-10, NFR-03: in-app recipients ตามสิทธิ์, close notification/read marker, shared audit actor/time/version/TR; ไม่เขียนทับประวัติหรืออ้างส่ง email |
| Local / Firebase | Reducer parity สำหรับคำสั่งร่วม; server copies byte-identical; HTTP transaction/profile guards และ private Storage upload verification ทดสอบใน Emulator |

## Tests

| Command / suite | Result |
|---|---|
| `npm test` | PASS 111/111 (เพิ่ม integration tests 3 จาก baseline 108) |
| `npm run test:phase5:browser` | PASS 25 checks; project เดียวผ่าน Staff → Reviewer 1/2/3 → Staff release → Researcher PDF/revised → Staff verify/close; PDF cancel เมื่อออกจากหน้า |
| `npm run test:phase5:api` | PASS HTTP 22 foundation + 33 Staff + 13 Reviewer = 68 requests |
| Firestore / Storage Emulator ACL | PASS 28 / 17 checks |
| Phase 2 / 3 / 4 Browser regression | PASS 29 / 42 / 21 checks |
| `npm run lint` | PASS |
| `npm run build` / Firebase-mode Vite build | PASS ทั้งสองโหมด ไม่ Deploy |
| PDF QA | Staff reviewer 1 / Researcher reviewer 2 จริงจาก UI อย่างละ 2 หน้า; extract ตรวจ identity/exact comments/ไม่ปนผลคนอื่น และ render ตรวจภาพครบ 4 หน้า |

Local Node integration เริ่มสร้าง project ใหม่จริง ส่วน Browser report integration เริ่มจาก fictional closure submission ที่มีอยู่ แล้วดำเนินงานข้ามบทบาทบน canonical record เดียว ไม่สร้าง fixture ใหม่ระหว่าง handoff HTTP foundation suite อัปโหลด revised PDF เข้า Storage Emulator จริง และปฏิเสธ missing object ก่อน attach; HTTP Staff/Reviewer tests ส่วนอื่นใช้ prepared fixtures ไม่อ้างว่าเริ่มจาก production submission จริง

Backend full flow จาก DRAFT ยังไม่เปิด TR-03 ตาม OPEN-04 จึงทดสอบ lifecycle ช่วงหลังจาก prepared baseline แทนการ bypass gate ความต่างนี้เป็น documented temporary Local Demo exception ไม่ใช่ parity failure

หลักฐาน: [Released Results](screenshots/phase5/released-results.png); PDF QA ใน `tmp/pdfs/phase5-staff.pdf`, `phase5-researcher.pdf` และ rendered PNGs โฟลเดอร์เดียวกัน ข้อมูลสมมติทั้งหมด

## Blockers / Remaining

- OPEN-04/13: trigger Ready และ field correction scope ใช้เฉพาะ Local Demo ตามคำสั่งเดิม Backend ไม่เปิดเอง; TR-07/OPEN-05 และ TR-17/OPEN-20 ยังปิด
- Official rubric OPEN-11/07, publication acceptance OPEN-14, standards blocker OPEN-17, calendar edge/reminder cadence OPEN-10, registry/Excel OPEN-19/21 และ PDF combined/retention/post-CLOSED ยังรอยืนยัน ไม่สร้างนโยบายใหม่
- PDF เป็น Demo layout จาก schema เดิม ไม่อ้างเป็น official signed evaluation template ไม่มี Email Service/e-Office API
- Build ยังเตือน chunks >500 kB; host Node 24 เทียบ Functions target 22 ยังไม่ใช่ production runtime/UAT verification
- ไม่มี Deploy, live migration หรือ Firebase จริงเปลี่ยนแปลง จบ Phase 5 และหยุดก่อน Phase 6
