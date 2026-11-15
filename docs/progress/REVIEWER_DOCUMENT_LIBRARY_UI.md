# X02 Reviewer Document Library — UI only

15 November 2026

- ReviewerDocumentLibrary.jsx/CSS ใช้ project heading, Reviewer sidebar/header และ underline tabs เดิม; แยก Assigned Research Report / My Submitted Evaluation เป็นสอง compact sections
- ใช้ permittedDocuments + ownAssignment/ownEvaluation เดิม แสดงชื่อ/ชนิด/เวอร์ชัน/วันที่/ผู้อัปโหลดจริง ไม่มีเอกสารของ Reviewer คนอื่น และไม่มี upload/delete
- Assigned report ใช้ preview query route เดิม พร้อม direct download ของ realPdfUrl ที่ได้รับสิทธิ์ และ link assigned-report → V02/V03 ตามสถานะเดิม
- ผลประเมินส่วนตัวแสดง entry เฉพาะ submitted และลิงก์ไป V05 สำหรับสร้าง/ดู/ดาวน์โหลดด้วย handler เดิม; post-CLOSED restriction ที่ V05 คงเดิม
- Query preview ของ own feedback เดิมยังใช้ได้หลัง permission filtering; feedback ที่ส่งแล้วอยู่ disclosure ในส่วน My Submitted Evaluation
- Early branch ใน ProjectDocuments เปิดเฉพาะ prop reviewerLibrary + canonical Reviewer ที่ SharedWorkspace documents route เท่านั้น Staff/Researcher และ embedded reader เดิมไม่เปลี่ยน

ไฟล์: src/pages/ReviewerDocumentLibrary.jsx/CSS, ProjectDocuments.jsx, components/SharedWorkspace.jsx และ tests/reviewerDocumentsUI.browser.mjs

PASS: Reviewer documents UI 52 checks (3 personas, submitted/pending entry, actual preview/download, no mutations, TH/EN desktop/tablet/mobile, unknown/unassigned denial, Staff/Researcher isolation); Common 44; Reviewer regression 21; cross-role integration 25; lint/build PASS (bundle warning เดิม)

Screenshots tmp/reviewer-documents-ui/ ตรวจภาพ desktop แล้ว อ้างอิง FR-REV-02/03/07 และ existing document permissions ไม่มี domain/backend/database/Firebase changes หรือ deployment
