# RS-1 Form Alignment & Dynamic Budget

16 พฤศจิกายน 2569 — Local Demo / Requirements v1.6

## Reference and field comparison

อ่านต้นฉบับจริง D:/เอกสาร Seminer/RS-1 Personal Budget.docx ทั้ง 7 หน้า รวมตาราง ข้อแนะนำ ตัวเลือก และส่วนลงนาม ผ่าน OOXML และ PDF ที่แปลงด้วย Word แบบ read-only ไม่พบชื่อไฟล์ (3) ตามข้อความเดิม ไม่แก้ต้นฉบับ

SHA-256: b7affd9fd52840801000a4a1f96aa86d6ab3b73fde34b386c25064a93319ed9b

- [ข้อความต้นฉบับ 116 รายการ](evidence/rs1-alignment/SOURCE_LINE_COMPARISON.csv): PASS ทั้งหมด
- [ฟิลด์ต้นฉบับ 97 ช่อง](evidence/rs1-alignment/FIELD_COMPARISON.csv): stable key, English, Thai, type
- [Source audit](evidence/rs1-alignment/source-audit.json)

| หน้า | เนื้อหาที่ตรวจและนำมาใช้ |
|---|---|
| 1 | Project Proposal, Personal Budget, Project Title, strategies 5 ตัวเลือก, Part A 1.1 Leader / 1.2 Participant คนละ 5 ช่อง, Advisor 4 ช่อง |
| 2 | A3 Cooperation, A4–A10 พร้อมคำแนะนำฉบับเต็ม |
| 3 | A11–A14, duration/extension note, Task/Period table, progress, outcomes 5 ตัวเลือกฉบับเต็ม |
| 4 | A15–A17, integration, dissemination 3 ตัวเลือก, budget 4 หมวด/2 คอลัมน์ |
| 5 | A18 มาตรฐาน 4 ตัวเลือก/คำแนะนำ, A19, ลงนาม 3 บทบาทและ consent note |
| 6 | Part B 1–10 รวม 10.1/10.2 และคำถามย่อยเต็ม |
| 7 | Part C ข้อกำหนด 4 ข้อ และ proposed reviewers 3 คน คนละ 4 ช่อง ไม่มี reviewer signatures |

## Changes

- src/data/rs1Document.js และ RS1DocumentForm.jsx/.css: catalogue เดียว ใช้กับ Manual Entry, Review และ Staff; original wording/numbering/order พร้อมไทย แบบ continuous form 4 cards
- ซ่อน 12 additional fields ที่ไม่มีในต้นฉบับ แต่รักษาค่า legacy ใน schema/drafts/history ไม่ลบข้อมูล
- ตามคำสั่งล่าสุด ซ่อน traditional signature/name/date blocks ใน Web; รักษา manual spaces ใน PDF และ optional electronic signature cards
- rs1Participants.js, model/mapping: Leader หนึ่งคน และ Participants หลายคน แยก 5 ช่องต่อคน
- rs1FieldMapping.js, rs1Extraction.js, UploadDocument.jsx: contextual repeated names, source narrative prompts และ Task/Period/budget tables; ไม่เดา checkbox หรือภาพลายเซ็น
- generateRS1PDF.js: เนื้อหาและลำดับ 7 source pages, รองรับ overflow เพิ่มหน้า, ไทย, images/names/dates; ไม่อ้าง pixel-identical Word layout
- StaffProposalReviewView.jsx: read-only catalogue เดียวตามสิทธิ์
- model/actions/validators และ server mirror ผ่าน sync-server-domain.mjs รักษา guards ไม่มี deploy

## Section 17 — Dynamic Budget

คง Compensation / Direct Cost / Materials / Utilities และ expense / amount 2 คอลัมน์ เพิ่ม/ลบรายหมวดได้เกิน 3 แถว คำนวณ subtotal/grand total จากทุกแถว ตรวจ non-negative numeric amounts โดยไม่เพิ่ม mandatory description

