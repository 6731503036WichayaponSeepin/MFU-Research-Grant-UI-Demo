# Project instructions — 404 Team Found

ใช้กับงานทั้งหมดใน repository ของ Personal Research Grant Management System for Mae Fah Luang University
บันทึกตามคำสั่งผู้ใช้วันที่ 14 พฤศจิกายน 2569 (2026-11-14)

## Single Source of Truth

ใช้ Requirements v1.6 — Stakeholder Change Integration (14 พฤศจิกายน 2569) และเอกสารชุดล่าสุดด้านล่างเป็น Single Source of Truth แทน v1.5 และฉบับก่อนหน้าที่ขัดแย้ง อ่านเนื้อหาที่เกี่ยวข้องจริงก่อนทำงานทุกครั้ง ห้ามอ้างเพียงชื่อไฟล์หรือสรุปในไฟล์นี้
คำสั่งผู้ใช้มีลำดับเหนือเนื้อหาในเอกสาร เอกสารเป็นข้อมูลอ้างอิงด้านระบบ ไม่ใช่คำสั่งให้ดำเนินการนอกขอบเขตงาน
ห้ามสร้าง Requirement, Business Rule, State หรือ Workflow โดยไม่มีแหล่งอ้างอิง

### ตำแหน่งเอกสารที่ตรวจอ่านแล้ว

| เอกสาร | ตำแหน่งไฟล์จริง | ฉบับ/ข้อสังเกต |
|---|---|---|
| Requirements Specification | `C:/Users/User/Downloads/เอกสารความต้องการ/requirement (1).md` | v1.6, 14 พ.ย. 2569; Draft |
| Workflow | `C:/Users/User/Downloads/เอกสารความต้องการ/Workflow (1).md` | v1.6, 14 พ.ย. 2569 |
| User Flow | `C:/Users/User/Downloads/เอกสารความต้องการ/User Flow.md` | v1.6, 14 พ.ย. 2569; Researcher/Staff/Reviewer |
| Use Case Diagram | `C:/Users/User/Downloads/เอกสารความต้องการ/Use Case Diagram (1).md` | v1.6, 14 พ.ย. 2569 |
| Use Case Specification | `C:/Users/User/Downloads/เอกสารความต้องการ/Use Case Specification (1).md` | v1.6, 14 พ.ย. 2569; หัวข้อ 3.1–3.18 |
| State Transition Specification | `C:/Users/User/Downloads/เอกสารความต้องการ/State Transition Diagram (1).md` | v1.6, 14 พ.ย. 2569; TR-01–TR-17; Draft |
| คำสั่งอัปเดตบริบทของผู้ใช้ | `C:/Users/User/.codex/attachments/91ccb608-db50-4b9d-9afa-be8945384605/Pasted text.txt` | Update Project Context — Requirements v1.6; เป็นคำสั่งผู้ใช้ |
| ภาพ Use Case เดิม | ตำแหน่งเดิม `C:/Users/User/Downloads/Workflow update-Usecase.drawio.png` ไม่พบแล้ว ณ 15 พ.ย. 2569 | ประวัติการอ้างอิงรอบ v1.5 เท่านั้น ไม่ใช้แทนเอกสาร v1.6 ในโฟลเดอร์ใหม่ |
| README โครงการที่แนบเดิม | `C:/Users/User/Downloads/เอกสารความต้องการ/README (1).md` | บริบทเดิม ไม่ใช่หลักฐานว่าทุก Requirement อนุมัติแล้ว |

ชื่อในข้อความคำสั่ง เช่น `requirement (1)(1).md`, `Workflow (1)(1).md`, `User Flow(1).md` และชื่อแบบ `(1)(1)` ของ Use Case/State ไม่พบตามตัวสะกดนั้นใน Downloads หรือ repository ณ วันที่ตรวจ; พบไฟล์แนบครบหกประเภทตามตารางและตรวจเนื้อหาทั้งหมดว่าเป็น v1.6 แล้ว ไม่ตัดสินเวอร์ชันจากชื่อไฟล์
ไฟล์นอกชุดที่ผู้ใช้ยืนยันห้ามใช้แทนโดยดูจากชื่อ: Downloads/requirement.md มี v1.6 เพิ่มรหัส AC รายข้อด้วย แต่ชุดอ้างอิงหลักคือโฟลเดอร์เอกสารความต้องการตามที่ผู้ใช้ยืนยัน ตรวจเวอร์ชันและเนื้อหาก่อนเลือกใช้ทุกครั้ง
เอกสารอ้างอิงเหล่านี้อยู่นอก repository หากเปิดไม่ได้ ให้แจ้งผู้ใช้และขอตำแหน่งฉบับล่าสุด ห้ามใช้เอกสารเดิมแทนโดยเงียบ ๆ
README ที่แนบอ้าง `docs/02-requirements/` แต่ยังไม่มี directory นี้ใน repository ปัจจุบัน

