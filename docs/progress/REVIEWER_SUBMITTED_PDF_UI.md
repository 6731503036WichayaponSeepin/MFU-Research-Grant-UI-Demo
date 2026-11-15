# V05 My Submitted Evaluation PDF — UI only

15 November 2026

- เพิ่ม ReviewerSubmittedEvaluation.jsx/CSS: responsive 70:30, project/ref/submitted badge, compact saved/locked success message, PDF preview และ submission metadata/download/return navigation
- คง on-demand PDF handler/generator เดิม: Download PDF สร้างจาก capability-checked submitted snapshot, ตรวจสิทธิ์ซ้ำหลัง async generation, ดาวน์โหลดและส่ง bytes ชุดเดียวกันเข้า preview ผ่าน optional presentation callback
- Preview เริ่มแสดงหลังผู้ใช้กด Download PDF ไม่สร้างไฟล์อัตโนมัติเมื่อเปิดหน้า; ใช้ DocumentPreview controls เดิม พร้อม revoke preview object URL เมื่อเปลี่ยนไฟล์/ออกหน้า
- คำตอบ/ไฟล์ข้อเสนอแนะเดิมอยู่ใน read-only disclosure; ไม่สร้างลายเซ็น ไม่แสดงผลคนอื่น ไม่เปลี่ยน permissions/production contracts หรือ PDF content เดิม
- Post-CLOSED PDF ยังปิดตาม OPEN policy และไม่แสดง cached preview เมื่อ capability ไม่อนุญาต

ไฟล์: src/pages/ReviewerPages.jsx, ReviewerSubmittedEvaluation.jsx/CSS, optional callback/button label ใน src/components/EvaluationPdfAction.jsx, tests/reviewerSubmittedUI.browser.mjs; tests/phase4.browser.mjs เปลี่ยนเฉพาะชื่อปุ่มเป็น Download PDF

PASS: UI 46 checks (3 personas/own snapshot, real PDF bytes/preview, read-only/no mutation, TH/EN 1440/768/390, assigned-review return, unsubmitted/unassigned denial, post-CLOSED restriction); Reviewer regression 21; cross-role integration 25; unit 116/116; lint/build PASS (existing bundle-size warning)

Lint รอบแรกพบ unused displayDate หลังย้าย view; ลบ import และรันทวนผ่าน Screenshots tmp/reviewer-submitted-ui/ ตรวจภาพ desktop แล้ว

อ้างอิง FR-REV-06/07/08 และ OPEN-11 / post-CLOSED access ที่ยังไม่ยืนยัน ไม่มี backend/database/Firebase changes หรือ deployment
