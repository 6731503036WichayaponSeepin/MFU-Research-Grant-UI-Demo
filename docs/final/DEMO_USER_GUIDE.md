# Demo User Guide — v1.6

## Start

1. ใช้ dependencies ที่ติดตั้งแล้ว หรือ `npm ci` เมื่ออนุญาตให้ติดตั้ง จากนั้น `npm run dev`
2. เปิด localhost ที่ Vite แสดง เลือก **v1.6 — Canonical Demo (3 roles)**
3. เลือก Researcher / Staff / Reviewer; Reviewer 1–3 เป็น persona สมมติภายใต้บทบาทเดียว ไม่มีการสร้างบัญชี Firebase
4. สลับ TH/EN จาก Header/Entry; เมนู Account กลับไปเลือกบทบาทใน Local Demo

เริ่มต้นมี fictional records 14 รายการ ครบ 9 States, report/publication closure และผล 0/3–3/3 ยอดที่แต่ละบทบาทเห็นคำนวณจากสิทธิ์ ไม่จำเป็นต้องเท่ากัน Reset ต้องยืนยันและเปลี่ยนเฉพาะ canonical Local Demo namespace ไม่ใช่ Firebase หรือ legacy/private drafts

## Suggested scenarios

| Scenario | Start / actions |
|---|---|
| Proposal | Researcher `V16-DRAFT` → RS-1 Editor → Save → PDF & Affiliation → Generate/Save latest PDF → Confirm Ready เฉพาะ Local Demo → Signed Submission แนบ signed RS-1/affiliation evidence ของ version ปัจจุบันและยืนยัน signatures/consent |
| Staff review | Staff `V16-STAFF` → Proposal Review → Request Correction พร้อมเหตุผล/sections; Researcher แก้เฉพาะส่วนและแนบหลักฐานฉบับใหม่ → resubmit คง STAFF_REVIEW → Staff Pass |
| Acknowledgement | Staff `V16-COMMITTEE` → record external acknowledgement ก่อน แล้วจึง certify; ไม่มี committee account/approval API |
| External changes | Staff `V16-ACTIVE` → Change & Extension Records → บันทึกผลภายนอก approved/rejected พร้อม ref/reason/date; state คง IN_PROGRESS |
| Report end-to-end | Staff `V16-CLOSURE` → document check → assign Reviewer 1/2/3 → สลับแต่ละ persona บันทึกร่าง/Review Answers/Confirm → Staff Evaluation Tracking ครบ 3/3 จึง release → Researcher Results/PDF/revised upload → Staff verify และ close แยกกัน |
| Publication | Staff Dashboard เพิ่ม Staff Contract Fixtures → `V16-PUBLICATION-REVIEW` → check → publication close ไม่มี Reviewer; หรือ Researcher เพิ่ม Contract Fixtures → `V16-PUBLICATION-ACTIVE` เพื่อเริ่มส่ง minimum bundle |
| Prepared results | `V16-EVALUATION-0` ถึง `V16-EVALUATION-3` แสดงผล prepared 0/3–3/3; `V16-RELEASED` เปิดให้ Researcher ส่ง revised file; ป้าย fixture ไม่ใช่หลักฐานว่าผู้ใช้เคยทำงานจริง |
| Cancellation | `V16-CANCELLED` อ่าน terminal history; cancellation form ของ active project ทดลอง validation ได้ แต่ปุ่ม mutation ปิด OPEN-20 |

PDF ใช้ไฟล์จริง/ผลที่บันทึกแล้วเท่านั้น การ preview/download ไม่เปลี่ยน state นักวิจัยต้องรอ Staff release, Reviewer เห็นเฉพาะผลตน และ PDF หลัง CLOSED ยังคงปิด

เพิ่ม fixtures เป็น opt-in ตามปุ่มที่มี ID เดิมไม่ถูกเขียนทับ เพิ่มครบสองชุด namespace มี 22 records รวม negative ownership fixture; ไม่เปลี่ยนข้อมูลจริง การ reset ไม่ได้ล้าง private working drafts ทุก key อย่าใช้เป็นขั้นตอนลบข้อมูลผู้ใช้

## Troubleshooting / boundaries

- Version conflict: reload ข้อมูลล่าสุดแล้วตรวจใหม่ ห้ามกดยืนยันแทน record ใหม่โดยไม่ตรวจ
- Missing file/invalid PDF: ใช้ PDF จริงตาม adapter ปัจจุบัน (2 MB attachment) การ Extract RS-1 มีขอบเขต adapter แยก; ไม่รองรับ OCR ที่ไม่ได้ยืนยัน
- Unsaved prompt: Cancel อยู่หน้าเดิม; Accept เปลี่ยนหน้าและเก็บ working copy ตามขอบเขต browser File objects ที่ยังไม่อัปโหลดอยู่ memory อาจต้องเลือกใหม่หลัง reload
- Fixture references ที่แก้ใน Phase 6 ใช้กับการสร้าง/reset ใหม่ ไม่ migrate local data เดิม
- Firebase mode (`npm run dev -- --mode firebase`) ใช้บัญชีที่ provision ไว้และ server profile เท่านั้น ไม่มี public registration/role picker; คู่มือนี้ไม่อนุญาต live setup/seed/deploy

ดู [Known Issues](KNOWN_ISSUES.md) ก่อนสาธิต OPEN policies และอย่าเรียก Demo ว่า stakeholder-approved production system
