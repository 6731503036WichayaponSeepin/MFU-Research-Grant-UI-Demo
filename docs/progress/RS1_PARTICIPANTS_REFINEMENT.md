# RS-1 Part A / 1. The researcher(s)

16 พฤศจิกายน 2569 — ตามคำสั่งผู้ใช้และ RS-1 ต้นฉบับหน้า 1

- แสดง 1.1 Project Leader และ 1.2 Project Participant แยกกันเสมอ แต่ละคนมีชื่อ สังกัด โทรศัพท์/มือถือ E-mail และสัดส่วนความรับผิดชอบ รองรับ Add/Remove ผู้ร่วมโครงการหลายคน หัวหน้าโครงการยังมีเพียงคนเดียว
- `participantRecords` เป็น array ของ `{name,affiliation,phone,email,percent}` รองรับแถวว่าง ไม่เพิ่มฟิลด์บังคับ ใช้ช่วง percentage เดิมเท่านั้น
- คง first-participant aliases `participantName/Affiliation/Phone/Email/Percent` และข้อความ `participants` เดิม ไม่เดาชื่อจาก free text ไม่ auto-migrate ข้อมูลจริง การลบผู้ร่วมโครงการจากฉบับปัจจุบันไม่ลบ version history
- รองรับ private draft/reload, preview, PDF ทุกคนพร้อมเลข 1.1/1.2, Staff Review และ required signatories ใช้ชื่อจริงจาก structured rows
- Extraction แยก repeated participant sections; หน้าตรวจข้อมูลนำเข้าแก้คนที่สองและส่งต่อเข้า manual form ได้ ทดสอบด้วย DOCX สมมติที่ `tests/fixtures/rs1-multiple-participants.docx`
- Correction อนุญาต array/aliases เฉพาะ coResearchers ตามสิทธิ์เดิม เปรียบเทียบ array ตามเนื้อหาเพื่อไม่ปฏิเสธ array ที่ไม่เปลี่ยน ไม่ขยายสิทธิ์ไปยังหัวข้ออื่น Backend mirror ใช้ model/validation เดียวกัน

ไฟล์หลัก: `ManualEntry.jsx`, `UploadDocument.jsx`, `generateRS1PDF.js`, `StaffProposalReviewView.jsx`, `rs1Participants.js`, `rs1FieldMapping.js`, domain model/actions/localDemoPolicy, proposalValidation, CSS และ server-domain sync

อ้างอิง FR-RES-02–08/10/16–17, FR-SIG-03, NFR-01–03/05–07, TR-02/04/06; mapping นี้ตามคำสั่งผู้ใช้ ไม่ปิด OPEN ระดับระบบหรือเปลี่ยน transition

PASS: 126 unit tests; browser 7 suites รวม 453 checks (Phase 2 29, researcher fields/recovery 242, RS-1 alignment 28, Staff proposal review 19, cross-role 55, manual UI 63, multiple participants 17); lint/build/diff check ผ่าน มี build chunk warning เดิม

ทดสอบจริง: 2 คน → reload → review/save → canonical version → PDF/Staff/signers; remove คนแรกคงคนที่สอง; remove ทั้งหมดคงหัวข้อว่าง; DOCX → แก้ชื่อคนที่สอง → manual transfer; unrequested correction Add ถูกล็อก; responsive 768/390

ไม่มี live Firebase changes, deploy หรือ git push
