// RS-1 stable field catalogue; additive keys retain existing proposals.
export const rs1LegacyFields = [
  {
    "key": "projectTitle",
    "th": "ชื่อโครงการ",
    "en": "Project Title",
    "type": "text"
  },
  {
    "key": "projectTitleEn",
    "th": "ชื่อโครงการภาษาอังกฤษ (ข้อมูลเพิ่มเติมของระบบ)",
    "en": "English Project Title (additional system field)",
    "type": "text"
  },
  {
    "key": "strategy",
    "th": "ยุทธศาสตร์มหาวิทยาลัย (เลือก 1 ข้อ)",
    "en": "University Strategy (choose one)",
    "type": "strategy"
  },
  {
    "key": "leaderName",
    "th": "ชื่อหัวหน้าโครงการ",
    "en": "Project Leader Name",
    "type": "text"
  },
  {
    "key": "leaderAffiliation",
    "th": "สังกัดหัวหน้าโครงการ",
    "en": "Leader Affiliation",
    "type": "text"
  },
  {
    "key": "leaderPhone",
    "th": "โทรศัพท์หัวหน้าโครงการ",
    "en": "Leader Telephone",
    "type": "text"
  },
  {
    "key": "leaderEmail",
    "th": "อีเมลหัวหน้าโครงการ",
    "en": "Leader Email",
    "type": "email"
  },
  {
    "key": "leaderPercent",
    "th": "สัดส่วนความรับผิดชอบของหัวหน้า (%)",
    "en": "Leader Responsibility (%)",
    "type": "number"
  },
  {
    "key": "participantName",
    "th": "ชื่อผู้ร่วมวิจัย",
    "en": "Participant Full Name",
    "type": "text"
  },
  {
    "key": "participantAffiliation",
    "th": "สังกัดผู้ร่วมวิจัย",
    "en": "Participant Affiliation",
    "type": "text"
  },
  {
    "key": "participantPhone",
    "th": "โทรศัพท์ผู้ร่วมวิจัย",
    "en": "Participant Telephone",
    "type": "text"
  },
  {
    "key": "participantEmail",
    "th": "อีเมลผู้ร่วมวิจัย",
    "en": "Participant Email",
    "type": "email"
  },
  {
    "key": "participantPercent",
    "th": "สัดส่วนความรับผิดชอบผู้ร่วมวิจัย (%)",
    "en": "Participant Responsibility (%)",
    "type": "number"
  },
  {
    "key": "participants",
    "th": "ผู้ร่วมวิจัย: ชื่อ สังกัด โทรศัพท์ อีเมล และสัดส่วนความรับผิดชอบ",
    "en": "Project Participants: name, affiliation, phone, email, responsibility",
    "type": "textarea"
  },
  {
    "key": "advisorName",
    "th": "ชื่อที่ปรึกษา",
    "en": "Advisor Name",
    "type": "text"
  },
  {
    "key": "advisorQualification",
    "th": "คุณวุฒิ",
    "en": "Educational Qualification",
    "type": "text"
  },
  {
    "key": "advisorPosition",
    "th": "ตำแหน่งทางวิชาการ",
    "en": "Academic Position",
    "type": "text"
  },
  {
    "key": "advisorAffiliation",
    "th": "สังกัด",
    "en": "Affiliation",
    "type": "text"
  },
  {
    "key": "cooperationName",
    "th": "ชื่อผู้ประสานงาน",
    "en": "Contact Name",
    "type": "text"
  },
  {
    "key": "cooperationAffiliation",
    "th": "สังกัด",
    "en": "Affiliation",
    "type": "text"
  },
  {
    "key": "cooperationAddress",
    "th": "ที่อยู่",
    "en": "Address",
    "type": "textarea"
  },
  {
    "key": "cooperationType",
    "th": "ลักษณะความร่วมมือ",
    "en": "Type of Cooperation",
    "type": "textarea"
  },
  {
    "key": "researchType",
    "th": "ประเภทงานวิจัย",
    "en": "Type of Research",
    "type": "text"
  },
  {
    "key": "keywords",
    "th": "คำสำคัญ",
    "en": "Keywords",
    "type": "textarea"
  },
  {
    "key": "background",
    "th": "ความเป็นมาและกรอบแนวคิด",
    "en": "Background and Conceptual Framework",
    "type": "textarea"
  },
  {
    "key": "objectives",
    "th": "วัตถุประสงค์ของโครงการ",
    "en": "Research Objectives",
    "type": "textarea"
  },
  {
    "key": "literature",
    "th": "การทบทวนวรรณกรรม",
    "en": "Literature Review",
    "type": "textarea"
  },
  {
    "key": "references",
    "th": "เอกสารอ้างอิงตามรูปแบบสากล",
    "en": "References (International Format)",
    "type": "textarea"
  },
  {
    "key": "methodology",
    "th": "วิธีดำเนินการวิจัย (รวมการเก็บข้อมูล กลุ่มตัวอย่าง การสุ่ม และการวิเคราะห์)",
    "en": "Methodology (data collection, samples, randomization, analysis)",
    "type": "textarea"
  },
  {
    "key": "scope",
    "th": "ขอบเขตและความสัมพันธ์กับชื่อและวัตถุประสงค์",
    "en": "Scope and relevance to title and objectives",
    "type": "textarea"
  },
  {
    "key": "startDate",
    "th": "วันที่เริ่มโครงการ",
    "en": "Start Date",
    "type": "date"
  },
  {
    "key": "endDate",
    "th": "วันที่สิ้นสุดโครงการ",
    "en": "End Date",
    "type": "date"
  },
  {
    "key": "workTask1",
    "th": "งานที่ 1",
    "en": "Task 1",
    "type": "text"
  },
  {
    "key": "workPeriod1",
    "th": "ช่วงเวลาที่ 1",
    "en": "Period 1",
    "type": "text"
  },
  {
    "key": "workTask2",
    "th": "งานที่ 2",
    "en": "Task 2",
    "type": "text"
  },
  {
    "key": "workPeriod2",
    "th": "ช่วงเวลาที่ 2",
    "en": "Period 2",
    "type": "text"
  },
  {
    "key": "workTask3",
    "th": "งานที่ 3",
    "en": "Task 3",
    "type": "text"
  },
  {
    "key": "workPeriod3",
    "th": "ช่วงเวลาที่ 3",
    "en": "Period 3",
    "type": "text"
  },
  {
    "key": "workPlan",
    "th": "รายการงานและช่วงเวลาดำเนินการ",
    "en": "Tasks and Periods",
    "type": "textarea"
  },
  {
    "key": "progress",
    "th": "ผลลัพธ์ที่คาดหวังตามช่วงรายงานความก้าวหน้า",
    "en": "Expected Outcomes by Reporting Period",
    "type": "textarea"
  },
  {
    "key": "outcomeType",
    "th": "ประเภทผลผลิต",
    "en": "Outcome Type",
    "type": "outcome"
  },
  {
    "key": "outcomeDetail",
    "th": "รายละเอียดผลผลิต",
    "en": "Outcome Details",
    "type": "textarea"
  },
  {
    "key": "integration",
    "th": "การบูรณาการศาสตร์อื่น",
    "en": "Integration with Other Disciplines",
    "type": "textarea"
  },
  {
    "key": "publicationLevel",
    "th": "ระดับการเผยแพร่",
    "en": "Dissemination Level",
    "type": "publication"
  },
  {
    "key": "compensationDetail",
    "th": "รายละเอียดค่าตอบแทน",
    "en": "Compensation Details",
    "type": "textarea"
  },
  {
    "key": "compensation",
    "th": "ค่าตอบแทน (บาท)",
    "en": "Compensation (THB)",
    "type": "number"
  },
  {
    "key": "compensationItem1",
    "th": "ค่าตอบแทน: รายการที่ 1 (แจกแจงตัวคูณ)",
    "en": "Compensation: Expense item 1 (multipliers)",
    "type": "text"
  },
  {
    "key": "compensationAmount1",
    "th": "ค่าตอบแทน: จำนวนเงินรายการที่ 1",
    "en": "Compensation: Item 1 amount",
    "type": "number"
  },
  {
    "key": "compensationItem2",
    "th": "ค่าตอบแทน: รายการที่ 2 (แจกแจงตัวคูณ)",
    "en": "Compensation: Expense item 2 (multipliers)",
    "type": "text"
  },
  {
    "key": "compensationAmount2",
    "th": "ค่าตอบแทน: จำนวนเงินรายการที่ 2",
    "en": "Compensation: Item 2 amount",
    "type": "number"
  },
  {
    "key": "compensationItem3",
    "th": "ค่าตอบแทน: รายการที่ 3 (แจกแจงตัวคูณ)",
    "en": "Compensation: Expense item 3 (multipliers)",
    "type": "text"
  },
  {
    "key": "compensationAmount3",
    "th": "ค่าตอบแทน: จำนวนเงินรายการที่ 3",
    "en": "Compensation: Item 3 amount",
    "type": "number"
  },
  {
    "key": "directDetail",
    "th": "รายละเอียดค่าใช้สอย",
    "en": "Direct Cost Details",
    "type": "textarea"
  },
  {
    "key": "directCost",
    "th": "ค่าใช้สอย (บาท)",
    "en": "Direct Cost (THB)",
    "type": "number"
  },
  {
    "key": "directCostItem1",
    "th": "ค่าใช้สอย: รายการที่ 1 (แจกแจงตัวคูณ)",
    "en": "Direct Cost: Expense item 1 (multipliers)",
    "type": "text"
  },
  {
    "key": "directCostAmount1",
    "th": "ค่าใช้สอย: จำนวนเงินรายการที่ 1",
    "en": "Direct Cost: Item 1 amount",
    "type": "number"
  },
  {
    "key": "directCostItem2",
    "th": "ค่าใช้สอย: รายการที่ 2 (แจกแจงตัวคูณ)",
    "en": "Direct Cost: Expense item 2 (multipliers)",
    "type": "text"
  },
  {
    "key": "directCostAmount2",
    "th": "ค่าใช้สอย: จำนวนเงินรายการที่ 2",
    "en": "Direct Cost: Item 2 amount",
    "type": "number"
  },
  {
    "key": "directCostItem3",
    "th": "ค่าใช้สอย: รายการที่ 3 (แจกแจงตัวคูณ)",
    "en": "Direct Cost: Expense item 3 (multipliers)",
    "type": "text"
  },
  {
    "key": "directCostAmount3",
    "th": "ค่าใช้สอย: จำนวนเงินรายการที่ 3",
    "en": "Direct Cost: Item 3 amount",
    "type": "number"
  },
  {
    "key": "materialsDetail",
    "th": "รายละเอียดค่าวัสดุ",
    "en": "Materials and Supplies Details",
    "type": "textarea"
  },
  {
    "key": "materials",
    "th": "ค่าวัสดุ (บาท)",
    "en": "Materials and Supplies (THB)",
    "type": "number"
  },
  {
    "key": "materialsItem1",
    "th": "ค่าวัสดุ: รายการที่ 1 (แจกแจงตัวคูณ)",
    "en": "Materials and Supplies: Expense item 1 (multipliers)",
    "type": "text"
  },
  {
    "key": "materialsAmount1",
    "th": "ค่าวัสดุ: จำนวนเงินรายการที่ 1",
    "en": "Materials and Supplies: Item 1 amount",
    "type": "number"
  },
  {
    "key": "materialsItem2",
    "th": "ค่าวัสดุ: รายการที่ 2 (แจกแจงตัวคูณ)",
    "en": "Materials and Supplies: Expense item 2 (multipliers)",
    "type": "text"
  },
  {
    "key": "materialsAmount2",
    "th": "ค่าวัสดุ: จำนวนเงินรายการที่ 2",
    "en": "Materials and Supplies: Item 2 amount",
    "type": "number"
  },
  {
    "key": "materialsItem3",
    "th": "ค่าวัสดุ: รายการที่ 3 (แจกแจงตัวคูณ)",
    "en": "Materials and Supplies: Expense item 3 (multipliers)",
    "type": "text"
  },
  {
    "key": "materialsAmount3",
    "th": "ค่าวัสดุ: จำนวนเงินรายการที่ 3",
    "en": "Materials and Supplies: Item 3 amount",
    "type": "number"
  },
  {
    "key": "utilityDetail",
    "th": "รายละเอียดค่าสาธารณูปโภค",
    "en": "Utility Details",
    "type": "textarea"
  },
  {
    "key": "utility",
    "th": "ค่าสาธารณูปโภค (บาท)",
    "en": "Utility (THB)",
    "type": "number"
  },
  {
    "key": "utilityItem1",
    "th": "ค่าสาธารณูปโภค: รายการที่ 1 (แจกแจงตัวคูณ)",
    "en": "Utility: Expense item 1 (multipliers)",
    "type": "text"
  },
  {
    "key": "utilityAmount1",
    "th": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 1",
    "en": "Utility: Item 1 amount",
    "type": "number"
  },
  {
    "key": "utilityItem2",
    "th": "ค่าสาธารณูปโภค: รายการที่ 2 (แจกแจงตัวคูณ)",
    "en": "Utility: Expense item 2 (multipliers)",
    "type": "text"
  },
  {
    "key": "utilityAmount2",
    "th": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 2",
    "en": "Utility: Item 2 amount",
    "type": "number"
  },
  {
    "key": "utilityItem3",
    "th": "ค่าสาธารณูปโภค: รายการที่ 3 (แจกแจงตัวคูณ)",
    "en": "Utility: Expense item 3 (multipliers)",
    "type": "text"
  },
  {
    "key": "utilityAmount3",
    "th": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 3",
    "en": "Utility: Item 3 amount",
    "type": "number"
  },
  {
    "key": "standards",
    "th": "ประเภทมาตรฐานที่เกี่ยวข้อง",
    "en": "Applicable Research Standards",
    "type": "standards"
  },
  {
    "key": "clarifications",
    "th": "คำชี้แจงเพิ่มเติม",
    "en": "Other Clarifications",
    "type": "textarea"
  },
  {
    "key": "advisorSignature",
    "th": "ชื่อผู้ลงนาม: ที่ปรึกษาโครงการ",
    "en": "Advisor Signatory Name",
    "type": "text"
  },
  {
    "key": "advisorSignDate",
    "th": "วันที่ลงนามที่ปรึกษา",
    "en": "Advisor Signature Date",
    "type": "date"
  },
  {
    "key": "leaderSignature",
    "th": "ชื่อผู้ลงนาม: หัวหน้าโครงการ",
    "en": "Leader Signatory Name",
    "type": "text"
  },
  {
    "key": "leaderSignDate",
    "th": "วันที่ลงนามหัวหน้า",
    "en": "Leader Signature Date",
    "type": "date"
  },
  {
    "key": "teamSignatureName",
    "th": "ชื่อผู้ลงนามผู้ร่วมวิจัย",
    "en": "Team Signatory Name",
    "type": "text"
  },
  {
    "key": "teamSignDate",
    "th": "วันที่ลงนามผู้ร่วมวิจัย",
    "en": "Team Signature Date",
    "type": "date"
  },
  {
    "key": "teamSignatures",
    "th": "รายชื่อผู้ร่วมวิจัยที่ลงนามและวันที่",
    "en": "Team Signatories and Dates",
    "type": "textarea"
  },
  {
    "key": "bioName",
    "th": "1. ชื่อ-นามสกุล",
    "en": "1. Full Name",
    "type": "text"
  },
  {
    "key": "bioPosition",
    "th": "2. ตำแหน่งทางวิชาการ",
    "en": "2. Academic Position",
    "type": "text"
  },
  {
    "key": "bioResearchId",
    "th": "3. เลขประจำตัวนักวิจัยแห่งชาติ (ถ้ามี)",
    "en": "3. National Researcher ID (if any)",
    "type": "text"
  },
  {
    "key": "bioEducation",
    "th": "4. ประวัติการศึกษา",
    "en": "4. Educational Background",
    "type": "textarea"
  },
  {
    "key": "bioExperience",
    "th": "5. ประสบการณ์ทำงาน",
    "en": "5. Working Experiences",
    "type": "textarea"
  },
  {
    "key": "bioExpertise",
    "th": "6. สาขาที่เชี่ยวชาญ",
    "en": "6. Areas of Expertise",
    "type": "textarea"
  },
  {
    "key": "bioPublications",
    "th": "7. ประวัติการตีพิมพ์ผลงานวิจัย",
    "en": "7. Research Publications",
    "type": "textarea"
  },
  {
    "key": "bioPresentations",
    "th": "8. ประวัติการนำเสนอผลงาน",
    "en": "8. Research Presentations",
    "type": "textarea"
  },
  {
    "key": "bioIP",
    "th": "9. ผลงานด้านทรัพย์สินทางปัญญา",
    "en": "9. Intellectual Property",
    "type": "textarea"
  },
  {
    "key": "bioManagement",
    "th": "10. ประสบการณ์บริหารงานวิจัย",
    "en": "10. Research Management Experience",
    "type": "textarea"
  },
  {
    "key": "bioCompleted",
    "th": "10.1 งานวิจัยที่เสร็จสิ้นแล้ว",
    "en": "10.1 Completed Research",
    "type": "textarea"
  },
  {
    "key": "bioOngoing",
    "th": "10.2 งานวิจัยที่กำลังดำเนินการ",
    "en": "10.2 Research in Progress",
    "type": "textarea"
  },
  {
    "key": "reviewer1Name",
    "th": "1. ชื่อ-นามสกุล",
    "en": "1. Full Name",
    "type": "text"
  },
  {
    "key": "reviewer1Position",
    "th": "1. ตำแหน่งทางวิชาการ",
    "en": "1. Academic Position",
    "type": "text"
  },
  {
    "key": "reviewer1Affiliation",
    "th": "1. สังกัด",
    "en": "1. Affiliation",
    "type": "text"
  },
  {
    "key": "reviewer1Email",
    "th": "1. อีเมล",
    "en": "1. Email",
    "type": "email"
  },
  {
    "key": "reviewer2Name",
    "th": "2. ชื่อ-นามสกุล",
    "en": "2. Full Name",
    "type": "text"
  },
  {
    "key": "reviewer2Position",
    "th": "2. ตำแหน่งทางวิชาการ",
    "en": "2. Academic Position",
    "type": "text"
  },
  {
    "key": "reviewer2Affiliation",
    "th": "2. สังกัด",
    "en": "2. Affiliation",
    "type": "text"
  },
  {
    "key": "reviewer2Email",
    "th": "2. อีเมล",
    "en": "2. Email",
    "type": "email"
  },
  {
    "key": "reviewer3Name",
    "th": "3. ชื่อ-นามสกุล",
    "en": "3. Full Name",
    "type": "text"
  },
  {
    "key": "reviewer3Position",
    "th": "3. ตำแหน่งทางวิชาการ",
    "en": "3. Academic Position",
    "type": "text"
  },
  {
    "key": "reviewer3Affiliation",
    "th": "3. สังกัด",
    "en": "3. Affiliation",
    "type": "text"
  },
  {
    "key": "reviewer3Email",
    "th": "3. อีเมล",
    "en": "3. Email",
    "type": "email"
  }
]
