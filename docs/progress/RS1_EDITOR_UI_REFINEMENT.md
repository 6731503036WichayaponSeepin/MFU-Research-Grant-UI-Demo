# RS-1 Preparation & Revision Editor — UI only

16 November 2026

- หน้า manual ใช้หัวข้อ “จัดทำและขอแก้ไขข้อเสนอโครงการ” / “Proposal Preparation & Revision” และ subtitle “แบบฟอร์ม RS-1 ทุนวิจัยส่วนตัว” พร้อม TH/EN
- ซ่อน project tabs เฉพาะ Researcher manual; แสดง actual status และ correction instructions/actor/date/allowed sections เดิม
- แบบฟอร์มเต็ม content width, ลด card/section spacing, คง 4 sections และ 72 fields แบบ continuous scrolling
- Sticky bottom bar ใช้ Save Draft / Review / Back / Confirm Review handlers เดิมตาม editing/review context พร้อมข้อความ preparation/correction ไม่เพิ่ม submit หรือเปลี่ยน workflow
- คง capability/field restrictions, private draft keys, validation, proposal versions และ routes เดิม; upload และหน้าอื่นไม่เปลี่ยน

ไฟล์: components/SharedWorkspace.jsx, pages/ResearcherEditor.jsx, ManualEntry.jsx, ResearcherManualEntry.css และ tests/researcherManualUI.browser.mjs

PASS: Manual UI 63 checks (preparation/correction, 72 fields, actual status/instructions, field locks, TH/EN responsive, full width, sticky actions ขณะเลื่อนเข้า editor, no mutation, tabs retained elsewhere); Researcher regression 29, field/recovery 168, navigation 61, full cross-role E2E 55 รวม affected browser 376 checks; lint/build PASS พร้อม bundle-size warning เดิม

แก้ inherited width cap ด้วย scoped CSS specificity; mobile test เลื่อนเข้า form ก่อนตรวจ sticky footer เพื่อคง sidebar/header layout เดิม Screenshots: tmp/researcher-manual-ui/

ไม่มี domain/permission/backend changes, deployment หรือ git push
