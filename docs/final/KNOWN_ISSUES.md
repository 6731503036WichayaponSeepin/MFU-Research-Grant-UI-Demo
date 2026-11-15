# Known Issues — Final v1.6

วันที่ 15 November 2026; ไม่ถือว่าไม่มีปัญหาเพียงเพราะ executable tests ผ่าน

| Status | Issue / scope |
|---|---|
| BLOCKED | OPEN-04 TR-03 production trigger; Local Demo Confirm Ready ผ่านตาม temporary decision เท่านั้น |
| BLOCKED | OPEN-13 production correction field policy; Local scoped edit ผ่าน แต่ Backend ไม่เปิดตาม Demo |
| BLOCKED | TR-07/OPEN-05 กลับขอความเห็นชอบใหม่ และ TR-17/OPEN-20 cancellation authority ไม่เปิด positive mutation |
| BLOCKED | Official RS-1/แบบประเมิน/เกณฑ์ 2569/Excel data dictionary ไม่ได้แนบครบ; OPEN-01/02/03/06/07/11/14/15/16/17/21 ไม่อนุมานจาก Demo |
| BLOCKED | Research standards types/actor/mandatory metadata/warn-or-block ยัง OPEN-17; ปัจจุบันแสดงข้อมูลและไฟล์ได้บางส่วน |
| BLOCKED | รอบรับสมัคร/registry removal/month-end duration/reminder cadence OPEN-09/10/18/19; ไม่ auto-cancel/delete หรือเดา Excel enums |
| BLOCKED | Combined evaluation PDF, retention และ PDF หลัง CLOSED ยังไม่ยืนยัน; รายบุคคลก่อนปิดตามสิทธิ์ทำงานแล้ว |
| NOT TESTED | Production Firebase, live migration, deployment, real e-Office/manual approval, official signatures, email delivery และ UAT; ไม่ได้ดำเนินการตามขอบเขตงาน |
| NOT TESTED | Cloud Node 22 runtime, production load/performance, cross-browser Safari/Firefox, full screen-reader/WCAG certification, penetration/security audit |
| NOT TESTED | Historical `demo.browser.mjs` / `navigation.browser.mjs`, advisor/reviewer-example and legacy full Firebase suites ไม่ใช่ canonical v1.6 acceptance runner; มี assertions เกี่ยวกับ UI/workflow เก่า ไม่อ้างว่า pass จากผลรุ่นก่อน |
| PASS | ป้องกัน OPEN transitions, role/owner/workspace/assignment ACL, submitted immutability, 3/3 release, terminal guards และไม่ลบประวัติ ตาม current tests |

## ข้อจำกัดที่ยังมี

- Build มี warning chunks >500 kB; ยังไม่รับรอง performance threshold ที่ OPEN
- Local Demo เป็น permission simulation; ผู้ใช้ควบคุม localStorage ได้เอง ไม่ใช่ security boundary ของระบบจริง Backend ใช้ Firebase Auth + server profile + protected projections/Storage rules
- PDF/RS-1 import ใช้ adapter/mapping Demo เดิม ไม่ใช่ OCR หรือการรับรองว่าเหมือนเอกสารทางการทุกฟิลด์/ทุก layout
- หลายข้อความแบบประเมินเป็นไทยแม้เลือก EN เพื่อรักษา rubric เดิม; controls/context รองรับสองภาษา ยังไม่มีคำแปล rubric ที่ Stakeholder ยืนยัน
- Legacy dataset เก็บ compatibility/history แยก ไม่ถือว่า conform v1.6 และไม่ auto-map status
- Fixtures consent references แก้ในตัวสร้างแล้ว ข้อมูล local เดิมที่เคยบันทึกไว้ไม่ถูกแก้อัตโนมัติ หากต้องการตัวอย่างใหม่ให้ใช้ explicit Reset เฉพาะ namespace สมมติ
- พบ FAIL ระหว่างพัฒนา/แก้ tests ใน phase ก่อนหน้าไม่ใช่ผล final run; ผล final PASS/FAIL จริงอยู่ JSON/logs ถัดไป หาก evidence เปลี่ยน ให้ใช้ผลล่าสุดและรันตรวจใหม่

ไม่มี unresolved executable FAIL ใน final maintained suites ณ รอบนี้; 27 FRs ยัง BLOCKED ทั้งหมด/บางส่วน ดู [Matrix](REQUIREMENT_TRACEABILITY_MATRIX.md) ไม่แปลงเป็น PASS เพราะ negative guard ผ่าน