## ขั้นตอนก่อนและหลังแก้ไข Demo/Source Code

1. อ่าน AGENTS.md แล้วอ่าน Requirements Specification, FR, NFR, BR, AC, Workflow, User Flow, Use Case Diagram, Use Case Specification, State Transition Rules TR-01–TR-17, Role and Permission, Scope In/Out และ Open Questions ที่เกี่ยวข้องจากเอกสารต้นฉบับ
2. ตรวจ source code ปัจจุบันและ git status แล้วเปรียบเทียบพฤติกรรมที่มีอยู่กับ Requirements ล่าสุด
3. ระบุ Requirement ID, BR/AC และ Transition Rule ที่เกี่ยวข้อง (หากไม่มี TR ที่เกี่ยวข้อง ให้ระบุว่าไม่เกี่ยวข้องพร้อมเหตุผล ห้ามสร้างรหัสเอง)
4. ตรวจผลกระทบต่อบทบาท สิทธิ์ Workflow, User Flow ข้อมูล และสถานะก่อนแก้ไข
5. แก้เฉพาะงานที่ได้รับมอบหมาย รักษาฟังก์ชันอื่นและการเปลี่ยนแปลงเดิมของผู้ใช้ ห้ามย้อนหรือเขียนทับงานที่ไม่เกี่ยวข้อง
6. หากพบข้อขัดแย้งหรือ OPEN ที่กระทบการตัดสินใจ ให้แจ้งและถามผู้ใช้ก่อนตัดสินใจในส่วนนั้น ทำงานส่วนที่ไม่ขึ้นต่อคำตอบต่อได้
7. ทดสอบให้เหมาะกับการเปลี่ยนแปลงและตรวจ Regression รวมกรณีสิทธิ์/transition/ไม่เปลี่ยนสถานะเมื่อเกี่ยวข้อง
8. สรุปไฟล์ที่แก้ เหตุผล/Requirement ID ผลทดสอบ และปัญหาหรือข้อจำกัดที่พบ ไม่กล่าวว่าทดสอบผ่านหากไม่ได้รัน

เอกสารทั้งชุดเป็นฐานวิเคราะห์ระบบเป้าหมาย ไม่ใช่การอนุมัติให้พัฒนาทุกฟังก์ชันใน Seminar; Scope/MVP ยังต้องยืนยัน (`OPEN-12`)
รักษาป้าย PROCESS, CONFIRMED, DESIGN, OPEN ตามต้นฉบับ ห้ามถือว่า DESIGN หรือ OPEN ได้รับอนุมัติจาก Stakeholder; CONFIRMED ใช้เฉพาะประเด็นที่ยืนยันไว้จริง

## บทบาทและสิทธิ์

ผู้ใช้ภายใน Web มีเพียง 3 บทบาท:
- Researcher: เฉพาะโครงการของตน จัดทำ/ยื่นข้อเสนอ ติดตาม และส่งเอกสารปิด
- Research Administration Staff: เฉพาะระเบียนที่ได้รับสิทธิ์ ตรวจเอกสาร บันทึกผล รับรอง มอบหมายประเมิน และบันทึกปิด
- Expert Reviewer: เฉพาะงานที่ได้รับมอบหมาย อ่านรายงานและส่งผลประเมิน ห้ามแก้โครงการหรือปิดโครงการ

ต้นสังกัดและคณะกรรมการไม่มีบัญชี Web; บริการอีเมลไม่ใช่บทบาทผู้ใช้ภายใน
ตรวจสิทธิ์ที่ Backend เมื่อพัฒนาระบบจริง ไม่ใช้การซ่อนปุ่มเป็นมาตรการเพียงอย่างเดียว (`FR-COM-02`, `NFR-01`–`02`)
สิทธิ์แก้หลังส่งและสิทธิ์เจ้าหน้าที่รายบุคคลที่ยังไม่ชัดต้องสอบถาม (`OPEN-13`)

## สถานะหลักและ Transition

ใช้ชื่อทั้ง 9 นี้เท่านั้น ห้ามเพิ่ม ลบ หรือเปลี่ยนชื่อโดยไม่มีคำสั่งผู้ใช้และ Requirement รองรับ:
`DRAFT`, `AFFILIATION_REVIEW`, `STAFF_REVIEW`, `COMMITTEE_ACKNOWLEDGEMENT`, `IN_PROGRESS`, `CLOSURE_REVIEW`, `REPORT_EVALUATION`, `CLOSED`, `CANCELLED`
คำสั่งผู้ใช้ v1.6 แทนข้อจำกัดเดิมที่ให้มีเพียง 8 สถานะ; ต่อมาคำสั่ง Phase 0 วันที่ 15 พ.ย. 2569 อนุญาตให้ implement versioned foundation ตามขอบเขตที่ระบุท้ายไฟล์แล้ว
`CANCELLED` และ `CLOSED` เป็น Terminal State ที่แยกกัน; CANCELLED ไม่เข้าสู่เส้นทางปิดโครงการ

