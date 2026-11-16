# R06 — Signed Proposal Submission refinement

16 พฤศจิกายน 2569

- แยก Signed RS-1, หนังสือเห็นชอบจากต้นสังกัด และ supporting documents โดยใช้ ResearcherFiles เดิม/ข้อมูลชุดส่งเดียวกัน ไม่เปลี่ยน kind หรือ validation
- ย้ายภาพลายเซ็น รายการตรวจผู้ลงนาม และ consent อยู่ใน Signed RS-1 เท่านั้น ใช้บทบาท TH/EN และชื่อ/คำอธิบายจริงจาก RS-1
- หนังสือเห็นชอบจากต้นสังกัดรับรายงานประชุม **หรือ** หนังสือ/เอกสารยืนยันเหมือนเดิม ไม่บังคับสองฉบับ
- R06 แสดง consent checkbox เฉพาะ `usesOthers=yes` ใช้คำยืนยันเดียวกับ submission เดิม; กรณีลายเซ็นตนเองต้องประกาศ `no` ก่อนสร้าง PDF ไม่อ้างว่าได้ยืนยันตัวตน
- ลบ raw role, TR/OPEN/adapter terminology จากหน้าส่งนี้ Shared components ใช้ optional presentation props จึงไม่เปลี่ยนหน้าอื่น
- คง permissions, version references, correction scope, signed-document checks และ TR-05/TR-06 guards; upload/generate ไม่เปลี่ยนสถานะ ไม่มี Backend/live Firebase changes

ไฟล์หลัก: `ResearcherSubmission.jsx`, `ResearcherFiles.jsx`, `SignatureImages.jsx` และ browser tests ที่ปรับ scope ของ upload controls ให้ตรงกับส่วนเอกสารใหม่

อ้างอิง FR-RES-13–17, FR-SIG-01–06, BR-03–04/11–12, TR-05–06; OPEN-15/16 คงเดิม

PASS: 123 unit tests; Phase 2 browser 29, cross-role 55, RS-1 alignment 28, submission signatures 17 checks (รวม 129); lint/build/diff check ผ่าน Build มี chunk-size warning เดิม ไม่มี deploy/git push

หลักฐาน: `docs/progress/evidence/final-e2e/results.json` และ logs ของ suites ข้างต้น
