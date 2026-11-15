# Staff User Flow Validation

วันที่ตรวจ: 15 พฤศจิกายน 2026 — Local Demo เท่านั้น

## ผลและการแก้ไข

ตรวจ source, เอกสารต้นฉบับ v1.6 วันที่ 14 November 2026 ใน `C:/Users/User/Downloads/เอกสารความต้องการ/` (Requirements, Workflow, User Flow, Use Case Specification, State Transition Diagram), AGENTS.md, Design System และ Temporary Decision OPEN-04/OPEN-13 แล้ว

ไม่พบ functional gap ที่ยืนยันได้จากชุดทดสอบครั้งนี้ จึงไม่แก้ Application/Domain/Backend หรือเปลี่ยน UI เพิ่มเติม งาน UI ที่มีอยู่ก่อนเริ่มตรวจคงไว้ ไม่ใช่การเปลี่ยนแปลงใหม่ของงานนี้

- แก้ stale assertions ของ Common/Staff regression ให้ตรง UI ปัจจุบัน: navigation 2 เมนู, actual-history timeline, localized labels, extension tab, cancellation radio และเปิด records disclosure ก่อนตรวจ record
- เก็บ browser checks รายหน้าไว้ใน `tests/staff-ui/` จำนวน 12 ไฟล์ เพิ่ม runner `scripts/test-staff-ui.mjs` และคำสั่ง `npm run test:staff:ui` เพื่อรันทวนได้
- ย้าย output screenshots ของ Common/Staff regression ไป `tmp/` ป้องกันเขียนทับหลักฐานรอบเก่า
- ไม่มีการลด workflow assertions หรือเปิดใช้ OPEN policy เพื่อให้ทดสอบผ่าน

## Coverage

| หน้า | ผล | สิ่งที่ตรวจ / อ้างอิง |
|---|---|---|
| S01 Dashboard | PASS | 11 counts เทียบ canonical queues, summary, links, TH/EN, desktop/mobile; FR-ADM-01/08 |
| S02 Registry | PASS | search, status/queue/sort, pagination/count, project access, responsive; FR-ADM-01/08 |
| S03 Proposal Review | PASS | proposal fields, signed RS-1/evidence/consent, correction sections/reason, explicit pass; FR-ADM-02–05, TR-06/08 |
| S04 Acknowledgement/Certification | PASS | records/documents, acknowledgement ก่อน certification, actor/date, explicit transition; FR-ADM-06/07, TR-09 |
| S05 Change/Extension | PASS | external outcome, before/after/history, denied outcome ไม่เปลี่ยนค่า, 2 ครั้ง/ครั้งละไม่เกิน 6 เดือน, same state; FR-ADM-09, TR-10 |
| S06 Closure Review | PASS | actual file preview/download, request additional docs, submission history, path-specific check/actions; FR-CLS-01–08, TR-11/12/13/14 |
| S07 Reviewer Assignment | PASS | exactly 3 unique active reviewers, duplicate/missing selection blocked, report/draft recovery/confirmation; FR-REV-01, TR-13 |
| S08 Evaluation Tracking | PASS | 0/3–3/3, draft ไม่นับ, individual submitted PDF, release once เฉพาะ 3/3, permissions; FR-REV-02–10, TR-15 |
| S09 Final Verification | PASS | original/latest versions, release/revised report gates, verify ไม่ปิดอัตโนมัติ, explicit close, external notice/history; FR-CLS-09–12, TR-16 |
| S10 Cancellation | PASS / BLOCKED | reason/OTHER validation, preview ไม่ mutate, terminal read-only; actual cancellation BLOCKED OPEN-20, TR-17 |
| X01 Overview | PASS | actual history/conditional paths, 14 fixture records, role-specific actions/doc count, no Staff leakage; FR-ADM-08, TR-01–17 display/guards |
| X02 Documents | PASS | permitted real fixture PDF files, preview/download, no state mutation |
| X03 Activity | PASS | chronological records, actor/date, state changes, before/after, external references preserved |
| X04 Notifications | PASS | unread indicators, mark-all/reload persistence, project links, existing tasks/deadlines retained |

Browser workflow ใช้ทั้ง prepared scenarios และ shared project ส่งต่อข้าม 3 บทบาท; unit integration ตรวจ shared record ตั้งแต่ proposal/correction/certification ถึง publication closure และ report/release/revised report/explicit closure ไม่อ้างว่าทุก scenario รันจากหน้าเริ่มต้นใน browser เดียว

## Test Results

| ชุดตรวจ | ผลล่าสุด |
|---|---|
| `npm test` | PASS 115/115 |
| `npm run test:staff:ui` | PASS 390 checks / 12 suites |
| Common browser (Phase 1) | PASS 44 checks; no external requests |
| Researcher browser (Phase 2) | PASS 29 checks |
| Staff browser (Phase 3) | PASS 42 checks |
| Reviewer browser (Phase 4) | PASS 21 checks |
| Cross-role integration browser (Phase 5) | PASS 25 checks |
| `npm run lint` | PASS |
| `npm run build` | PASS; existing bundle-size warning >500 kB |
| Firebase emulator / real authentication / live persistence | NOT TESTED ในรอบนี้; Local Demo scope |
| Stakeholder UAT / real signed documents / delivery of actual email | NOT TESTED |

Common regression รอบแรก FAIL เพราะ selector `.shared-timeline` ล้าสมัย หลังแก้เป็น `.so-timeline` และ labels/menu ปัจจุบัน รันทวน PASS 44/44 โดยไม่แก้พฤติกรรม Application

หลักฐานราย suite: `docs/progress/evidence/STAFF_UI_VALIDATION.json`; screenshots จาก UI checks และ regression อยู่ใน `tmp/` (ไม่ใช่ artifact ถาวร) PDF ใช้ fictional fixture bytes หรือสร้างจาก submitted data ตามสิทธิ์ ไม่ใช่เอกสารลงนามจริง

## Unresolved / Blockers

- BLOCKED: TR-07 และ TR-17 positive mutation ยังไม่เปิด; OPEN-05/OPEN-20 ต้องยืนยัน policy/authority ก่อน ไม่สร้าง auto-cancellation
- OPEN-04/OPEN-13 ใช้ temporary Local Demo decision เท่านั้น ไม่เปลี่ยนเป็น Stakeholder-confirmed และไม่ขยาย Production permissions
- Checklist จริง, research standards blocking policy, official evaluation rubric/document requirements, reminder cadence และ PDF access หลัง CLOSED ยังเป็น OPEN ตามเอกสาร ไม่เพิ่มข้อบังคับเอง
- Month-end extension ambiguity ยังถูกปฏิเสธตาม OPEN-10; ไม่เลือก calendar policy แทนผู้ใช้
- Reviewer directory/affiliation แสดงเฉพาะข้อมูลที่มี; ไม่มีการสร้างบัญชีหรือข้อมูลส่วนบุคคลจริงเพิ่ม
- ไม่รัน migration, ไม่เปลี่ยนข้อมูล Firebase และไม่ deploy; ผล Local Demo ไม่ใช่หลักฐาน production readiness

## ไฟล์ที่แก้ในงานตรวจนี้

`package.json`, `tests/phase1.browser.mjs`, `tests/phase3.browser.mjs`, `tests/staff-ui/*.mjs`, `scripts/test-staff-ui.mjs`, `docs/progress/evidence/STAFF_UI_VALIDATION.json` และรายงานนี้ ส่วนไฟล์ UI/screenshots ที่เปลี่ยนอยู่ก่อนเริ่มงานไม่ถูก revert