ตารางนี้ช่วยนำทาง ต้องอ่านเงื่อนไขและสถานะการยืนยันใน State Transition Specification ก่อนใช้จริง:

| TR | จาก → ไป | เหตุการณ์ |
|---|---|---|
| TR-01 | เริ่มต้น → DRAFT | สร้างและบันทึกครั้งแรก |
| TR-02 | DRAFT → DRAFT | กรอก/อัปโหลด/สกัด/ตรวจแก้/บันทึกร่าง |
| TR-03 | DRAFT → AFFILIATION_REVIEW | ยืนยันฉบับพร้อมยื่นต้นสังกัด; trigger ยัง OPEN |
| TR-04 | AFFILIATION_REVIEW → เดิม | แก้ตามความเห็นต้นสังกัด |
| TR-05 | AFFILIATION_REVIEW → STAFF_REVIEW | เอกสารและคำยืนยันครบแล้วกดยืนยันส่ง |
| TR-06 | STAFF_REVIEW → เดิม | แจ้งแก้ไข แก้และยืนยันส่งใหม่ |
| TR-07 | STAFF_REVIEW → AFFILIATION_REVIEW | เกณฑ์กลับต้นสังกัดยัง OPEN ห้ามบังคับใช้เอง |
| TR-08 | STAFF_REVIEW → COMMITTEE_ACKNOWLEDGEMENT | เจ้าหน้าที่บันทึกตรวจผ่าน |
| TR-09 | COMMITTEE_ACKNOWLEDGEMENT → IN_PROGRESS | หลังเสนอเพื่อทราบ เจ้าหน้าที่บันทึกรับรอง; เงื่อนไขมาตรฐานวิจัยยังมี OPEN |
| TR-10 | IN_PROGRESS → เดิม | เจ้าหน้าที่บันทึกผลขยายเวลาจาก e-Office |
| TR-11 | IN_PROGRESS → CLOSURE_REVIEW | เอกสารปิดขั้นต่ำครบและยืนยันส่ง |
| TR-12 | CLOSURE_REVIEW → เดิม | ขอและส่งเอกสารเพิ่มเติม |
| TR-13 | CLOSURE_REVIEW → REPORT_EVALUATION | ตรวจเอกสาร มอบหมายผู้ทรงฯ 3 คนไม่ซ้ำ แล้วเริ่มส่งร่างรายงาน 5 บทให้ประเมิน |
| TR-14 | CLOSURE_REVIEW → CLOSED | เจ้าหน้าที่ตรวจหลักฐานเผยแพร่ครบและบันทึกปิด |
| TR-15 | REPORT_EVALUATION → เดิม | ผู้ทรงฯ 3 คนยืนยันส่งครบ 3/3 เจ้าหน้าที่ยืนยันส่งผล นักวิจัยจึงเข้าถึงผลและส่งรายงานแก้ไขใน Web; ประเมินหนึ่งรอบ; PDF เป็น on-demand |
| TR-16 | REPORT_EVALUATION → CLOSED | เจ้าหน้าที่ตรวจฉบับแก้ไข/เอกสารครบแล้วบันทึกปิด |
| TR-17 | IN_PROGRESS → CANCELLED | ผู้มีสิทธิ์ระบุเหตุผลและยืนยัน; DESIGN โดยสิทธิ์ผู้ยกเลิกและสถานะต้นทางอื่นยัง OPEN |

## Business Rules ที่ต้องรักษา

