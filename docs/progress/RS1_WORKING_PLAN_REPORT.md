# RS-1 Section 12 — Dynamic Working Plan

16 พฤศจิกายน 2569 — Local Demo, Requirements v1.6

## Changes

- รักษาหัวข้อ/คำแนะนำ RS-1 เดิม รวมข้อจำกัด 2 ปีและข้อความ e-Office; PDF คงคอลัมน์ Task / Period
- เพิ่ม/ลบงานได้ไม่จำกัด 3 แถว แต่ละงานมีชื่อ วันเริ่มอัตโนมัติ และวันสิ้นสุดแบบ date picker
- งานแรกเริ่มตาม project start; งานถัดไปเริ่มวันที่สิ้นสุดงานก่อนหน้า ไม่บวกหนึ่งวัน เปลี่ยนวัน/ลบงานแล้วคำนวณ chain ใหม่ ไม่แก้วันสิ้นสุดที่ผู้ใช้กรอกเอง
- ตรวจ valid calendar dates, ลำดับเวลา, project boundaries และระยะเวลาโครงการไม่เกิน 2 ปีแบบ calendar years รวม leap day; ไม่เปลี่ยนหลักเกณฑ์ขยายเวลาภายนอกหรือยกเลิกอัตโนมัติ
- Gantt ใช้ตำแหน่ง/ความยาวจากวันที่จริง พร้อม localized dates, TH/EN และ responsive layout
- Draft ยังเก็บข้อมูลที่กรอกไม่ครบได้ แสดง validation และใช้ final proposal validation เดิม ไม่เปลี่ยน temporary Confirm Ready decision

## Data / compatibility / permissions

`proposal.workTasks[] = { name, startDate, endDate, legacyPeriod? }` — startDate คำนวณจาก project start/previous end ไม่ใช้ค่าที่ส่งมาเป็นวันที่อิสระ

อ่าน legacy workTask1–3/workPeriod1–3 โดยไม่ migrate ข้อมูลจริง ไม่เดาวันที่จากข้อความ เช่น January–March 2027; แสดงและเก็บ original period ให้ผู้ใช้กำหนดวันที่เอง เมื่อแก้ไขจะ sync aliases 3 แถวแรกเพื่อ compatibility แต่ array/version เก็บทุกแถว การลบทั้งหมดไม่ดึง aliases เก่ากลับมา

รองรับ DOCX Task/Period หรือ Task Name/Start Date/End Date ทุกแถว และ date ranges ใน PDF ที่ระบบสร้าง; ไม่รับรอง OCR/ arbitrary document layout ตาม OPEN เดิม Import ยังต้องผู้ใช้ตรวจและยืนยัน

Private draft recovery, import review/transfer, correction, read-only review, PDF และ Staff Proposal Review ใช้ helper/component เดียวกัน สิทธิ์ researchPlan เดิมครอบคลุม workTasks; เมื่อไม่ได้รับสิทธิ์ ห้ามเพิ่ม/ลบ/แก้งานทั้ง UI และ domain guard ไม่เพิ่ม role หรือ transition

## Files

- ใหม่: src/utils/rs1WorkPlan.js, src/components/RS1WorkPlan.jsx/.css, tests/rs1WorkPlan.test.js และ .browser.mjs
- แก้: ManualEntry, RS1DocumentForm, UploadDocument, rs1FieldMapping, generateRS1PDF, proposalValidation, model, localDemoPolicy, rs1Document และ server mirror/sync
- ปรับ regression assertions ที่เคยผูกกับ fixed task controls ให้ตรวจ static source fields และ dynamic tasks แยกกัน ไม่ skip coverage
- test-final-e2e.mjs เพิ่ม opt-in local-resource transport สำหรับ runtime networking error โดย default runner คงเดิม

Traceability: FR-RES-02–10, FR-RES-16/17, FR-ADM-01–05, NFR-03/06; source RS-1 A12; TR-02/04/06 ใช้ guard เดิม ไม่เพิ่มสถานะหรือ workflow; OPEN-01–03/04/05/13 ไม่เปลี่ยนเป็น CONFIRMED

## Actual results

| Result | Test |
|---|---|
| PASS | Unit 138/138 รวม 4 working-plan tests: chains/removal, date boundaries/leap years, legacy/import, correction/version guards |
| PASS | Working-plan browser 38 checks: 5 tasks, automatic dates, validation, Gantt, reload, preview, PDF, actual PDF re-upload/review/transfer, original DOCX, Staff read-only, TH/EN at 1440/768/390 |
| PASS | Cross-role 55, Researcher flow 162, Manual UI 63, strict RS-1 203, alignment 28, budget 22, Staff Proposal Review 19 checks — รวม 8 affected browser suites |
| PASS | PDF page 3 render ตรวจจริง มีงาน 5 รายการและช่วงวันที่ครบ ไม่ทับ/ตัดข้อความ |
| PASS | Final lint / build; build มี bundle-size warning เดิม |
| BLOCKED | Direct Chrome transport บางรอบ: ERR_NETWORK_ACCESS_DENIED ระหว่างโหลด local Vite dependencies/document ก่อนเปิด UI |
| NOT TESTED | Browser suites อื่นไม่ได้รันใหม่ในงานนี้; Firebase emulator/live และ deployment |

Browser รอบผ่านใช้ `MFU_BROWSER_LOCAL_SCRIPT_PROXY=1`: Playwright รับ bytes จาก local Vite HTTP จริงผ่าน Node fetch เฉพาะ static resources; ไม่ mock ข้อมูล/handler/API ไม่ retry หรือ skip assertions ปิด HMR เฉพาะ test server ค่า default ไม่เปลี่ยน เก็บ failed startup attempts ใน previousRun ของ results เพื่อแยก environment failure จากผล workflow จริง

ระหว่างตรวจพบ temporary dependency caches ใต้ tmp ถูก ESLint สแกน ย้าย cache ไป node_modules/.vite-tests ลบเฉพาะ cache ที่สร้างในงานนี้ แล้วรัน final lint/build ใหม่ผ่าน

หลักฐาน: [browser results](evidence/rs1-work-plan/browser-results.json), [unit](evidence/rs1-work-plan/unit.log), [lint](evidence/rs1-work-plan/lint.log), [build](evidence/rs1-work-plan/build.log), [UI](evidence/rs1-work-plan/desktop.png), [PDF](evidence/rs1-work-plan/tasks.pdf), [render](evidence/rs1-work-plan/pdf-page-3.png) และ suite logs ใน directory เดียวกัน

ไม่มี Firebase data writes, deploy, migration หรือ git push
