# Staff Demo Data Refinement

15 November 2026 — Local Demo only

- ใช้ shared profiles เดิมที่มี 22 โครงการชื่อไทย/อังกฤษไม่ซ้ำ เลขอ้างอิง สังกัด งบประมาณและวันที่ ครบ 9 สถานะ รวม correction, publication, draft evaluation และ final verification
- เติมสังกัดสมมติใน actor profiles และ Local Reviewer Directory; ใช้ชื่อไทยแทน UID ใน directory โดยคงค่า selection UID เดิม
- เปลี่ยนข้อความเตรียม scenario/ประวัติที่ยังเป็นศัพท์เทคนิคให้เป็นคำอธิบายภาษาไทย พร้อมคงข้อเท็จจริงว่าเป็นสถานการณ์สมมติ
- แยกข้อเสนอแนะสมมติของ Reviewer ทั้ง 3 คน และเพิ่มชื่อผู้ประเมินในชื่อไฟล์ feedback โดยไม่เปลี่ยน document IDs/bytes/relationships
- รักษา DEMO MODE, project IDs, enums, permissions, timestamps, budgets, workflow cases และ OPEN restrictions; ไม่เปลี่ยน UI layout หรือ production directory

อ้างอิง FR-ADM-01/02/08/10, FR-REV-01/09 และข้อกำหนด role access ของ v1.6; ไม่เปลี่ยน TR-01–17

## ผลทดสอบ

| Test | Result |
|---|---|
| Unit tests รวม shared profile/relationship/role-view invariants | PASS 116/116 |
| Staff dashboard dynamic counts + responsive | PASS 32 checks |
| Reviewer directory/assignment UI | PASS 27 checks |
| Researcher / Staff / Reviewer browser regression | PASS 29 / 42 / 21 checks |
| Cross-role workflow integration | PASS 25 checks |
| Lint / build | PASS / PASS; existing >500 kB bundle warning |

Researcher browser ครั้งแรกติด screenshot file lock; รันทวนด้วย test copy ที่เปลี่ยนเฉพาะ output screenshot ไป `tmp/demo-data-validation` แล้ว PASS รวมทั้ง Reviewer/integration ใช้ output ภาพแยกเช่นกัน ไม่ลด assertions

ไฟล์แก้: `src/data/researchDemoProfiles.js`, `foundationDemo.js`, `researcherScenarios.js`, `staffScenarios.js`, Local Directory mapping ใน `src/components/SharedWorkspace.jsx`, `tests/finalDemoV16.test.js` และรายงานนี้

ข้อมูลใน Local Storage เดิมไม่ถูกเขียนทับอัตโนมัติ: ใช้ Reset Local Demo ที่มีอยู่พร้อม confirmation เพื่อโหลด seed ล่าสุด (จะรีเซ็ตความคืบหน้า Demo ตามพฤติกรรมเดิม) ไม่แตะข้อมูล Firebase และไม่ deploy
