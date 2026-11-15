# V04 Evaluation Review & Submit — UI only

15 November 2026

- เพิ่ม ReviewerEvaluationReview.jsx/CSS: project/ref/status, 3-step indicator, responsive 65:35, read-only criteria/comments/result, reviewer/report metadata และ validation/confirmation panel
- ใช้ evaluationRows และตัวเลือก rubric เดิมครบ ไม่มีคะแนน 1–5 ใหม่ตาม mockup; TH/EN presentation translations ไม่เปลี่ยน criteria หรือคำตอบ
- ReviewerPages ส่ง draft, validation และ action JSX เดิมเข้า view; snapshot confirmation, busy lock, capability checks และ submit handlers ไม่เปลี่ยน
- Return/Edit ใช้ route evaluation เดิมและ draft key เดิม กลับ split-screen พร้อมคำตอบ; V05 ไม่เปลี่ยน
- คงคำอธิบาย one round, submitted lock, staff release ก่อน researcher visibility และไม่ปิดโครงการอัตโนมัติ พร้อม rubric OPEN-11 notice

PASS: V04 UI 17 checks (invalid/valid submit, all comments, read-only, progress, TH/EN 1440/768/390, no mutation, Return to Edit, cancel confirmation); Reviewer regression 21; cross-role integration 25; lint/build PASS, bundle warning เดิม

ปรับ tests/phase4.browser.mjs ให้อ่านคำตอบจากหลาย read-only sections แทน locator เดียว (assertion เนื้อหาเดิม); เพิ่ม tests/reviewerReviewUI.browser.mjs Screenshots อยู่ tmp/reviewer-review-ui/ ตรวจภาพ desktop แล้ว

ไม่แก้ backend/database/Firebase หรือ deploy