- e-Office เป็นระบบภายนอก ไม่มี API และไม่แทนหนังสือราชการด้วย Web (`BR-06`)
- ต้นสังกัดพิจารณาภายนอก; AFFILIATION_REVIEW ไม่พิสูจน์ว่าต้นสังกัดรับเอกสารแล้ว (`BR-02`)
- คณะกรรมการรับเรื่องเพื่อทราบ ไม่ใช่อนุมัติ (`BR-05`)
- RS-1 รองรับกรอกเองและอัปโหลดเพื่อสกัด ผู้วิจัยต้องตรวจแก้ก่อนยืนยัน; ไม่เติมค่าที่ไม่ทราบเอง (`FR-RES-02`, `04`–`08`)
- รองรับ PDF ข้อเสนอ แต่การสกัดข้อมูลกับการแปลงไฟล์เดิมเป็น PDF เป็นคนละความสามารถ ไม่สมมติ OCR/ไฟล์สแกนหรือการคง layout เดิมโดยไม่มีเกณฑ์ยืนยัน
- Preview ดาวน์โหลด อัปโหลด หรือบันทึกร่างเพียงอย่างเดียวไม่เปลี่ยนสถานะหลัก; การสร้างครั้งแรกกำหนด DRAFT ตาม TR-01
- ก่อน TR-05 ต้องแนบ RS-1 ลงนามครบและหลักฐานต้นสังกัดเป็นรายงานประชุมหรือเอกสารยืนยัน ไม่บังคับทั้งสอง (`FR-RES-13`–`14`, `FR-SIG-01`–`06`, `BR-03`–`04`, `11`–`12`)
- รายชื่อผู้ลงนามประกอบด้วยหัวหน้าโครงการ และที่ปรึกษา/ผู้ร่วมวิจัยเมื่อมี; หากใช้ลายเซ็นอิเล็กทรอนิกส์ของผู้อื่น ต้องยืนยันความยินยอมก่อนส่ง คำรับรองไม่ใช่การพิสูจน์ความยินยอมอัตโนมัติ ไม่เพิ่ม PKI หรือเก็บลายเซ็นผู้อื่นใช้ซ้ำเอง
- ขยายเวลาและเปลี่ยนแปลงโครงการยื่นผ่าน e-Office เจ้าหน้าที่บันทึกผลใน Web; เฉพาะเจ้าหน้าที่ที่มีสิทธิ์แก้ข้อมูลที่อนุมัติ เก็บค่าเดิม/ใหม่ เหตุผล ผู้แก้ และเวลา; ทั้งสองอยู่ IN_PROGRESS ไม่สร้างสถานะใหม่ (`FR-ADM-09`, `13`)
- ขยายเวลาได้ไม่เกิน 2 ครั้ง ครั้งละไม่เกิน 6 เดือน ตามหลักเกณฑ์ที่เกี่ยวข้อง; ครบ 2 ปีไม่ยกเลิกอัตโนมัติ ต้องพิจารณาการขยายเวลาที่อนุมัติแล้ว (`BR-14`)
- ปิดได้สองเส้นทาง: รายงาน 5 บทผ่านผู้ทรงฯ เพียงหนึ่งรอบ แล้วนักวิจัยส่งฉบับแก้ไขให้เจ้าหน้าที่ตรวจครบและปิด; ผลงานเผยแพร่ใช้รายงานย่อและหลักฐาน ไม่ผ่านผู้ทรงฯ (`BR-07`–`09`)
- เจ้าหน้าที่เป็นผู้บันทึกปิด ไม่ปิดเพราะอัปโหลดหรือส่งผลประเมินอย่างเดียว
- เก็บ audit/history ของเหตุการณ์ ผู้กระทำ เวลา เหตุผลและเวอร์ชันเอกสารตามสิทธิ์ ไม่เขียนทับประวัติ (`FR-COM-05`, `FR-ADM-10`, `NFR-03`)

## การยกเลิกโครงการ — v1.6

อ้างอิง `FR-CAN-01`–`02`, `FR-REG-03`, `BR-14`–`15`, `TR-17`, `AC-TR-17`
- เส้นทางปัจจุบันคือ IN_PROGRESS → CANCELLED ตามข้อเสนอการออกแบบ ไม่อนุมานสิทธิ์ของเจ้าหน้าที่ทุกคนหรือเพิ่มสถานะต้นทางอื่น (`OPEN-20`)
- ต้องเลือกเหตุผล `RESIGNED`, `EXCEEDED_DURATION` หรือ `OTHER`; OTHER ต้องมีรายละเอียด และต้องยืนยันก่อนยกเลิก
- เก็บ Project ID, Previous State, Reason, รายละเอียด, Supporting Documents, Cancelled By, Cancelled At และ Audit History รวมเอกสารเดิม ห้ามลบข้อมูลถาวร
- ปฏิเสธเมื่อไม่มีเหตุผล OTHER ไม่มีรายละเอียด ไม่มีสิทธิ์ หรือโครงการ CLOSED; ไม่ auto-cancel เมื่อครบ 2 ปี และ CANCELLED ไม่เข้าสู่กระบวนการปิด
- `FR-REG-02`/`OPEN-19` เรื่องนำออกจากทะเบียนแยกจาก TR-17 ห้ามเชื่อมเป็นการยกเลิกอัตโนมัติ

## ผู้ทรงคุณวุฒิ การส่งผล และ PDF — v1.6

