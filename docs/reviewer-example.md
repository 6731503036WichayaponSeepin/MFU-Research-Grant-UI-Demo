# ตัวอย่างผู้ทรงคุณวุฒิ 1 โครงการ

โหมด `--reviewer-example` เลือกเฉพาะ `MFU-ADVISOR-V1-C01` เรื่อง “การใช้ภาพถ่ายจำลองเพื่อจำแนกโรคใบชาเบื้องต้น” ใน workspace `testing` มอบหมายให้ UID `test-reviewer` พร้อม PDF ข้อเสนอและรายงานฉบับสมบูรณ์รวม 2 ไฟล์

เข้าสู่ระบบผู้ทรงคุณวุฒิ แล้วเลือก “เริ่มประเมินโครงการตัวอย่าง”:
1. เปิดอ่านรายงานและเอกสารโครงการ
2. กรอกแบบประเมินและข้อเสนอแนะ แล้วบันทึกร่าง
3. ตรวจทานคำตอบและเลือกผลประเมิน
4. ยืนยันส่งผลให้เจ้าหน้าที่ ระบบล็อกผลที่ส่งแล้ว แต่ไม่อนุมัติหรือปิดโครงการอัตโนมัติ

คำแนะนำขั้นตอนเพิ่มไว้ในซอร์สหน้า Dashboard ต้องเผยแพร่หน้าเว็บเองหากต้องการให้ปรากฏบนเว็บไซต์ที่โฮสต์อยู่ ไม่มีการ deploy อัตโนมัติ

สร้างตัวอย่างในเครื่องโดยไม่เชื่อมต่อ Firebase:
```powershell
npm run demo:reviewer
```

คำสั่งเพิ่มเฉพาะโครงการนี้ (ต้องมี ADC ของผู้ดูแล):
```powershell
node functions/scripts/seed-advisor-demo.mjs --project mfu-researchgrantmanagement --reviewer-example --apply --confirm-project mfu-researchgrantmanagement --confirm-seed mfu-advisor-v1
```

สคริปต์ตรวจบัญชีและสิทธิ์ที่มีอยู่ก่อนเขียน ไม่สร้างหรือแก้บัญชี และข้ามโครงการที่เคยเพิ่มแล้วเพื่อรักษาผลประเมินเดิม ไม่เพิ่มอีก 14 โครงการ ไม่ลบหรือเขียนทับข้อมูลที่มีอยู่

ตรวจสอบ:
```powershell
npm test
npm run lint
npm run build
npm run test:reviewer-example
```

หากต้องเผยแพร่ UI ภายหลัง รัน `npm run build` และ `firebase deploy --only hosting --project mfu-researchgrantmanagement` ด้วยตนเอง ไม่ต้อง deploy Functions หรือ Rules สำหรับการเปลี่ยนแปลงนี้