proposal.budgetItems เก็บ category arrays ของ {description, amount}; rs1Budget.js อ่าน array ก่อน แล้ว fallback legacy Item1–3/Amount1–3 หรือ aggregate/detail ไม่มี migration/write กับข้อมูลจริง บันทึกยอดหมวดและ aliases 3 แถวแรกเพื่อ compatibility แต่ snapshot เก็บทุกแถว ลบทั้งหมดไม่ทำให้ค่า legacy กลับมา

Autosave/recovery, proposal revision, review, PDF และ Staff ใช้ข้อมูลเดียวกัน การแก้หลังส่งต้องได้รับ editable section budget ตาม permission เดิม ไม่เปลี่ยนสถานะเพราะแก้/บันทึกงบ

## Traceability

FR-RES-02,04–10,16–17; FR-SIG-01–06; FR-ADM-01–05; BR-03–04,11–12; NFR-01–07. TR-01/02/04/06 ใช้ guard เดิม TR-05 ยังคงตรวจเอกสารก่อนส่ง Dynamic rows ไม่เพิ่ม transition

## Actual tests

| ผล | การทดสอบ |
|---|---|
| PASS | Unit 134/134 รวม dynamic budget 3 tests และ signatures 2 tests |
| PASS | Strict RS-1 browser 203 checks: source content/order/options, TH/EN, responsive, blank PDF 7 หน้า, DOCX import/review/transfer |
| PASS | Budget browser 22 checks: >3 rows, subtotal, negative validation, reload, preview, version, PDF, Staff read-only, remove/add, responsive |
| PASS | Alignment browser 28 checks: image upload/replace/remove, consent, recovery, PDF, version, Staff |
| PASS | Signatures browser 9 checks: 4 individual cards/images, conditional consent, reload, PDF names/dates, renamed signer isolation |
| PASS | Lint และ build; bundle-size warning เดิม |
| PASS | Browser regression 41/41 suites ครบ Researcher/Staff/Reviewer รวม cross-role และ permissions |

[Unit](evidence/rs1-alignment/unit.log), [lint](evidence/rs1-alignment/lint.log), [build](evidence/rs1-alignment/build.log), [PDF](evidence/rs1-alignment/signed-proposal.pdf), [rendered signature page](evidence/rs1-alignment/signed-page-5.png), evidence/final-e2e/results.json และ suite logs

## Conflicts / blockers

- OPEN-01–03 เรื่อง extraction/types/accuracy ยังเปิด ไม่รับรอง OCR หรือ arbitrary layout; DOCX tests ใช้สำเนาข้อมูลสมมติจากต้นฉบับ
- A13 ใช้ “0%”; A18 ข้อแรกกำกวม และข้อความ committee approved คง source English ไม่ตีความเปลี่ยน workflow acknowledgement หรือเพิ่มกฎบล็อก
- ไม่มีต้นฉบับไทย ใช้คำแปล UI ประกอบ; cached Word footer Page 2 of 2 ไม่ใช่จำนวนหน้าจริง ใช้ rendered page count
- OPEN-04/05/13/15–17/20 ไม่เปลี่ยนเป็น CONFIRMED ใช้ temporary Local Demo decisions เดิม
- ไม่มี original templates ของแบบลงนามอื่นตาม OPEN-11 ไม่เพิ่ม signature requirements ให้ Staff/Reviewer; ดู E_SIGNATURE_REPORT.md
- NOT TESTED: Firebase emulator/live, deployment. ไม่มี live writes, deploy หรือ git push

หลักฐานงบประมาณ: [PDF](evidence/rs1-alignment/dynamic-budget.pdf), [rendered PDF](evidence/rs1-alignment/dynamic-budget-page.png), [UI](evidence/rs1-alignment/dynamic-budget-ui.png), [browser results](evidence/rs1-alignment/browser-results.json). ตรวจ render จริงแล้ว ข้อมูล 5 รายการและยอดรวมครบ ไม่ถูกตัด