อ้างอิง `FR-REV-01`–`10`, `FR-CLS-09`–`10`, `TR-13`, `TR-15`–`16`, `AC-TR-15`–`16`, `NFR-01`, `NFR-05`
- เจ้าหน้าที่มอบหมายผู้ทรงฯ 3 คนไม่ซ้ำ แต่ละคนเห็นเฉพาะงานที่มอบหมายและผลของตน; การแต่งตั้งทางการอยู่ e-Office
- รองรับบันทึกร่างและยืนยันส่งผล; ร่างไม่นับเป็นผลสำเร็จ แสดงความคืบหน้า 0/3, 1/3, 2/3, 3/3 จากผู้ประเมินไม่ซ้ำที่ยืนยันส่งจริง
- เจ้าหน้าที่ยืนยันส่งผลให้นักวิจัยได้เฉพาะ REPORT_EVALUATION เมื่อครบ 3/3 และยังไม่เคยส่ง Backend ต้องปฏิเสธผลไม่ครบ ผู้ไม่มีสิทธิ์ และการส่งซ้ำ พร้อมเก็บผู้ส่ง/เวลา
- นักวิจัยเข้าถึงผลและ PDF หลังเจ้าหน้าที่ยืนยันส่งผลแล้วเท่านั้น จากนั้นส่งรายงานฉบับแก้ไขใน Web; ไม่ส่งประเมินรอบสอง เจ้าหน้าที่ตรวจครบและบันทึกปิดเอง
- สร้าง/ดาวน์โหลด PDF รายบุคคลแบบ optional/on-demand จากข้อมูลฉบับที่ผู้ทรงฯ ยืนยันส่งจริง ต้องตรงกันทุกฟิลด์ ไม่สร้างข้อมูลหรือลายเซ็นผู้ทรงฯ เอง
- เจ้าหน้าที่เข้าถึง PDF ตามสิทธิ์ ผู้ทรงฯ เฉพาะผลตน นักวิจัยหลังเปิดเผยผล; การสร้าง/ดาวน์โหลด PDF ไม่ส่งผลประเมินแทนเจ้าหน้าที่และไม่เปลี่ยนสถานะโครงการ
- PDF รวม 3 คน ระยะเวลาเก็บข้อมูล และการดาวน์โหลดย้อนหลังหลัง CLOSED เป็น DESIGN/OPEN ห้ามถือว่าอนุมัติแล้ว
- รักษาป้ายตาม Requirements: FR-REV-01 เป็น DESIGN รองรับ PROCESS, FR-REV-09/10 เป็น DESIGN, FR-REV-07 ยืนยัน PDF รายบุคคลโดยมีส่วน DESIGN/OPEN และ FR-REV-08 ยืนยันหนึ่งรอบ; การบันทึกกฎตามคำสั่งผู้ใช้ไม่เปลี่ยนป้ายเหล่านี้เป็น Stakeholder CONFIRMED

## ประเด็น OPEN และความไม่สอดคล้องที่ต้องแจ้งก่อนตัดสินใจ

