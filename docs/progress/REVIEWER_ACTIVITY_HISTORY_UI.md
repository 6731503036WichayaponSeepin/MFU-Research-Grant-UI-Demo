# X03 Reviewer Activity & History — UI only

15 November 2026

- เพิ่ม ReviewerActivityHistory.jsx/CSS: project heading, underline tabs เดิม, assignment/submission/status summary และ read-only vertical timeline พร้อม title/description/actor/localized timestamp
- อ่าน authorized projection เดิม กรองการแสดงผลเฉพาะ actual assign_reviewers และ save_evaluation/submit_evaluation/attach_document ของ UID ปัจจุบัน; ไม่แสดง notes ของ assignment/internal Staff records หรือกิจกรรมผู้ประเมินคนอื่น
- เรียงสำเนา events ด้วย recorded timestamp ล่าสุดก่อน โดยคงลำดับย้อนกลับเดิมเมื่อเวลาเท่ากัน ไม่มีการแก้ audit records หรือสร้าง assignment event จาก metadata
- คงข้อมูลสถานะเดิม/ใหม่และ record version ใน details ภาษา TH/EN; ไม่เปิด raw staff payload
- ActivityHistory early branch เปิดเฉพาะ canonical Reviewer ผ่าน presentation props จาก SharedWorkspace; Staff/Researcher และ domain permissions ไม่เปลี่ยน

ไฟล์: src/pages/ReviewerActivityHistory.jsx/CSS, ActivityHistory.jsx, components/SharedWorkspace.jsx และ tests/reviewerHistoryUI.browser.mjs

PASS: Reviewer History UI 67 checks (3 personas; pending/draft/submitted actual events, exact count/order/timestamps, non-mutation, no synthetic events when history empty, TH/EN desktop/tablet/mobile, unassigned denial และ Staff/Researcher isolation); Common 44; Reviewer regression 21; cross-role integration 25; lint/build PASS (bundle warning เดิม)

Screenshots tmp/reviewer-history-ui/ ตรวจภาพ desktop แล้ว ไม่มี business logic/backend/database/Firebase changes หรือ deployment
