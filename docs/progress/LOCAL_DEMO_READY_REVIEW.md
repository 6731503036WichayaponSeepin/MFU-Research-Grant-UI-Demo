# Local Demo — Reviewed incomplete proposal

16 พฤศจิกายน 2569: ตามคำสั่งผู้ใช้ล่าสุด อนุญาต TR-03 ใน Local Demo แม้ข้อมูลไม่ครบ เมื่อติ๊ก “ฉันตรวจสอบข้อมูลแล้ว และยืนยันว่าข้อมูลที่กรอกถูกต้อง” และยืนยันใน modal

- `ResearcherProposalPDF.jsx`: ข้อผิดพลาด completeness เป็นข้อมูลแนะนำ เพิ่ม checkbox ผูกกับ project/version และสร้าง/แนบ PDF ล่าสุดให้อัตโนมัติเมื่อยืนยันถ้ายังไม่มี ไม่สร้างข้อมูลที่เว้นว่างเอง
- `domain/actions.js` และ server mirror: TR-03 คง owner/state/latest PDF/confirmation/audit guards รวม image signature consent; ผ่อน completeness เฉพาะ Local Demo ที่ได้รับอนุญาตอยู่แล้ว Backend TR-03 ยังปิด และ TR-05/TR-06 ไม่ถูกผ่อน
- แก้ temporary decision ใน `docs/decisions/LOCAL_V16_OPEN04_OPEN13.md`; ไม่แก้ Requirements เป็น CONFIRMED และไม่เปิด TR-07
- Tests: เพิ่ม incomplete-ready unit/browser cases และเพิ่ม checkbox interaction ใน Phase 2 / cross-role tests เดิม

PASS: 123 unit tests; Incomplete Ready browser 7 checks; Phase 2 browser 29 checks; cross-role browser 55 checks; lint/build/diff check ผ่าน (build มี chunk-size warning เดิม)

กรณีทดสอบจริง: กรอกเฉพาะชื่อโครงการ → Save Draft → checkbox → ยกเลิก modal โดยไม่เปลี่ยนสถานะ → ยืนยันอีกครั้ง → PDF ถูกสร้าง/เก็บ → AFFILIATION_REVIEW พร้อม actor/time และค่าว่างยังคงเดิม

อ้างอิง FR-RES-09–11, TR-03 และ temporary user decision ฉบับแก้ไขนี้; เงื่อนไขส่ง signed RS-1/หลักฐานต้นสังกัดและ consent ตาม FR-SIG-01–06 / TR-05 คงเดิม ไม่มี deploy, git push หรือ live Firebase changes