- ตรวจ Open Questions ใน v1.6 ตามรายการจริงทุกครั้งที่เกี่ยวข้อง: OPEN-01–07 และ OPEN-09–21 (ไม่มีแถว OPEN-08 แล้ว ห้ามสร้างขึ้นเอง): mapping/ฟิลด์/ชนิดไฟล์/ความแม่นยำ RS-1, trigger TR-03, เกณฑ์ TR-07, checklist, กำหนดเวลา/เตือน/รอบรับ, ฟอร์มประเมิน, MVP, สิทธิ์หลังส่ง, หลักฐานเผยแพร่และลายเซ็น, มาตรฐานวิจัย, การนำออกจากทะเบียน, สิทธิ์ยกเลิก และ mapping Excel
- OPEN-07 ยืนยันหนึ่งรอบแล้ว แต่ชื่อค่าผลประเมินยังรอยืนยัน; State Specification ใช้รหัสนี้กล่าวถึงกรณีไม่ส่งฉบับแก้ไขด้วย ต้องไม่สรุปกฎเกินต้นฉบับ
- OPEN-10 ยืนยันช่องทาง e-Office แล้ว แต่การคำนวณเวลาและเตือนยังไม่ยืนยัน
- Workflow และ Use Case 3.3 แสดงยืนยัน PDF แล้วเปลี่ยนสถานะ แต่ Requirements/State ยังคง OPEN-04 สำหรับ trigger ของ TR-03 จึงห้ามถือว่ารายละเอียด trigger ได้รับอนุมัติแล้ว
- รูปแบบหลักฐาน/การเตือนหรือบล็อก TR-09 ยัง OPEN-17 ห้ามบล็อกทุกโครงการเอง
- OPEN-19 ยังเปิดเรื่อง trigger/ผู้มีอำนาจ/วิธีนำออกจากทะเบียน แต่ห้ามลบถาวร; OPEN-20 เปิดเรื่องสิทธิ์ยกเลิก/สถานะต้นทางอื่น โดย CANCELLED/TR-17 มีใน v1.6 แล้ว; OPEN-21 ยังต้อง mapping Excel ห้ามสร้าง enum/state เอง
- Use Case Diagram ผูกการยกเลิกกับ Staff และ Staff User Flow แสดงขั้นตอนยกเลิก แต่ Requirements, State และ Use Case 3.16 ยังระบุสิทธิ์ OPEN ห้ามถือว่าแผนภาพยืนยันสิทธิ์แล้ว
- Researcher User Flow วางการรับอีเมลเตือนไว้บนเส้นหลัก แต่ Workflow ระบุว่าเป็นงานตามกำหนดที่ไม่บังคับรอ ห้ามสร้างเงื่อนไขต้องได้รับอีเมลก่อนขยายเวลา/เปลี่ยนแปลง/ปิดโครงการ; หากงานต้องตัดสินลำดับนี้ให้ขอคำยืนยัน
- NFR-08/09: 80%, 4/5, 90% เป็นเป้าจากฉบับเก่ารอยืนยัน ไม่ใช่ผลทดสอบจริง; NFR-06/12 ยังไม่มีเกณฑ์ความแม่นยำ/ประสิทธิภาพที่อนุมัติ
- เอกสารอ้างถึงแนวปฏิบัติ 2569 ขั้นตอน 2570 RS-1 ไทย/อังกฤษ แบบประเมินจริง และ Excel ทะเบียน แต่ไม่รวมเป็นชุดไฟล์ที่แนบครั้งนี้ ห้ามอ้างว่าตรวจเอกสารต้นทางเหล่านั้นแล้ว
- README ใน repository กล่าวถึง timeline 9 ขั้นของ Demo เดิม ไม่ใช่หลักฐานว่าตรงกับ State ID 9 สถานะของ v1.6 ให้ตรวจ code จริงก่อนงานที่ได้รับมอบหมาย ไม่แก้ระบบเอง

## สรุปเปลี่ยนบริบท v1.5 → v1.6

- เปลี่ยนแหล่งอ้างอิงเป็นหกเอกสาร v1.6 พร้อม User Flow แยกบทบาท; รักษากฎเดิมที่ไม่ขัดกัน
- เพิ่ม CANCELLED เป็นสถานะที่ 9 และ TR-17; เหตุผลยกเลิกและ audit ไม่ลบข้อมูล ไม่ auto-cancel ไม่เข้าสู่ closure
- เพิ่มผู้ประเมิน 3 คนไม่ซ้ำ ตัวนับผลที่ยืนยันส่ง 0/3–3/3 และ gate ให้เจ้าหน้าที่เปิดเผยผลครั้งเดียวก่อนนักวิจัยเข้าถึง
- PDF ผลประเมินเป็นรายบุคคล on-demand ไม่ใช่ขั้นตอนบังคับเพื่อส่งผลหรือปิดโครงการ; คงประเมินหนึ่งรอบและส่งฉบับแก้ไขใน Web
- BR-14 ระบุขยายเวลาไม่เกิน 2 ครั้ง ครั้งละ 6 เดือน; OPEN-20 เปลี่ยนเป็นสิทธิ์/สถานะต้นทางยกเลิก ไม่ใช่คำถามว่ามี CANCELLED หรือไม่

## ขอบเขตงานที่อนุญาตในคำสั่งตั้งต้นนี้

คำสั่งอัปเดต v1.6 วันที่ 14 พ.ย. 2569 จำกัดที่อ่านเอกสารทั้งหมด อัปเดต Project Context/AGENTS.md บันทึกตำแหน่งเอกสาร สรุปความเปลี่ยนแปลง และรายงานข้อมูลขาด/ขัดแย้งเท่านั้น
ยังไม่แก้ UI, Backend, Database, API หรือ source code ของ Demo จนกว่าผู้ใช้สั่งเริ่มแก้ไข คำสั่งใหม่ในอนาคตที่มอบหมายแก้ระบบให้ถือเป็นการอนุญาตเฉพาะขอบเขตนั้น และใช้กฎข้างต้นต่อไป

## Phase 0 — authorization วันที่ 15 พฤศจิกายน 2569

