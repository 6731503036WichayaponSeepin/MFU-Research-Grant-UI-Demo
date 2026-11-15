# V02/V03 Unified Evaluation Workspace

15 November 2026 — UI only

- งานที่ยังประเมินได้เปิด PDF ที่ได้รับมอบหมายและแบบประเมินเดิมร่วมกันทั้ง route `assigned-report` และ `evaluation`; reader สำหรับงานที่ล็อกแล้วคงเดิม
- เริ่ม 50:50 พร้อม pointer/keyboard resizable divider (30–70%, Home คืน 50%); PDF และ form มี scroll แยก, small screens stack
- ใช้ DocumentPreview และ controls เดิม; เลือกได้เฉพาะ assigned report ที่ผ่าน permittedDocuments ไม่มีไฟล์จำลองแทนไฟล์ที่เข้าไม่ได้
- Fields, conditional details, validation, attachments, draft key, save/confirm handlers และ submit logic เดิมครบ; Save Draft/Review Answers อยู่ bottom action bar ของแผงแบบประเมิน
- V04/V05 read-only/review/confirmation branches เดิม; ไม่มีการเปลี่ยน permissions, data model, backend หรือ Firebase

ไฟล์: `src/pages/ReviewerPages.jsx`, `ReviewerEvaluationWorkspace.jsx`, `ReviewerEvaluationWorkspace.css`, presentation class ใน `src/components/SharedWorkspace.jsx`; `tests/reviewerEvaluationUI.browser.mjs` และปรับ selector ใน `tests/phase4.browser.mjs` ให้ตรวจ inline viewer แทน document-list link

PASS: split UI 25 checks (two-page PDF controls, draft persistence/reload/V02–V03 navigation, pointer/keyboard resizing, independent form scrolling, sticky actions, TH/EN desktop/tablet/mobile, unassigned denial); Reviewer regression 21; cross-role integration 25; lint/build PASS พร้อม bundle warning เดิม

Multi-page PDF สร้างเฉพาะใน isolated browser local fixture เพื่อทดสอบ ไม่เขียนทับ seed หรือไฟล์จริง Screenshot: `tmp/reviewer-evaluation-ui/` ตรวจภาพ desktop แล้ว Test fixture URL ครั้งแรกไม่ตรง adapter format จึงแก้ test data URL และรันทวนผ่าน ไม่แก้ file validation ของระบบ

อ้างอิง FR-REV-02–08; คง rubric OPEN-11 ไม่มีการนำเกณฑ์ตัวเลขใน mockup มาแทนแบบประเมินเดิม ไม่ deploy