ผู้ใช้อนุญาต Domain Logic, Data Model, Validation, Shared Utilities, Local Demo Fixtures, Tests และรายงาน docs/progress/PHASE_0_REPORT.md เฉพาะ Phase 0 แล้ว จึงแทนข้อจำกัด read-only ของงานตั้งต้นในขอบเขตนี้ ห้าม deploy หรือรัน migration กับ Firebase จริง ห้ามเริ่ม Phase 1 หรือ redesign หน้าจอทั้งหมด
ใช้ versioned contract v1.6 และ migration dry-run; ข้อมูล legacy ต้องรักษาต้นฉบับ ไม่ auto-map/เขียนทับ. Trigger TR-03, TR-07 และ cancellation permission ที่ OPEN ให้ปิด mutation ไว้ ไม่ให้ request payload เปิดใช้เอง
ตำแหน่งเอกสารข้างต้นปรับและตรวจเมื่อ 15 พ.ย. 2569; เอกสาร docs/audit เป็นผล audit ก่อน Phase 0 ไม่ใช่รายงานสถานะ implementation หลังแก้

ฐานพัฒนา v1.6 คือ `src/domain/contracts.js`, `permissions.js`, `model.js`, `actions.js`, `migration.js`; Backend ใช้สำเนาที่ package ด้วย `scripts/sync-server-domain.mjs` และ `functions/foundationPolicy.js` ห้ามให้ legacy save bypass canonical execute guards
Local fixtures v1.6 และ store เป็น opt-in ที่ `src/data/foundationDemo.js` / `src/utils/foundationStore.js` ใน key `mfu-foundation-v16-demo-projects`; ไม่ overwrite key เดิมและไม่ auto-migrate. หน้าจอเดิม/legacy reducers ยังเป็น compatibility layer ไม่ใช่หลักฐานว่า UI ย้ายเป็น v1.6 แล้ว
อ่าน `docs/progress/PHASE_0_REPORT.md` ก่อนทำงานต่อ; Phase 1 ต้องรอคำสั่งผู้ใช้ ไม่เริ่มเองหลังทดสอบผ่าน

## Phase 1 — authorization

ผู้ใช้อนุญาต Common & Shared Pages, shared design/layout, local scenario entry, sign-in feedback, project overview/documents/history/notifications และ tests ตามคำสั่ง Phase 1 แล้ว อ่าน `docs/progress/PHASE_1_REPORT.md` สำหรับผลและข้อจำกัดล่าสุดเมื่อมีไฟล์นี้
ไม่ขยาย workflow เฉพาะบทบาท ไม่เปิด OPEN transitions ไม่ deploy หรือแก้ Firebase จริง และหยุดก่อน Phase 2
Default Local Demo ใช้ namespace v1.6; ชุด Legacy แยกเลือกเพื่อรักษาตัวอย่างและร่างเดิม Reset ต้องมี confirmation และเขียนเฉพาะ fictional v1.6 namespace ห้ามใช้ reset นี้กับ remote store

## Phase 2 — authorization และ Temporary Local Demo Decision

ผู้ใช้อนุญาต Researcher Workspace N-R01–N-R09 และ shared/domain logic ที่จำเป็นตามคำสั่ง Phase 2 แล้ว หยุดก่อน Phase 3; ไม่ deploy หรือแก้ Firebase Records จริง
ผู้ใช้ตอบอนุญาต Temporary Design เฉพาะ Local Demo สำหรับ OPEN-04/TR-03 และ OPEN-13/scoped researcher corrections อ่าน `docs/decisions/LOCAL_V16_OPEN04_OPEN13.md` และ `src/domain/localDemoPolicy.js` ก่อนแก้ส่วนนี้ กฎนี้แทนการปิด TR-03 แบบทุกโหมดในข้อความ Phase 0/1 เฉพาะ trusted Local Demo เท่านั้น Backend/Firebase ยังคงปิด OPEN-04/13, TR-07 ยังคงปิดทุกโหมด, Requirements ไม่เปลี่ยนเป็น Stakeholder CONFIRMED
Researcher pages ใช้ canonical command contract ไม่ใช้ legacy reducers; private working copies scope ด้วย workspace+UID+project และ Contract Fixtures ต้องมีป้ายชัดเจน/เลือกเพิ่มโดยไม่ overwrite เดิม ผลล่าสุดอยู่ `docs/progress/PHASE_2_REPORT.md` เมื่อมีไฟล์นี้

## Phase 3 — Staff Workspace authorization

ผู้ใช้อนุญาต Staff Workspace N-S01–N-S10 และ Shared Logic ที่จำเป็นตามคำสั่ง Phase 3 แล้ว อ่าน `docs/progress/PHASE_3_REPORT.md` สำหรับผลล่าสุดเมื่อมีไฟล์นี้ และหยุดก่อน Phase 4 ไม่ deploy หรือแก้ Firebase จริง
Staff ใช้ canonical Business Actions/expectedVersion ไม่เปลี่ยนสถานะด้วย dropdown; scope correction ชั่วคราวจาก Phase 2 ใช้เฉพาะ Local Demo ต่อไป OPEN-20 ยังปิด cancellation mutation ทุกโหมด แม้ cancellation form/contract preview ใช้งานได้; OPEN-10/17/21 และ official checklist ยังไม่อนุมานนโยบายใหม่
Web Correction Approval เดิมยุติที่ route correction ทั้ง Local/Legacy/Firebase รวมถึง local helper และสิทธิ์แก้ proposal ผ่าน legacy approved flag ทั้ง Client/Backend โดยคงข้อมูล/ประวัติเดิมไว้ ให้ใช้ผลภายนอก e-Office ใน Change & Extension Records แทน ไม่ auto-migrate legacy records
Staff forms ต้องใช้ version/payload snapshot ณ เปิด Confirmation Modal เพื่อให้ concurrent updates ถูกปฏิเสธ ไม่ยืนยัน record เวอร์ชันใหม่แทนโดยเงียบ ๆ Contract Fixtures ของ Reviewer/Researcher ยังไม่ใช่หลักฐานว่า Reviewer UI เสร็จแล้ว

## Phase 3.1 — Global UI Theme authorization

ผู้ใช้อนุญาต UI Theme Redesign ทุกหน้าที่พัฒนาแล้ว โดยรักษา Business Logic, Roles/Permissions, API, Schema, Routes, Event Handlers, Validation และ Persistence ห้าม Deploy หรือแก้ Firebase จริง หยุดก่อน Phase 4
ก่อนสร้างหรือแก้ UI ทุก Phase ต้องอ่าน [Design System](docs/design/DESIGN_SYSTEM.md) และใช้ tokens ใน `src/theme.css` พร้อม existing shared components ก่อนสร้างใหม่ ภาพอ้างอิงใช้เฉพาะ Visual Design ไม่ใช่ข้อมูล/เมนู/State Requirements
ผลการตรวจและข้อจำกัดอยู่ `docs/progress/PHASE_3_1_UI_REDESIGN_REPORT.md` เมื่อมีไฟล์นี้

## Phase 4 — Expert Reviewer Workspace authorization

ผู้ใช้อนุญาต N-V01–N-V05, shared integration และ guards/tests ที่จำเป็น รวม PDF รายบุคคล on-demand จาก submitted snapshot แล้ว อ่าน `docs/progress/PHASE_4_REPORT.md` สำหรับผลล่าสุด หยุดหลัง Phase 4 ไม่ Deploy หรือแก้ Firebase จริง
ใช้ Reviewer persona สมมติเดิม 3 คน, canonical commands/assigned-only projection, private working draft แยก workspace+UID+project+assignment, submitted lock และหนึ่งรอบ คง OPEN-11 official rubric และ post-CLOSED PDF access ไว้ ไม่เปลี่ยนเป็น CONFIRMED PDF renderer ต้องอ่าน submitted snapshot ที่ผ่าน capability guard เท่านั้น ไม่สร้างลายเซ็น ไม่เปลี่ยน state และไม่เก็บไฟล์แทนผลประเมินเดิม

## Phase 5 — Workflow Integration authorization

ผู้ใช้อนุญาต integration ทั้งสามบทบาทบน shared canonical records และ PDF/permissions/notifications/history แล้ว ผลล่าสุดอยู่ `docs/progress/PHASE_5_REPORT.md` หยุดหลัง Phase 5 ไม่มี Deploy, live migration หรือ Firebase จริง
EvaluationPdfAction ใช้ร่วมทั้งสามบทบาทด้วย reviewerId ที่ตรวจ capability; นักวิจัยต้องรอ release, draft/post-CLOSED ไม่เปิด PDF และเปลี่ยนหน้า/บัญชีระหว่างสร้างต้องยกเลิก download คง temporary Local Demo decisions เดิม ไม่เปิด TR-03 หรือ temporary OPEN-13 policy บน Backend, TR-07 และ cancellation OPEN-20 ยังปิด

## Phase 6 — Final Testing & UI/UX authorization

ผู้ใช้อนุญาต final verification, แก้บั๊ก/UI ที่เกี่ยวข้อง, fictional scenario consistency, docs/final และ README แล้ว ผลล่าสุดอยู่ `docs/progress/PHASE_6_REPORT.md` และ evidence ใน `docs/final/evidence/` ต้องแยก PASS/FAIL/NOT TESTED/BLOCKED ไม่ถือว่า executable tests ผ่านเท่ากับ FR/production พร้อมทั้งหมด
Fixtures consent project references แก้เฉพาะตัวสร้าง/explicit reset ไม่ migrate saved records; minimal theme/table scrolling และ workflow/OPEN guards เดิมคงไว้ หยุดหลัง Phase 6 ไม่มี Deploy/live migration/Firebase จริง
