// Exact source wording from the supplied seven-page RS-1; Thai is a translation, not a new policy.
export const RS1_SOURCE_SHA256 = "b7affd9fd52840801000a4a1f96aa86d6ab3b73fde34b386c25064a93319ed9b"
export const RS1_DOCUMENT_HEADER = "RS-1 Personal Budget"
export const rs1Document = [
  {
    "id": "title",
    "type": "heading",
    "page": 1,
    "en": "Project Proposal",
    "th": "ข้อเสนอโครงการ",
    "level": 1
  },
  {
    "id": "budget-type",
    "type": "fixed",
    "page": 1,
    "en": "Personal Budget",
    "th": "ทุนวิจัยส่วนตัว"
  },
  {
    "id": "project-title",
    "type": "field",
    "page": 1,
    "en": "1. Project Title",
    "th": "1. ชื่อโครงการ",
    "key": "projectTitle",
    "inputType": "text",
    "ariaEn": "Project Title *",
    "ariaTh": "ชื่อโครงการ *"
  },
  {
    "id": "strategy",
    "type": "choices",
    "page": 1,
    "en": "2. The project corresponds to the strategies of the university in the fields of (Selecting exactly one choice from a list, mark ✓ in □)",
    "th": "2. โครงการสอดคล้องกับยุทธศาสตร์มหาวิทยาลัยด้านใด (เลือกเพียงหนึ่งข้อ โดยทำเครื่องหมาย ✓ ใน □)",
    "key": "strategy",
    "multiple": false,
    "options": [
      {
        "value": "1",
        "en": "1. The project is relevant to the researcher’s qualification, faculty or line of duty",
        "th": "1. โครงการเกี่ยวข้องกับคุณวุฒิ คณะ หรือหน้าที่ของนักวิจัย"
      },
      {
        "value": "2",
        "en": "2. Developing human resource and knowledge",
        "th": "2. พัฒนาทรัพยากรมนุษย์และองค์ความรู้"
      },
      {
        "value": "3",
        "en": "3. Developing innovation for solving social issue",
        "th": "3. พัฒนานวัตกรรมเพื่อแก้ไขปัญหาสังคม"
      },
      {
        "value": "4",
        "en": "4. Developing innovation for increasing competitiveness",
        "th": "4. พัฒนานวัตกรรมเพื่อเพิ่มขีดความสามารถในการแข่งขัน"
      },
      {
        "value": "5",
        "en": "5. Developing innovation for spatial development and inequality decreasing",
        "th": "5. พัฒนานวัตกรรมเชิงพื้นที่และลดความเหลื่อมล้ำ"
      }
    ],
    "ariaEn": "University Strategy (choose one)",
    "ariaTh": "ยุทธศาสตร์มหาวิทยาลัย (เลือก 1 ข้อ)"
  },
  {
    "id": "part-a",
    "type": "heading",
    "page": 1,
    "en": "Part A:  Project information",
    "th": "ส่วน ก: ข้อมูลโครงการ",
    "level": 2
  },
  {
    "id": "a1",
    "type": "heading",
    "page": 1,
    "en": "1. The researcher(s)",
    "th": "1. คณะผู้วิจัย",
    "level": 3
  },
  {
    "id": "leader",
    "type": "people",
    "page": 1,
    "en": "1.1 Project Leader",
    "th": "1.1 หัวหน้าโครงการ",
    "role": "leader",
    "fields": [
      {
        "key": "leaderName",
        "en": "Full name:",
        "th": "ชื่อ-นามสกุล:",
        "inputType": "text",
        "ariaEn": "Project Leader Name *",
        "ariaTh": "ชื่อหัวหน้าโครงการ *"
      },
      {
        "key": "leaderAffiliation",
        "en": "Affiliation:",
        "th": "สังกัด:",
        "inputType": "text",
        "ariaEn": "Leader Affiliation",
        "ariaTh": "สังกัดหัวหน้าโครงการ"
      },
      {
        "key": "leaderPhone",
        "en": "Telephone number/Mobile number:",
        "th": "หมายเลขโทรศัพท์ / หมายเลขโทรศัพท์มือถือ:",
        "inputType": "text",
        "ariaEn": "Leader Telephone",
        "ariaTh": "โทรศัพท์หัวหน้าโครงการ"
      },
      {
        "key": "leaderEmail",
        "en": "E-mail:",
        "th": "อีเมล:",
        "inputType": "email",
        "ariaEn": "Leader Email",
        "ariaTh": "อีเมลหัวหน้าโครงการ"
      },
      {
        "key": "leaderPercent",
        "en": "Percentage of the responsibility toward the project:",
        "th": "ร้อยละความรับผิดชอบต่อโครงการ:",
        "inputType": "number",
        "ariaEn": "Leader Responsibility (%)",
        "ariaTh": "สัดส่วนความรับผิดชอบของหัวหน้า (%)"
      }
    ]
  },
  {
    "id": "participant",
    "type": "people",
    "page": 1,
    "en": "1.2 Project Participant",
    "th": "1.2 ผู้ร่วมโครงการ",
    "role": "participant",
    "fields": [
      {
        "key": "participantName",
        "en": "Full name:",
        "th": "ชื่อ-นามสกุล:",
        "inputType": "text",
        "ariaEn": "Participant Full Name",
        "ariaTh": "ชื่อผู้ร่วมวิจัย"
      },
      {
        "key": "participantAffiliation",
        "en": "Affiliation:",
        "th": "สังกัด:",
        "inputType": "text",
        "ariaEn": "Participant Affiliation",
        "ariaTh": "สังกัดผู้ร่วมวิจัย"
      },
      {
        "key": "participantPhone",
        "en": "Telephone number/Mobile number:",
        "th": "หมายเลขโทรศัพท์ / หมายเลขโทรศัพท์มือถือ:",
        "inputType": "text",
        "ariaEn": "Participant Telephone",
        "ariaTh": "โทรศัพท์ผู้ร่วมวิจัย"
      },
      {
        "key": "participantEmail",
        "en": "E-mail:",
        "th": "อีเมล:",
        "inputType": "email",
        "ariaEn": "Participant Email",
        "ariaTh": "อีเมลผู้ร่วมวิจัย"
      },
      {
        "key": "participantPercent",
        "en": "Percentage of the responsibility toward the project:",
        "th": "ร้อยละความรับผิดชอบต่อโครงการ:",
        "inputType": "number",
        "ariaEn": "Participant Responsibility (%)",
        "ariaTh": "สัดส่วนความรับผิดชอบผู้ร่วมวิจัย (%)"
      }
    ]
  },
  {
    "id": "a2",
    "type": "heading",
    "page": 1,
    "en": "2. Project Advisor",
    "th": "2. ที่ปรึกษาโครงการ",
    "level": 3
  },
  {
    "id": "advisorName",
    "type": "field",
    "page": 1,
    "en": "Full name:",
    "th": "ชื่อ-นามสกุล:",
    "key": "advisorName",
    "inputType": "text",
    "ariaEn": "Advisor Name",
    "ariaTh": "ชื่อที่ปรึกษา"
  },
  {
    "id": "advisorQualification",
    "type": "field",
    "page": 1,
    "en": "Educational qualification:",
    "th": "คุณวุฒิการศึกษา:",
    "key": "advisorQualification",
    "inputType": "text",
    "ariaEn": "Educational Qualification",
    "ariaTh": "คุณวุฒิ"
  },
  {
    "id": "advisorPosition",
    "type": "field",
    "page": 1,
    "en": "Academic positions:",
    "th": "ตำแหน่งทางวิชาการ:",
    "key": "advisorPosition",
    "inputType": "text",
    "ariaEn": "Academic Position",
    "ariaTh": "ตำแหน่งทางวิชาการ"
  },
  {
    "id": "advisorAffiliation",
    "type": "field",
    "page": 1,
    "en": "Affiliation:",
    "th": "สังกัด:",
    "key": "advisorAffiliation",
    "inputType": "text",
    "ariaEn": "Affiliation",
    "ariaTh": "สังกัด"
  },
  {
    "id": "a3",
    "type": "heading",
    "page": 2,
    "en": "3. Cooperation from other Agencies:",
    "th": "3. ความร่วมมือจากหน่วยงานอื่น:",
    "level": 3
  },
  {
    "id": "cooperationName",
    "type": "field",
    "page": 2,
    "en": "Full name:",
    "th": "ชื่อ-นามสกุล:",
    "key": "cooperationName",
    "inputType": "text",
    "ariaEn": "Contact Name",
    "ariaTh": "ชื่อผู้ประสานงาน"
  },
  {
    "id": "cooperationAffiliation",
    "type": "field",
    "page": 2,
    "en": "Affiliation:",
    "th": "สังกัด:",
    "key": "cooperationAffiliation",
    "inputType": "text",
    "ariaEn": "Affiliation",
    "ariaTh": "สังกัด"
  },
  {
    "id": "cooperationAddress",
    "type": "field",
    "page": 2,
    "en": "Address:",
    "th": "ที่อยู่:",
    "key": "cooperationAddress",
    "inputType": "text",
    "ariaEn": "Address",
    "ariaTh": "ที่อยู่"
  },
  {
    "id": "cooperationType",
    "type": "field",
    "page": 2,
    "en": "The type of research cooperation:",
    "th": "ลักษณะความร่วมมือด้านการวิจัย:",
    "key": "cooperationType",
    "inputType": "text",
    "ariaEn": "Type of Cooperation",
    "ariaTh": "ลักษณะความร่วมมือ"
  },
  {
    "id": "a4",
    "type": "field",
    "page": 2,
    "en": "4. Type of the Research",
    "th": "4. ประเภทของการวิจัย",
    "key": "researchType",
    "inputType": "text",
    "heading": true,
    "ariaEn": "Type of Research",
    "ariaTh": "ประเภทงานวิจัย"
  },
  {
    "id": "a5",
    "type": "field",
    "page": 2,
    "en": "5. Keywords of the Project",
    "th": "5. คำสำคัญของโครงการ",
    "key": "keywords",
    "inputType": "textarea",
    "heading": true,
    "ariaEn": "Keywords",
    "ariaTh": "คำสำคัญ"
  },
  {
    "id": "a6",
    "type": "field",
    "page": 2,
    "en": "6. The Background of the Research and the Conceptual Framework",
    "th": "6. ความเป็นมาของการวิจัยและกรอบแนวคิด",
    "key": "background",
    "inputType": "textarea",
    "heading": true,
    "ariaEn": "Background and Conceptual Framework",
    "ariaTh": "ความเป็นมาและกรอบแนวคิด"
  },
  {
    "id": "a7",
    "type": "field",
    "page": 2,
    "en": "7. Objectives of the Research Project",
    "th": "7. วัตถุประสงค์ของโครงการวิจัย",
    "key": "objectives",
    "inputType": "textarea",
    "heading": true,
    "ariaEn": "Research Objectives *",
    "ariaTh": "วัตถุประสงค์ของโครงการ *"
  },
  {
    "id": "a8",
    "type": "field",
    "page": 2,
    "en": "8. Literature Review",
    "th": "8. การทบทวนวรรณกรรม",
    "key": "literature",
    "inputType": "textarea",
    "heading": true,
    "ariaEn": "Literature Review",
    "ariaTh": "การทบทวนวรรณกรรม"
  },
  {
    "id": "a9",
    "type": "field",
    "page": 2,
    "en": "9. References (please specify according to the international format)",
    "th": "9. เอกสารอ้างอิง (โปรดระบุตามรูปแบบสากล)",
    "key": "references",
    "inputType": "textarea",
    "heading": true,
    "ariaEn": "References (International Format)",
    "ariaTh": "เอกสารอ้างอิงตามรูปแบบสากล"
  },
  {
    "id": "a10",
    "type": "field",
    "page": 2,
    "en": "10. Methodology",
    "th": "10. ระเบียบวิธีวิจัย",
    "key": "methodology",
    "inputType": "textarea",
    "heading": true,
    "instruction": {
      "en": "Please explain the methodology in detail, including data collection, the scope of the research, specimen, randomizing methods, and data analysis. If the researchers use the questionnaire, it should be attached.",
      "th": "โปรดอธิบายระเบียบวิธีวิจัยอย่างละเอียด รวมถึงการเก็บรวบรวมข้อมูล ขอบเขตการวิจัย ตัวอย่าง วิธีการสุ่ม และการวิเคราะห์ข้อมูล หากผู้วิจัยใช้แบบสอบถาม ต้องแนบแบบสอบถามด้วย"
    },
    "ariaEn": "Methodology (data collection, samples, randomization, analysis) *",
    "ariaTh": "วิธีดำเนินการวิจัย (รวมการเก็บข้อมูล กลุ่มตัวอย่าง การสุ่ม และการวิเคราะห์) *"
  },
  {
    "id": "a11",
    "type": "field",
    "page": 3,
    "en": "11. Scope of the Research",
    "th": "11. ขอบเขตการวิจัย",
    "key": "scope",
    "inputType": "textarea",
    "heading": true,
    "instruction": {
      "en": "Please specify the scope of the research and the relevance between the scope, the title, and the objectives of the project.",
      "th": "โปรดระบุขอบเขตการวิจัยและความสัมพันธ์ระหว่างขอบเขต ชื่อโครงการ และวัตถุประสงค์ของโครงการ"
    },
    "ariaEn": "Scope and relevance to title and objectives",
    "ariaTh": "ขอบเขตและความสัมพันธ์กับชื่อและวัตถุประสงค์"
  },
  {
    "id": "a12",
    "type": "heading",
    "page": 3,
    "en": "12. Working plan throughout the Research Project",
    "th": "12. แผนการดำเนินงานตลอดโครงการวิจัย",
    "level": 3
  },
  {
    "id": "duration",
    "type": "duration",
    "page": 3,
    "en": "The duration ……………………. to ………………………….. (Must not exceed 2 year, the research period shall each extension not exceeding six months. In this regard, the Principal Investigator shall submit an official memorandum requesting an extension of the research implementation period to the Research Administration Division prior to the expiration of the research period.).",
    "th": "ระยะเวลา ตั้งแต่ … ถึง … (ต้องไม่เกิน 2 ปี การขยายเวลาวิจัยแต่ละครั้งต้องไม่เกิน 6 เดือน โดยหัวหน้าโครงการต้องยื่นบันทึกข้อความขอขยายระยะเวลาดำเนินการวิจัยต่อส่วนบริหารงานวิจัยก่อนสิ้นสุดระยะเวลาวิจัย)",
    "fields": [
      {
        "key": "startDate",
        "en": "The duration",
        "th": "ระยะเวลาเริ่มต้น",
        "inputType": "date",
        "ariaEn": "Start Date *",
        "ariaTh": "วันที่เริ่มโครงการ *"
      },
      {
        "key": "endDate",
        "en": "to",
        "th": "ถึง",
        "inputType": "date",
        "ariaEn": "End Date *",
        "ariaTh": "วันที่สิ้นสุดโครงการ *"
      }
    ]
  },
  {
    "id": "work-plan",
    "type": "workTable",
    "page": 3,
    "en": "Task | Period",
    "th": "งาน | ช่วงเวลา",
    "headers": [
      "Task",
      "Period"
    ],
    "headersTh": [
      "งาน",
      "ช่วงเวลา"
    ],
    "rows": [
      [
        {
          "key": "workTask1",
          "en": "Task",
          "th": "งาน",
          "inputType": "text",
          "ariaEn": "Task 1",
          "ariaTh": "งานที่ 1",
          "placeholder": "1......."
        },
        {
          "key": "workPeriod1",
          "en": "Period",
          "th": "ช่วงเวลา",
          "inputType": "text",
          "ariaEn": "Period 1",
          "ariaTh": "ช่วงเวลาที่ 1"
        }
      ],
      [
        {
          "key": "workTask2",
          "en": "Task",
          "th": "งาน",
          "inputType": "text",
          "ariaEn": "Task 2",
          "ariaTh": "งานที่ 2",
          "placeholder": "2......."
        },
        {
          "key": "workPeriod2",
          "en": "Period",
          "th": "ช่วงเวลา",
          "inputType": "text",
          "ariaEn": "Period 2",
          "ariaTh": "ช่วงเวลาที่ 2"
        }
      ],
      [
        {
          "key": "workTask3",
          "en": "Task",
          "th": "งาน",
          "inputType": "text",
          "ariaEn": "Task 3",
          "ariaTh": "งานที่ 3",
          "placeholder": "3."
        },
        {
          "key": "workPeriod3",
          "en": "Period",
          "th": "ช่วงเวลา",
          "inputType": "text",
          "ariaEn": "Period 3",
          "ariaTh": "ช่วงเวลาที่ 3"
        }
      ]
    ]
  },
  {
    "id": "a13",
    "type": "field",
    "page": 3,
    "en": "13. Research Progress According to the Duration of Reporting the Progress of the Research",
    "th": "13. ความก้าวหน้าของการวิจัยตามระยะเวลารายงานความก้าวหน้าการวิจัย",
    "key": "progress",
    "inputType": "textarea",
    "heading": true,
    "instruction": {
      "en": "0% of the working plans, Please identify the expected outcomes according to the working plans in such a period of time. This is for the project progress evaluation.",
      "th": "0% ของแผนการดำเนินงาน โปรดระบุผลลัพธ์ที่คาดหวังตามแผนการดำเนินงานในช่วงเวลาดังกล่าว เพื่อใช้ประเมินความก้าวหน้าของโครงการ"
    },
    "ariaEn": "Expected Outcomes by Reporting Period",
    "ariaTh": "ผลลัพธ์ที่คาดหวังตามช่วงรายงานความก้าวหน้า"
  },
  {
    "id": "a14",
    "type": "choices",
    "page": 3,
    "en": "14. Expected Outcomes of the Research",
    "th": "14. ผลผลิตที่คาดว่าจะได้รับจากการวิจัย",
    "key": "outcomeType",
    "multiple": false,
    "options": [
      {
        "value": "international",
        "en": "Publishing in international academic journals listed in the database according to the criteria for considering academic journals for the publication of academic work 2019 announcement from the committee of Civil Servant in Higher Education Institutions. Or Announcement of the Civil Service Commission on Criteria and Procedures for Appointing Persons to be Assistant Professors Associate Professor and Professor 2021. Or",
        "th": "ตีพิมพ์ในวารสารวิชาการระดับนานาชาติที่มีรายชื่ออยู่ในฐานข้อมูลตามประกาศคณะกรรมการข้าราชการพลเรือนในสถาบันอุดมศึกษา เรื่องหลักเกณฑ์การพิจารณาวารสารทางวิชาการสำหรับการเผยแพร่ผลงานทางวิชาการ พ.ศ. 2562 หรือประกาศคณะกรรมการข้าราชการพลเรือน เรื่องหลักเกณฑ์และวิธีการแต่งตั้งบุคคลให้ดำรงตำแหน่งผู้ช่วยศาสตราจารย์ รองศาสตราจารย์ และศาสตราจารย์ พ.ศ. 2564 หรือ"
      },
      {
        "value": "national",
        "en": "Publishing in national academic journals that appear in the TCI group 1 or group 2. Or",
        "th": "ตีพิมพ์ในวารสารวิชาการระดับชาติที่อยู่ในฐานข้อมูล TCI กลุ่ม 1 หรือกลุ่ม 2 หรือ"
      },
      {
        "value": "conference",
        "en": "Presenting at international academic conferences. It must be a complete article (full paper) which is published in the proceedings. Or",
        "th": "นำเสนอในการประชุมวิชาการระดับนานาชาติ โดยเป็นบทความฉบับเต็ม (full paper) ที่เผยแพร่ในรายงานสืบเนื่องจากการประชุม (proceedings) หรือ"
      },
      {
        "value": "patent",
        "en": "Petty patent/patent (with the application number) Or",
        "th": "อนุสิทธิบัตร/สิทธิบัตร (พร้อมเลขที่คำขอ) หรือ"
      },
      {
        "value": "other",
        "en": "Other Please explain",
        "th": "อื่น ๆ โปรดอธิบาย"
      }
    ],
    "ariaEn": "Outcome Type",
    "ariaTh": "ประเภทผลผลิต"
  },
  {
    "id": "other-outcome",
    "type": "field",
    "page": 3,
    "en": "",
    "th": "",
    "key": "outcomeDetail",
    "inputType": "textarea",
    "ariaEn": "Outcome Details",
    "ariaTh": "รายละเอียดผลผลิต"
  },
  {
    "id": "a15",
    "type": "field",
    "page": 4,
    "en": "15. Integration of Research",
    "th": "15. การบูรณาการงานวิจัย",
    "key": "integration",
    "inputType": "textarea",
    "heading": true,
    "instruction": {
      "en": "Is there any integration of other disciplines in the research? (Please explain).",
      "th": "มีการบูรณาการศาสตร์อื่นในงานวิจัยหรือไม่ (โปรดอธิบาย)"
    },
    "ariaEn": "Integration with Other Disciplines",
    "ariaTh": "การบูรณาการศาสตร์อื่น"
  },
  {
    "id": "a16",
    "type": "choices",
    "page": 4,
    "en": "16. Level of Publishing to Societies",
    "th": "16. ระดับการเผยแพร่สู่สังคม",
    "key": "publicationLevel",
    "multiple": false,
    "options": [
      {
        "value": "broad",
        "en": "Could be used as a sample and guidelines at the regional, national, and international levels",
        "th": "สามารถใช้เป็นตัวอย่างและแนวทางในระดับภูมิภาค ประเทศ และนานาชาติ"
      },
      {
        "value": "local",
        "en": "Could be used as a sample and guidelines for particular jobs, villages, or provinces",
        "th": "สามารถใช้เป็นตัวอย่างและแนวทางสำหรับงานเฉพาะ หมู่บ้าน หรือจังหวัด"
      },
      {
        "value": "none",
        "en": "Not be published to societies",
        "th": "ไม่เผยแพร่สู่สังคม"
      }
    ],
    "ariaEn": "Dissemination Level",
    "ariaTh": "ระดับการเผยแพร่"
  },
  {
    "id": "a17",
    "type": "heading",
    "page": 4,
    "en": "17. Details regarding the Research Budgets Categorized according to the Types of Budgets",
    "th": "17. รายละเอียดงบประมาณการวิจัยจำแนกตามประเภทงบประมาณ",
    "level": 3
  },
  {
    "id": "budget-instruction",
    "type": "text",
    "page": 4,
    "en": "(must expense list, but do not need to submit payment documents or receipt to close the project)",
    "th": "(ต้องแจกแจงรายการค่าใช้จ่าย แต่ไม่ต้องส่งหลักฐานการจ่ายเงินหรือใบเสร็จรับเงินเพื่อปิดโครงการ)"
  },
  {
    "id": "budget",
    "type": "budgetTable",
    "page": 4,
    "en": "",
    "th": "",
    "headers": [
      "The Expense list (diffuse the multipliers)",
      "Amount (Baht)"
    ],
    "headersTh": [
      "รายการค่าใช้จ่าย (แจกแจงตัวคูณ)",
      "จำนวนเงิน (บาท)"
    ],
    "caption": "Budget for conducting the research",
    "captionTh": "งบประมาณสำหรับดำเนินการวิจัย",
    "categories": [
      {
        "key": "compensation",
        "en": "Category 1: Compensation",
        "th": "หมวดที่ 1: ค่าตอบแทน",
        "rows": [
          [
            {
              "key": "compensationItem1",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Compensation: Expense item 1 (multipliers)",
              "ariaTh": "ค่าตอบแทน: รายการที่ 1 (แจกแจงตัวคูณ)"
            },
            {
              "key": "compensationAmount1",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Compensation: Item 1 amount",
              "ariaTh": "ค่าตอบแทน: จำนวนเงินรายการที่ 1"
            }
          ],
          [
            {
              "key": "compensationItem2",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Compensation: Expense item 2 (multipliers)",
              "ariaTh": "ค่าตอบแทน: รายการที่ 2 (แจกแจงตัวคูณ)"
            },
            {
              "key": "compensationAmount2",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Compensation: Item 2 amount",
              "ariaTh": "ค่าตอบแทน: จำนวนเงินรายการที่ 2"
            }
          ],
          [
            {
              "key": "compensationItem3",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Compensation: Expense item 3 (multipliers)",
              "ariaTh": "ค่าตอบแทน: รายการที่ 3 (แจกแจงตัวคูณ)"
            },
            {
              "key": "compensationAmount3",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Compensation: Item 3 amount",
              "ariaTh": "ค่าตอบแทน: จำนวนเงินรายการที่ 3"
            }
          ]
        ]
      },
      {
        "key": "directCost",
        "en": "Category 2:  Direct Cost",
        "th": "หมวดที่ 2: ค่าใช้สอย",
        "rows": [
          [
            {
              "key": "directCostItem1",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Direct Cost: Expense item 1 (multipliers)",
              "ariaTh": "ค่าใช้สอย: รายการที่ 1 (แจกแจงตัวคูณ)"
            },
            {
              "key": "directCostAmount1",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Direct Cost: Item 1 amount",
              "ariaTh": "ค่าใช้สอย: จำนวนเงินรายการที่ 1"
            }
          ],
          [
            {
              "key": "directCostItem2",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Direct Cost: Expense item 2 (multipliers)",
              "ariaTh": "ค่าใช้สอย: รายการที่ 2 (แจกแจงตัวคูณ)"
            },
            {
              "key": "directCostAmount2",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Direct Cost: Item 2 amount",
              "ariaTh": "ค่าใช้สอย: จำนวนเงินรายการที่ 2"
            }
          ],
          [
            {
              "key": "directCostItem3",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Direct Cost: Expense item 3 (multipliers)",
              "ariaTh": "ค่าใช้สอย: รายการที่ 3 (แจกแจงตัวคูณ)"
            },
            {
              "key": "directCostAmount3",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Direct Cost: Item 3 amount",
              "ariaTh": "ค่าใช้สอย: จำนวนเงินรายการที่ 3"
            }
          ]
        ]
      },
      {
        "key": "materials",
        "en": "Category 3: Materials and Supplies",
        "th": "หมวดที่ 3: ค่าวัสดุและอุปกรณ์",
        "rows": [
          [
            {
              "key": "materialsItem1",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Materials and Supplies: Expense item 1 (multipliers)",
              "ariaTh": "ค่าวัสดุ: รายการที่ 1 (แจกแจงตัวคูณ)"
            },
            {
              "key": "materialsAmount1",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Materials and Supplies: Item 1 amount",
              "ariaTh": "ค่าวัสดุ: จำนวนเงินรายการที่ 1"
            }
          ],
          [
            {
              "key": "materialsItem2",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Materials and Supplies: Expense item 2 (multipliers)",
              "ariaTh": "ค่าวัสดุ: รายการที่ 2 (แจกแจงตัวคูณ)"
            },
            {
              "key": "materialsAmount2",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Materials and Supplies: Item 2 amount",
              "ariaTh": "ค่าวัสดุ: จำนวนเงินรายการที่ 2"
            }
          ],
          [
            {
              "key": "materialsItem3",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Materials and Supplies: Expense item 3 (multipliers)",
              "ariaTh": "ค่าวัสดุ: รายการที่ 3 (แจกแจงตัวคูณ)"
            },
            {
              "key": "materialsAmount3",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Materials and Supplies: Item 3 amount",
              "ariaTh": "ค่าวัสดุ: จำนวนเงินรายการที่ 3"
            }
          ]
        ]
      },
      {
        "key": "utility",
        "en": "Category 4: Utility",
        "th": "หมวดที่ 4: ค่าสาธารณูปโภค",
        "rows": [
          [
            {
              "key": "utilityItem1",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Utility: Expense item 1 (multipliers)",
              "ariaTh": "ค่าสาธารณูปโภค: รายการที่ 1 (แจกแจงตัวคูณ)"
            },
            {
              "key": "utilityAmount1",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Utility: Item 1 amount",
              "ariaTh": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 1"
            }
          ],
          [
            {
              "key": "utilityItem2",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Utility: Expense item 2 (multipliers)",
              "ariaTh": "ค่าสาธารณูปโภค: รายการที่ 2 (แจกแจงตัวคูณ)"
            },
            {
              "key": "utilityAmount2",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Utility: Item 2 amount",
              "ariaTh": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 2"
            }
          ],
          [
            {
              "key": "utilityItem3",
              "en": "",
              "th": "",
              "inputType": "text",
              "ariaEn": "Utility: Expense item 3 (multipliers)",
              "ariaTh": "ค่าสาธารณูปโภค: รายการที่ 3 (แจกแจงตัวคูณ)"
            },
            {
              "key": "utilityAmount3",
              "en": "",
              "th": "",
              "inputType": "number",
              "ariaEn": "Utility: Item 3 amount",
              "ariaTh": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 3"
            }
          ]
        ]
      }
    ],
    "total": "The total budget to propose (Baht)",
    "totalTh": "งบประมาณรวมที่เสนอขอ (บาท)"
  },
  {
    "id": "a18",
    "type": "choices",
    "page": 5,
    "en": "18. Research standards",
    "th": "18. มาตรฐานการวิจัย",
    "key": "standards",
    "multiple": true,
    "instruction": {
      "en": "(specify the type, If the research project has already been approved by the committee, please apply for certification according to the type of standard, and attach a certificate of ethics in the complete research report)",
      "th": "(ระบุประเภท หากโครงการวิจัยได้รับการอนุมัติจากคณะกรรมการแล้ว ให้ยื่นขอรับรองตามประเภทมาตรฐาน และแนบใบรับรองจริยธรรมในรายงานวิจัยฉบับสมบูรณ์)"
    },
    "options": [
      {
        "value": "none",
        "en": "No human trail / No animal use / Modern biotechnology-related research",
        "th": "ไม่มีการทดลองในมนุษย์ / ไม่มีการใช้สัตว์ / งานวิจัยเกี่ยวกับเทคโนโลยีชีวภาพสมัยใหม่"
      },
      {
        "value": "human",
        "en": "Research has been done on humans",
        "th": "มีการวิจัยในมนุษย์"
      },
      {
        "value": "animal",
        "en": "Experimental animals were used",
        "th": "มีการใช้สัตว์ทดลอง"
      },
      {
        "value": "plants",
        "en": "There is a collection, procurement or collection of common native and wild plant species or any part of plant, mushroom and fungi for study, experimentation or research in accordance with Section 53 of the Plant Protection (1999)",
        "th": "มีการเก็บ จัดหา หรือรวบรวมพันธุ์พืชพื้นเมืองทั่วไปและพันธุ์พืชป่า หรือส่วนใดส่วนหนึ่งของพืช เห็ด และรา เพื่อศึกษา ทดลอง หรือวิจัย ตามมาตรา 53 แห่งพระราชบัญญัติคุ้มครองพันธุ์พืช พ.ศ. 2542"
      }
    ],
    "ariaEn": "Applicable Research Standards",
    "ariaTh": "ประเภทมาตรฐานที่เกี่ยวข้อง"
  },
  {
    "id": "a19",
    "type": "field",
    "page": 5,
    "en": "19. Other clarifications (if any)",
    "th": "19. คำชี้แจงอื่น ๆ (ถ้ามี)",
    "key": "clarifications",
    "inputType": "textarea",
    "heading": true,
    "ariaEn": "Other Clarifications",
    "ariaTh": "คำชี้แจงเพิ่มเติม"
  },
  {
    "id": "signature-advisor",
    "type": "signature",
    "page": 5,
    "en": "Signature",
    "th": "ลงลายมือชื่อ",
    "role": "advisor",
    "title": "Research Project Advisor",
    "titleTh": "ที่ปรึกษาโครงการวิจัย",
    "fields": [
      {
        "key": "advisorSignature",
        "en": "(...........................................................)",
        "th": "(...........................................................)",
        "inputType": "text",
        "ariaEn": "Advisor Signatory Name",
        "ariaTh": "ชื่อผู้ลงนาม: ที่ปรึกษาโครงการ"
      },
      {
        "key": "advisorSignDate",
        "en": "Date ...................................................",
        "th": "วันที่ ...................................................",
        "inputType": "date",
        "ariaEn": "Advisor Signature Date",
        "ariaTh": "วันที่ลงนามที่ปรึกษา"
      }
    ]
  },
  {
    "id": "signature-leader",
    "type": "signature",
    "page": 5,
    "en": "Signature",
    "th": "ลงลายมือชื่อ",
    "role": "leader",
    "title": "Project Leader",
    "titleTh": "หัวหน้าโครงการ",
    "fields": [
      {
        "key": "leaderSignature",
        "en": "(...........................................................)",
        "th": "(...........................................................)",
        "inputType": "text",
        "ariaEn": "Leader Signatory Name",
        "ariaTh": "ชื่อผู้ลงนาม: หัวหน้าโครงการ"
      },
      {
        "key": "leaderSignDate",
        "en": "Date ...................................................",
        "th": "วันที่ ...................................................",
        "inputType": "date",
        "ariaEn": "Leader Signature Date",
        "ariaTh": "วันที่ลงนามหัวหน้า"
      }
    ]
  },
  {
    "id": "signature-team",
    "type": "signature",
    "page": 5,
    "en": "Signature",
    "th": "ลงลายมือชื่อ",
    "role": "team",
    "title": "Project Team Members",
    "titleTh": "ผู้ร่วมโครงการ",
    "fields": [
      {
        "key": "teamSignatureName",
        "en": "(.................................................)",
        "th": "(.................................................)",
        "inputType": "text",
        "ariaEn": "Team Signatory Name",
        "ariaTh": "ชื่อผู้ลงนามผู้ร่วมวิจัย"
      },
      {
        "key": "teamSignDate",
        "en": "Date ...................................................",
        "th": "วันที่ ...................................................",
        "inputType": "date",
        "ariaEn": "Team Signature Date",
        "ariaTh": "วันที่ลงนามผู้ร่วมวิจัย"
      }
    ]
  },
  {
    "id": "signature-note",
    "type": "text",
    "page": 5,
    "en": "Note. If an electronic signature is used, the owner's consent must be obtained.",
    "th": "หมายเหตุ หากใช้ลายเซ็นอิเล็กทรอนิกส์ ต้องได้รับความยินยอมจากเจ้าของลายเซ็น"
  },
  {
    "id": "part-b",
    "type": "heading",
    "page": 6,
    "en": "Part B: Autobiography of the researchers",
    "th": "ส่วน ข: ประวัติของผู้วิจัย",
    "level": 2
  },
  {
    "id": "b1",
    "type": "field",
    "page": 6,
    "en": "1. Full name:",
    "th": "1. ชื่อ-นามสกุล:",
    "key": "bioName",
    "inputType": "text",
    "ariaEn": "1. Full Name",
    "ariaTh": "1. ชื่อ-นามสกุล"
  },
  {
    "id": "b2",
    "type": "field",
    "page": 6,
    "en": "2. Academic position:",
    "th": "2. ตำแหน่งทางวิชาการ:",
    "key": "bioPosition",
    "inputType": "text",
    "ariaEn": "2. Academic Position",
    "ariaTh": "2. ตำแหน่งทางวิชาการ"
  },
  {
    "id": "b3",
    "type": "field",
    "page": 6,
    "en": "3. National Researcher Identification Number (if any):",
    "th": "3. เลขประจำตัวนักวิจัยแห่งชาติ (ถ้ามี):",
    "key": "bioResearchId",
    "inputType": "text",
    "ariaEn": "3. National Researcher ID (if any)",
    "ariaTh": "3. เลขประจำตัวนักวิจัยแห่งชาติ (ถ้ามี)"
  },
  {
    "id": "b4",
    "type": "field",
    "page": 6,
    "en": "4. Educational background:",
    "th": "4. ประวัติการศึกษา:",
    "key": "bioEducation",
    "inputType": "textarea",
    "ariaEn": "4. Educational Background",
    "ariaTh": "4. ประวัติการศึกษา"
  },
  {
    "id": "b5",
    "type": "field",
    "page": 6,
    "en": "5. Working experiences:",
    "th": "5. ประสบการณ์ทำงาน:",
    "key": "bioExperience",
    "inputType": "textarea",
    "ariaEn": "5. Working Experiences",
    "ariaTh": "5. ประสบการณ์ทำงาน"
  },
  {
    "id": "b6",
    "type": "field",
    "page": 6,
    "en": "6. Academic disciplines with special expertise (different from educational qualifications) specify academic fields.",
    "th": "6. สาขาวิชาที่มีความเชี่ยวชาญเป็นพิเศษ (แตกต่างจากคุณวุฒิการศึกษา) โปรดระบุสาขาวิชาการ",
    "key": "bioExpertise",
    "inputType": "textarea",
    "ariaEn": "6. Areas of Expertise",
    "ariaTh": "6. สาขาที่เชี่ยวชาญ"
  },
  {
    "id": "b7",
    "type": "field",
    "page": 6,
    "en": "7. History of publishing research both inside and outside the country. Please specify the title of the work, the name of the journal according to the international system.",
    "th": "7. ประวัติการตีพิมพ์ผลงานวิจัยทั้งในและต่างประเทศ โปรดระบุชื่อผลงานและชื่อวารสารตามรูปแบบสากล",
    "key": "bioPublications",
    "inputType": "textarea",
    "ariaEn": "7. Research Publications",
    "ariaTh": "7. ประวัติการตีพิมพ์ผลงานวิจัย"
  },
  {
    "id": "b8",
    "type": "field",
    "page": 6,
    "en": "8. History of research presentations both inside and outside the country. Please specify the title of the work. Meeting name, place, date, and time according to the international system.",
    "th": "8. ประวัติการนำเสนอผลงานวิจัยทั้งในและต่างประเทศ โปรดระบุชื่อผลงาน ชื่อการประชุม สถานที่ วันที่ และเวลาตามรูปแบบสากล",
    "key": "bioPresentations",
    "inputType": "textarea",
    "ariaEn": "8. Research Presentations",
    "ariaTh": "8. ประวัติการนำเสนอผลงาน"
  },
  {
    "id": "b9",
    "type": "field",
    "page": 6,
    "en": "9. Research that has been registered with intellectual property or research results that are in the process of applying for intellectual property registration.",
    "th": "9. ผลงานวิจัยที่จดทะเบียนทรัพย์สินทางปัญญาแล้ว หรือผลงานวิจัยที่อยู่ระหว่างยื่นขอจดทะเบียนทรัพย์สินทางปัญญา",
    "key": "bioIP",
    "inputType": "textarea",
    "ariaEn": "9. Intellectual Property",
    "ariaTh": "9. ผลงานด้านทรัพย์สินทางปัญญา"
  },
  {
    "id": "b10",
    "type": "field",
    "page": 6,
    "en": "10. Experience related to research management both domestically and internationally, indicating the research position as the director of the research plan, the head of the research project, or co-researchers in each research proposal, and state the research status as well.",
    "th": "10. ประสบการณ์ด้านการบริหารงานวิจัยทั้งในและต่างประเทศ โดยระบุบทบาทผู้อำนวยการแผนงานวิจัย หัวหน้าโครงการวิจัย หรือผู้ร่วมวิจัยของแต่ละข้อเสนอโครงการ พร้อมระบุสถานะการวิจัย",
    "key": "bioManagement",
    "inputType": "textarea",
    "ariaEn": "10. Research Management Experience",
    "ariaTh": "10. ประสบการณ์บริหารงานวิจัย"
  },
  {
    "id": "b10.1",
    "type": "field",
    "page": 6,
    "en": "10.1 Completed Research: Research title, research proportion (%), research team and co-institution, funding source, year of funding, and publishing research results.",
    "th": "10.1 งานวิจัยที่เสร็จสิ้น: ชื่อเรื่อง สัดส่วนการวิจัย (%) ทีมวิจัยและสถาบันร่วม แหล่งทุน ปีที่ได้รับทุน และการเผยแพร่ผลการวิจัย",
    "key": "bioCompleted",
    "inputType": "textarea",
    "ariaEn": "10.1 Completed Research",
    "ariaTh": "10.1 งานวิจัยที่เสร็จสิ้นแล้ว"
  },
  {
    "id": "b10.2",
    "type": "field",
    "page": 6,
    "en": "10.2 Research in progress: Research title, research proportion (%), research team and co-institution, funding source, year of funding, and research status.",
    "th": "10.2 งานวิจัยที่กำลังดำเนินการ: ชื่อเรื่อง สัดส่วนการวิจัย (%) ทีมวิจัยและสถาบันร่วม แหล่งทุน ปีที่ได้รับทุน และสถานะการวิจัย",
    "key": "bioOngoing",
    "inputType": "textarea",
    "ariaEn": "10.2 Research in Progress",
    "ariaTh": "10.2 งานวิจัยที่กำลังดำเนินการ"
  },
  {
    "id": "part-c",
    "type": "heading",
    "page": 7,
    "en": "Part C: List of reviewers for final report (in case submitting final report 5 chapter)",
    "th": "ส่วน ค: รายชื่อผู้ทรงคุณวุฒิประเมินรายงานฉบับสมบูรณ์ (กรณีส่งรายงานฉบับสมบูรณ์ 5 บท)",
    "level": 2
  },
  {
    "id": "requirements",
    "type": "heading",
    "page": 7,
    "en": "Requirements",
    "th": "ข้อกำหนด",
    "level": 3
  },
  {
    "id": "c-requirement-1",
    "type": "text",
    "page": 7,
    "en": "The project leader contacted the peer reviewers personally before proposing the name",
    "th": "หัวหน้าโครงการติดต่อผู้ทรงคุณวุฒิด้วยตนเองก่อนเสนอชื่อ"
  },
  {
    "id": "c-requirement-2",
    "type": "text",
    "page": 7,
    "en": "Not a person who a research consultant, and research project participant.",
    "th": "ไม่เป็นที่ปรึกษาหรือผู้ร่วมโครงการวิจัย"
  },
  {
    "id": "c-requirement-3",
    "type": "text",
    "page": 7,
    "en": "Obtained a Ph.D.",
    "th": "สำเร็จการศึกษาระดับปริญญาเอก"
  },
  {
    "id": "c-requirement-4",
    "type": "text",
    "page": 7,
    "en": "Be an outsider or within the university, 3 people per 1 project.",
    "th": "เป็นบุคคลภายนอกหรือภายในมหาวิทยาลัย จำนวน 3 คนต่อ 1 โครงการ"
  },
  {
    "id": "c1-Name",
    "type": "field",
    "page": 7,
    "en": "1. Full name:",
    "th": "1. ชื่อ-นามสกุล:",
    "key": "reviewer1Name",
    "inputType": "text",
    "ariaEn": "1. Full Name",
    "ariaTh": "1. ชื่อ-นามสกุล"
  },
  {
    "id": "c1-Position",
    "type": "field",
    "page": 7,
    "en": "Academic position:",
    "th": "ตำแหน่งทางวิชาการ:",
    "key": "reviewer1Position",
    "inputType": "text",
    "ariaEn": "1. Academic Position",
    "ariaTh": "1. ตำแหน่งทางวิชาการ"
  },
  {
    "id": "c1-Affiliation",
    "type": "field",
    "page": 7,
    "en": "Affiliation:",
    "th": "สังกัด:",
    "key": "reviewer1Affiliation",
    "inputType": "text",
    "ariaEn": "1. Affiliation",
    "ariaTh": "1. สังกัด"
  },
  {
    "id": "c1-Email",
    "type": "field",
    "page": 7,
    "en": "E-mail:",
    "th": "อีเมล:",
    "key": "reviewer1Email",
    "inputType": "email",
    "ariaEn": "1. Email",
    "ariaTh": "1. อีเมล"
  },
  {
    "id": "c2-Name",
    "type": "field",
    "page": 7,
    "en": "2. Full name:",
    "th": "2. ชื่อ-นามสกุล:",
    "key": "reviewer2Name",
    "inputType": "text",
    "ariaEn": "2. Full Name",
    "ariaTh": "2. ชื่อ-นามสกุล"
  },
  {
    "id": "c2-Position",
    "type": "field",
    "page": 7,
    "en": "Academic position:",
    "th": "ตำแหน่งทางวิชาการ:",
    "key": "reviewer2Position",
    "inputType": "text",
    "ariaEn": "2. Academic Position",
    "ariaTh": "2. ตำแหน่งทางวิชาการ"
  },
  {
    "id": "c2-Affiliation",
    "type": "field",
    "page": 7,
    "en": "Affiliation:",
    "th": "สังกัด:",
    "key": "reviewer2Affiliation",
    "inputType": "text",
    "ariaEn": "2. Affiliation",
    "ariaTh": "2. สังกัด"
  },
  {
    "id": "c2-Email",
    "type": "field",
    "page": 7,
    "en": "E-mail:",
    "th": "อีเมล:",
    "key": "reviewer2Email",
    "inputType": "email",
    "ariaEn": "2. Email",
    "ariaTh": "2. อีเมล"
  },
  {
    "id": "c3-Name",
    "type": "field",
    "page": 7,
    "en": "3. Full name:",
    "th": "3. ชื่อ-นามสกุล:",
    "key": "reviewer3Name",
    "inputType": "text",
    "ariaEn": "3. Full Name",
    "ariaTh": "3. ชื่อ-นามสกุล"
  },
  {
    "id": "c3-Position",
    "type": "field",
    "page": 7,
    "en": "Academic position:",
    "th": "ตำแหน่งทางวิชาการ:",
    "key": "reviewer3Position",
    "inputType": "text",
    "ariaEn": "3. Academic Position",
    "ariaTh": "3. ตำแหน่งทางวิชาการ"
  },
  {
    "id": "c3-Affiliation",
    "type": "field",
    "page": 7,
    "en": "Affiliation:",
    "th": "สังกัด:",
    "key": "reviewer3Affiliation",
    "inputType": "text",
    "ariaEn": "3. Affiliation",
    "ariaTh": "3. สังกัด"
  },
  {
    "id": "c3-Email",
    "type": "field",
    "page": 7,
    "en": "E-mail:",
    "th": "อีเมล:",
    "key": "reviewer3Email",
    "inputType": "email",
    "ariaEn": "3. Email",
    "ariaTh": "3. อีเมล"
  }
]
export const rs1DocumentFields = [
  {
    "key": "projectTitle",
    "en": "1. Project Title",
    "th": "1. ชื่อโครงการ",
    "type": "text",
    "ariaEn": "Project Title *",
    "ariaTh": "ชื่อโครงการ *"
  },
  {
    "key": "strategy",
    "en": "2. The project corresponds to the strategies of the university in the fields of (Selecting exactly one choice from a list, mark ✓ in □)",
    "th": "2. โครงการสอดคล้องกับยุทธศาสตร์มหาวิทยาลัยด้านใด (เลือกเพียงหนึ่งข้อ โดยทำเครื่องหมาย ✓ ใน □)",
    "type": "choices",
    "ariaEn": "University Strategy (choose one)",
    "ariaTh": "ยุทธศาสตร์มหาวิทยาลัย (เลือก 1 ข้อ)",
    "options": [
      {
        "value": "1",
        "en": "1. The project is relevant to the researcher’s qualification, faculty or line of duty",
        "th": "1. โครงการเกี่ยวข้องกับคุณวุฒิ คณะ หรือหน้าที่ของนักวิจัย"
      },
      {
        "value": "2",
        "en": "2. Developing human resource and knowledge",
        "th": "2. พัฒนาทรัพยากรมนุษย์และองค์ความรู้"
      },
      {
        "value": "3",
        "en": "3. Developing innovation for solving social issue",
        "th": "3. พัฒนานวัตกรรมเพื่อแก้ไขปัญหาสังคม"
      },
      {
        "value": "4",
        "en": "4. Developing innovation for increasing competitiveness",
        "th": "4. พัฒนานวัตกรรมเพื่อเพิ่มขีดความสามารถในการแข่งขัน"
      },
      {
        "value": "5",
        "en": "5. Developing innovation for spatial development and inequality decreasing",
        "th": "5. พัฒนานวัตกรรมเชิงพื้นที่และลดความเหลื่อมล้ำ"
      }
    ],
    "multiple": false
  },
  {
    "key": "leaderName",
    "en": "Full name:",
    "th": "ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "Project Leader Name *",
    "ariaTh": "ชื่อหัวหน้าโครงการ *"
  },
  {
    "key": "leaderAffiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "Leader Affiliation",
    "ariaTh": "สังกัดหัวหน้าโครงการ"
  },
  {
    "key": "leaderPhone",
    "en": "Telephone number/Mobile number:",
    "th": "หมายเลขโทรศัพท์ / หมายเลขโทรศัพท์มือถือ:",
    "type": "text",
    "ariaEn": "Leader Telephone",
    "ariaTh": "โทรศัพท์หัวหน้าโครงการ"
  },
  {
    "key": "leaderEmail",
    "en": "E-mail:",
    "th": "อีเมล:",
    "type": "email",
    "ariaEn": "Leader Email",
    "ariaTh": "อีเมลหัวหน้าโครงการ"
  },
  {
    "key": "leaderPercent",
    "en": "Percentage of the responsibility toward the project:",
    "th": "ร้อยละความรับผิดชอบต่อโครงการ:",
    "type": "number",
    "ariaEn": "Leader Responsibility (%)",
    "ariaTh": "สัดส่วนความรับผิดชอบของหัวหน้า (%)"
  },
  {
    "key": "participantName",
    "en": "Full name:",
    "th": "ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "Participant Full Name",
    "ariaTh": "ชื่อผู้ร่วมวิจัย"
  },
  {
    "key": "participantAffiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "Participant Affiliation",
    "ariaTh": "สังกัดผู้ร่วมวิจัย"
  },
  {
    "key": "participantPhone",
    "en": "Telephone number/Mobile number:",
    "th": "หมายเลขโทรศัพท์ / หมายเลขโทรศัพท์มือถือ:",
    "type": "text",
    "ariaEn": "Participant Telephone",
    "ariaTh": "โทรศัพท์ผู้ร่วมวิจัย"
  },
  {
    "key": "participantEmail",
    "en": "E-mail:",
    "th": "อีเมล:",
    "type": "email",
    "ariaEn": "Participant Email",
    "ariaTh": "อีเมลผู้ร่วมวิจัย"
  },
  {
    "key": "participantPercent",
    "en": "Percentage of the responsibility toward the project:",
    "th": "ร้อยละความรับผิดชอบต่อโครงการ:",
    "type": "number",
    "ariaEn": "Participant Responsibility (%)",
    "ariaTh": "สัดส่วนความรับผิดชอบผู้ร่วมวิจัย (%)"
  },
  {
    "key": "advisorName",
    "en": "Full name:",
    "th": "ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "Advisor Name",
    "ariaTh": "ชื่อที่ปรึกษา"
  },
  {
    "key": "advisorQualification",
    "en": "Educational qualification:",
    "th": "คุณวุฒิการศึกษา:",
    "type": "text",
    "ariaEn": "Educational Qualification",
    "ariaTh": "คุณวุฒิ"
  },
  {
    "key": "advisorPosition",
    "en": "Academic positions:",
    "th": "ตำแหน่งทางวิชาการ:",
    "type": "text",
    "ariaEn": "Academic Position",
    "ariaTh": "ตำแหน่งทางวิชาการ"
  },
  {
    "key": "advisorAffiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "Affiliation",
    "ariaTh": "สังกัด"
  },
  {
    "key": "cooperationName",
    "en": "Full name:",
    "th": "ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "Contact Name",
    "ariaTh": "ชื่อผู้ประสานงาน"
  },
  {
    "key": "cooperationAffiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "Affiliation",
    "ariaTh": "สังกัด"
  },
  {
    "key": "cooperationAddress",
    "en": "Address:",
    "th": "ที่อยู่:",
    "type": "text",
    "ariaEn": "Address",
    "ariaTh": "ที่อยู่"
  },
  {
    "key": "cooperationType",
    "en": "The type of research cooperation:",
    "th": "ลักษณะความร่วมมือด้านการวิจัย:",
    "type": "text",
    "ariaEn": "Type of Cooperation",
    "ariaTh": "ลักษณะความร่วมมือ"
  },
  {
    "key": "researchType",
    "en": "4. Type of the Research",
    "th": "4. ประเภทของการวิจัย",
    "type": "text",
    "ariaEn": "Type of Research",
    "ariaTh": "ประเภทงานวิจัย"
  },
  {
    "key": "keywords",
    "en": "5. Keywords of the Project",
    "th": "5. คำสำคัญของโครงการ",
    "type": "textarea",
    "ariaEn": "Keywords",
    "ariaTh": "คำสำคัญ"
  },
  {
    "key": "background",
    "en": "6. The Background of the Research and the Conceptual Framework",
    "th": "6. ความเป็นมาของการวิจัยและกรอบแนวคิด",
    "type": "textarea",
    "ariaEn": "Background and Conceptual Framework",
    "ariaTh": "ความเป็นมาและกรอบแนวคิด"
  },
  {
    "key": "objectives",
    "en": "7. Objectives of the Research Project",
    "th": "7. วัตถุประสงค์ของโครงการวิจัย",
    "type": "textarea",
    "ariaEn": "Research Objectives *",
    "ariaTh": "วัตถุประสงค์ของโครงการ *"
  },
  {
    "key": "literature",
    "en": "8. Literature Review",
    "th": "8. การทบทวนวรรณกรรม",
    "type": "textarea",
    "ariaEn": "Literature Review",
    "ariaTh": "การทบทวนวรรณกรรม"
  },
  {
    "key": "references",
    "en": "9. References (please specify according to the international format)",
    "th": "9. เอกสารอ้างอิง (โปรดระบุตามรูปแบบสากล)",
    "type": "textarea",
    "ariaEn": "References (International Format)",
    "ariaTh": "เอกสารอ้างอิงตามรูปแบบสากล"
  },
  {
    "key": "methodology",
    "en": "10. Methodology",
    "th": "10. ระเบียบวิธีวิจัย",
    "type": "textarea",
    "ariaEn": "Methodology (data collection, samples, randomization, analysis) *",
    "ariaTh": "วิธีดำเนินการวิจัย (รวมการเก็บข้อมูล กลุ่มตัวอย่าง การสุ่ม และการวิเคราะห์) *"
  },
  {
    "key": "scope",
    "en": "11. Scope of the Research",
    "th": "11. ขอบเขตการวิจัย",
    "type": "textarea",
    "ariaEn": "Scope and relevance to title and objectives",
    "ariaTh": "ขอบเขตและความสัมพันธ์กับชื่อและวัตถุประสงค์"
  },
  {
    "key": "startDate",
    "en": "The duration",
    "th": "ระยะเวลาเริ่มต้น",
    "type": "date",
    "ariaEn": "Start Date *",
    "ariaTh": "วันที่เริ่มโครงการ *"
  },
  {
    "key": "endDate",
    "en": "to",
    "th": "ถึง",
    "type": "date",
    "ariaEn": "End Date *",
    "ariaTh": "วันที่สิ้นสุดโครงการ *"
  },
  {
    "key": "workTask1",
    "en": "Task",
    "th": "งาน",
    "type": "text",
    "ariaEn": "Task 1",
    "ariaTh": "งานที่ 1"
  },
  {
    "key": "workPeriod1",
    "en": "Period",
    "th": "ช่วงเวลา",
    "type": "text",
    "ariaEn": "Period 1",
    "ariaTh": "ช่วงเวลาที่ 1"
  },
  {
    "key": "workTask2",
    "en": "Task",
    "th": "งาน",
    "type": "text",
    "ariaEn": "Task 2",
    "ariaTh": "งานที่ 2"
  },
  {
    "key": "workPeriod2",
    "en": "Period",
    "th": "ช่วงเวลา",
    "type": "text",
    "ariaEn": "Period 2",
    "ariaTh": "ช่วงเวลาที่ 2"
  },
  {
    "key": "workTask3",
    "en": "Task",
    "th": "งาน",
    "type": "text",
    "ariaEn": "Task 3",
    "ariaTh": "งานที่ 3"
  },
  {
    "key": "workPeriod3",
    "en": "Period",
    "th": "ช่วงเวลา",
    "type": "text",
    "ariaEn": "Period 3",
    "ariaTh": "ช่วงเวลาที่ 3"
  },
  {
    "key": "progress",
    "en": "13. Research Progress According to the Duration of Reporting the Progress of the Research",
    "th": "13. ความก้าวหน้าของการวิจัยตามระยะเวลารายงานความก้าวหน้าการวิจัย",
    "type": "textarea",
    "ariaEn": "Expected Outcomes by Reporting Period",
    "ariaTh": "ผลลัพธ์ที่คาดหวังตามช่วงรายงานความก้าวหน้า"
  },
  {
    "key": "outcomeType",
    "en": "14. Expected Outcomes of the Research",
    "th": "14. ผลผลิตที่คาดว่าจะได้รับจากการวิจัย",
    "type": "choices",
    "ariaEn": "Outcome Type",
    "ariaTh": "ประเภทผลผลิต",
    "options": [
      {
        "value": "international",
        "en": "Publishing in international academic journals listed in the database according to the criteria for considering academic journals for the publication of academic work 2019 announcement from the committee of Civil Servant in Higher Education Institutions. Or Announcement of the Civil Service Commission on Criteria and Procedures for Appointing Persons to be Assistant Professors Associate Professor and Professor 2021. Or",
        "th": "ตีพิมพ์ในวารสารวิชาการระดับนานาชาติที่อยู่ในฐานข้อมูลตามประกาศ ก.พ.อ. เรื่องหลักเกณฑ์การพิจารณาวารสารทางวิชาการสำหรับการเผยแพร่ผลงานทางวิชาการ พ.ศ. 2562 หรือประกาศ ก.พ.อ. เรื่องหลักเกณฑ์และวิธีการพิจารณาแต่งตั้งบุคคลให้ดำรงตำแหน่งผู้ช่วยศาสตราจารย์ รองศาสตราจารย์ และศาสตราจารย์ พ.ศ. 2564 หรือ"
      },
      {
        "value": "national",
        "en": "Publishing in national academic journals that appear in the TCI group 1 or group 2. Or",
        "th": "ตีพิมพ์ในวารสารวิชาการระดับชาติที่อยู่ในฐานข้อมูล TCI กลุ่ม 1 หรือกลุ่ม 2 หรือ"
      },
      {
        "value": "conference",
        "en": "Presenting at international academic conferences. It must be a complete article (full paper) which is published in the proceedings. Or",
        "th": "นำเสนอในการประชุมวิชาการระดับนานาชาติ โดยเป็นบทความฉบับเต็ม (full paper) ที่เผยแพร่ในรายงานสืบเนื่องจากการประชุม (proceedings) หรือ"
      },
      {
        "value": "patent",
        "en": "Petty patent/patent (with the application number) Or",
        "th": "อนุสิทธิบัตร/สิทธิบัตร (พร้อมเลขที่คำขอ) หรือ"
      },
      {
        "value": "other",
        "en": "Other Please explain",
        "th": "อื่น ๆ โปรดอธิบาย"
      }
    ],
    "multiple": false
  },
  {
    "key": "outcomeDetail",
    "en": "",
    "th": "",
    "type": "textarea",
    "ariaEn": "Outcome Details",
    "ariaTh": "รายละเอียดผลผลิต"
  },
  {
    "key": "integration",
    "en": "15. Integration of Research",
    "th": "15. การบูรณาการงานวิจัย",
    "type": "textarea",
    "ariaEn": "Integration with Other Disciplines",
    "ariaTh": "การบูรณาการศาสตร์อื่น"
  },
  {
    "key": "publicationLevel",
    "en": "16. Level of Publishing to Societies",
    "th": "16. ระดับการเผยแพร่สู่สังคม",
    "type": "choices",
    "ariaEn": "Dissemination Level",
    "ariaTh": "ระดับการเผยแพร่",
    "options": [
      {
        "value": "broad",
        "en": "Could be used as a sample and guidelines at the regional, national, and international levels",
        "th": "สามารถใช้เป็นตัวอย่างและแนวทางในระดับภูมิภาค ประเทศ และนานาชาติ"
      },
      {
        "value": "local",
        "en": "Could be used as a sample and guidelines for particular jobs, villages, or provinces",
        "th": "สามารถใช้เป็นตัวอย่างและแนวทางสำหรับงานเฉพาะ หมู่บ้าน หรือจังหวัด"
      },
      {
        "value": "none",
        "en": "Not be published to societies",
        "th": "ไม่เผยแพร่สู่สังคม"
      }
    ],
    "multiple": false
  },
  {
    "key": "compensationItem1",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Compensation: Expense item 1 (multipliers)",
    "ariaTh": "ค่าตอบแทน: รายการที่ 1 (แจกแจงตัวคูณ)"
  },
  {
    "key": "compensationAmount1",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Compensation: Item 1 amount",
    "ariaTh": "ค่าตอบแทน: จำนวนเงินรายการที่ 1"
  },
  {
    "key": "compensationItem2",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Compensation: Expense item 2 (multipliers)",
    "ariaTh": "ค่าตอบแทน: รายการที่ 2 (แจกแจงตัวคูณ)"
  },
  {
    "key": "compensationAmount2",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Compensation: Item 2 amount",
    "ariaTh": "ค่าตอบแทน: จำนวนเงินรายการที่ 2"
  },
  {
    "key": "compensationItem3",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Compensation: Expense item 3 (multipliers)",
    "ariaTh": "ค่าตอบแทน: รายการที่ 3 (แจกแจงตัวคูณ)"
  },
  {
    "key": "compensationAmount3",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Compensation: Item 3 amount",
    "ariaTh": "ค่าตอบแทน: จำนวนเงินรายการที่ 3"
  },
  {
    "key": "directCostItem1",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Direct Cost: Expense item 1 (multipliers)",
    "ariaTh": "ค่าใช้สอย: รายการที่ 1 (แจกแจงตัวคูณ)"
  },
  {
    "key": "directCostAmount1",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Direct Cost: Item 1 amount",
    "ariaTh": "ค่าใช้สอย: จำนวนเงินรายการที่ 1"
  },
  {
    "key": "directCostItem2",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Direct Cost: Expense item 2 (multipliers)",
    "ariaTh": "ค่าใช้สอย: รายการที่ 2 (แจกแจงตัวคูณ)"
  },
  {
    "key": "directCostAmount2",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Direct Cost: Item 2 amount",
    "ariaTh": "ค่าใช้สอย: จำนวนเงินรายการที่ 2"
  },
  {
    "key": "directCostItem3",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Direct Cost: Expense item 3 (multipliers)",
    "ariaTh": "ค่าใช้สอย: รายการที่ 3 (แจกแจงตัวคูณ)"
  },
  {
    "key": "directCostAmount3",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Direct Cost: Item 3 amount",
    "ariaTh": "ค่าใช้สอย: จำนวนเงินรายการที่ 3"
  },
  {
    "key": "materialsItem1",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Materials and Supplies: Expense item 1 (multipliers)",
    "ariaTh": "ค่าวัสดุ: รายการที่ 1 (แจกแจงตัวคูณ)"
  },
  {
    "key": "materialsAmount1",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Materials and Supplies: Item 1 amount",
    "ariaTh": "ค่าวัสดุ: จำนวนเงินรายการที่ 1"
  },
  {
    "key": "materialsItem2",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Materials and Supplies: Expense item 2 (multipliers)",
    "ariaTh": "ค่าวัสดุ: รายการที่ 2 (แจกแจงตัวคูณ)"
  },
  {
    "key": "materialsAmount2",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Materials and Supplies: Item 2 amount",
    "ariaTh": "ค่าวัสดุ: จำนวนเงินรายการที่ 2"
  },
  {
    "key": "materialsItem3",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Materials and Supplies: Expense item 3 (multipliers)",
    "ariaTh": "ค่าวัสดุ: รายการที่ 3 (แจกแจงตัวคูณ)"
  },
  {
    "key": "materialsAmount3",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Materials and Supplies: Item 3 amount",
    "ariaTh": "ค่าวัสดุ: จำนวนเงินรายการที่ 3"
  },
  {
    "key": "utilityItem1",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Utility: Expense item 1 (multipliers)",
    "ariaTh": "ค่าสาธารณูปโภค: รายการที่ 1 (แจกแจงตัวคูณ)"
  },
  {
    "key": "utilityAmount1",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Utility: Item 1 amount",
    "ariaTh": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 1"
  },
  {
    "key": "utilityItem2",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Utility: Expense item 2 (multipliers)",
    "ariaTh": "ค่าสาธารณูปโภค: รายการที่ 2 (แจกแจงตัวคูณ)"
  },
  {
    "key": "utilityAmount2",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Utility: Item 2 amount",
    "ariaTh": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 2"
  },
  {
    "key": "utilityItem3",
    "en": "",
    "th": "",
    "type": "text",
    "ariaEn": "Utility: Expense item 3 (multipliers)",
    "ariaTh": "ค่าสาธารณูปโภค: รายการที่ 3 (แจกแจงตัวคูณ)"
  },
  {
    "key": "utilityAmount3",
    "en": "",
    "th": "",
    "type": "number",
    "ariaEn": "Utility: Item 3 amount",
    "ariaTh": "ค่าสาธารณูปโภค: จำนวนเงินรายการที่ 3"
  },
  {
    "key": "standards",
    "en": "18. Research standards",
    "th": "18. มาตรฐานการวิจัย",
    "type": "choices",
    "ariaEn": "Applicable Research Standards",
    "ariaTh": "ประเภทมาตรฐานที่เกี่ยวข้อง",
    "options": [
      {
        "value": "none",
        "en": "No human trail / No animal use / Modern biotechnology-related research",
        "th": "ไม่มีการทดลองในมนุษย์ / ไม่มีการใช้สัตว์ / งานวิจัยเกี่ยวกับเทคโนโลยีชีวภาพสมัยใหม่"
      },
      {
        "value": "human",
        "en": "Research has been done on humans",
        "th": "มีการวิจัยในมนุษย์"
      },
      {
        "value": "animal",
        "en": "Experimental animals were used",
        "th": "มีการใช้สัตว์ทดลอง"
      },
      {
        "value": "plants",
        "en": "There is a collection, procurement or collection of common native and wild plant species or any part of plant, mushroom and fungi for study, experimentation or research in accordance with Section 53 of the Plant Protection (1999)",
        "th": "มีการเก็บ จัดหา หรือรวบรวมพันธุ์พืชพื้นเมืองทั่วไปและพันธุ์พืชป่า หรือส่วนใดส่วนหนึ่งของพืช เห็ด และรา เพื่อศึกษา ทดลอง หรือวิจัย ตามมาตรา 53 แห่งพระราชบัญญัติคุ้มครองพันธุ์พืช พ.ศ. 2542"
      }
    ],
    "multiple": true
  },
  {
    "key": "clarifications",
    "en": "19. Other clarifications (if any)",
    "th": "19. คำชี้แจงอื่น ๆ (ถ้ามี)",
    "type": "textarea",
    "ariaEn": "Other Clarifications",
    "ariaTh": "คำชี้แจงเพิ่มเติม"
  },
  {
    "key": "advisorSignature",
    "en": "(...........................................................)",
    "th": "(...........................................................)",
    "type": "text",
    "ariaEn": "Advisor Signatory Name",
    "ariaTh": "ชื่อผู้ลงนาม: ที่ปรึกษาโครงการ"
  },
  {
    "key": "advisorSignDate",
    "en": "Date ...................................................",
    "th": "วันที่ ...................................................",
    "type": "date",
    "ariaEn": "Advisor Signature Date",
    "ariaTh": "วันที่ลงนามที่ปรึกษา"
  },
  {
    "key": "leaderSignature",
    "en": "(...........................................................)",
    "th": "(...........................................................)",
    "type": "text",
    "ariaEn": "Leader Signatory Name",
    "ariaTh": "ชื่อผู้ลงนาม: หัวหน้าโครงการ"
  },
  {
    "key": "leaderSignDate",
    "en": "Date ...................................................",
    "th": "วันที่ ...................................................",
    "type": "date",
    "ariaEn": "Leader Signature Date",
    "ariaTh": "วันที่ลงนามหัวหน้า"
  },
  {
    "key": "teamSignatureName",
    "en": "(.................................................)",
    "th": "(.................................................)",
    "type": "text",
    "ariaEn": "Team Signatory Name",
    "ariaTh": "ชื่อผู้ลงนามผู้ร่วมวิจัย"
  },
  {
    "key": "teamSignDate",
    "en": "Date ...................................................",
    "th": "วันที่ ...................................................",
    "type": "date",
    "ariaEn": "Team Signature Date",
    "ariaTh": "วันที่ลงนามผู้ร่วมวิจัย"
  },
  {
    "key": "bioName",
    "en": "1. Full name:",
    "th": "1. ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "1. Full Name",
    "ariaTh": "1. ชื่อ-นามสกุล"
  },
  {
    "key": "bioPosition",
    "en": "2. Academic position:",
    "th": "2. ตำแหน่งทางวิชาการ:",
    "type": "text",
    "ariaEn": "2. Academic Position",
    "ariaTh": "2. ตำแหน่งทางวิชาการ"
  },
  {
    "key": "bioResearchId",
    "en": "3. National Researcher Identification Number (if any):",
    "th": "3. เลขประจำตัวนักวิจัยแห่งชาติ (ถ้ามี):",
    "type": "text",
    "ariaEn": "3. National Researcher ID (if any)",
    "ariaTh": "3. เลขประจำตัวนักวิจัยแห่งชาติ (ถ้ามี)"
  },
  {
    "key": "bioEducation",
    "en": "4. Educational background:",
    "th": "4. ประวัติการศึกษา:",
    "type": "textarea",
    "ariaEn": "4. Educational Background",
    "ariaTh": "4. ประวัติการศึกษา"
  },
  {
    "key": "bioExperience",
    "en": "5. Working experiences:",
    "th": "5. ประสบการณ์ทำงาน:",
    "type": "textarea",
    "ariaEn": "5. Working Experiences",
    "ariaTh": "5. ประสบการณ์ทำงาน"
  },
  {
    "key": "bioExpertise",
    "en": "6. Academic disciplines with special expertise (different from educational qualifications) specify academic fields.",
    "th": "6. สาขาวิชาที่มีความเชี่ยวชาญเป็นพิเศษ (แตกต่างจากคุณวุฒิการศึกษา) โปรดระบุสาขาวิชาการ",
    "type": "textarea",
    "ariaEn": "6. Areas of Expertise",
    "ariaTh": "6. สาขาที่เชี่ยวชาญ"
  },
  {
    "key": "bioPublications",
    "en": "7. History of publishing research both inside and outside the country. Please specify the title of the work, the name of the journal according to the international system.",
    "th": "7. ประวัติการตีพิมพ์ผลงานวิจัยทั้งในและต่างประเทศ โปรดระบุชื่อผลงานและชื่อวารสารตามรูปแบบสากล",
    "type": "textarea",
    "ariaEn": "7. Research Publications",
    "ariaTh": "7. ประวัติการตีพิมพ์ผลงานวิจัย"
  },
  {
    "key": "bioPresentations",
    "en": "8. History of research presentations both inside and outside the country. Please specify the title of the work. Meeting name, place, date, and time according to the international system.",
    "th": "8. ประวัติการนำเสนอผลงานวิจัยทั้งในและต่างประเทศ โปรดระบุชื่อผลงาน ชื่อการประชุม สถานที่ วันที่ และเวลาตามรูปแบบสากล",
    "type": "textarea",
    "ariaEn": "8. Research Presentations",
    "ariaTh": "8. ประวัติการนำเสนอผลงาน"
  },
  {
    "key": "bioIP",
    "en": "9. Research that has been registered with intellectual property or research results that are in the process of applying for intellectual property registration.",
    "th": "9. ผลงานวิจัยที่จดทะเบียนทรัพย์สินทางปัญญาแล้ว หรือผลงานวิจัยที่อยู่ระหว่างยื่นขอจดทะเบียนทรัพย์สินทางปัญญา",
    "type": "textarea",
    "ariaEn": "9. Intellectual Property",
    "ariaTh": "9. ผลงานด้านทรัพย์สินทางปัญญา"
  },
  {
    "key": "bioManagement",
    "en": "10. Experience related to research management both domestically and internationally, indicating the research position as the director of the research plan, the head of the research project, or co-researchers in each research proposal, and state the research status as well.",
    "th": "10. ประสบการณ์ด้านการบริหารงานวิจัยทั้งในและต่างประเทศ โดยระบุบทบาทผู้อำนวยการแผนงานวิจัย หัวหน้าโครงการวิจัย หรือผู้ร่วมวิจัยของแต่ละข้อเสนอโครงการ พร้อมระบุสถานะการวิจัย",
    "type": "textarea",
    "ariaEn": "10. Research Management Experience",
    "ariaTh": "10. ประสบการณ์บริหารงานวิจัย"
  },
  {
    "key": "bioCompleted",
    "en": "10.1 Completed Research: Research title, research proportion (%), research team and co-institution, funding source, year of funding, and publishing research results.",
    "th": "10.1 งานวิจัยที่เสร็จสิ้น: ชื่อเรื่อง สัดส่วนการวิจัย (%) ทีมวิจัยและสถาบันร่วม แหล่งทุน ปีที่ได้รับทุน และการเผยแพร่ผลการวิจัย",
    "type": "textarea",
    "ariaEn": "10.1 Completed Research",
    "ariaTh": "10.1 งานวิจัยที่เสร็จสิ้นแล้ว"
  },
  {
    "key": "bioOngoing",
    "en": "10.2 Research in progress: Research title, research proportion (%), research team and co-institution, funding source, year of funding, and research status.",
    "th": "10.2 งานวิจัยที่กำลังดำเนินการ: ชื่อเรื่อง สัดส่วนการวิจัย (%) ทีมวิจัยและสถาบันร่วม แหล่งทุน ปีที่ได้รับทุน และสถานะการวิจัย",
    "type": "textarea",
    "ariaEn": "10.2 Research in Progress",
    "ariaTh": "10.2 งานวิจัยที่กำลังดำเนินการ"
  },
  {
    "key": "reviewer1Name",
    "en": "1. Full name:",
    "th": "1. ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "1. Full Name",
    "ariaTh": "1. ชื่อ-นามสกุล"
  },
  {
    "key": "reviewer1Position",
    "en": "Academic position:",
    "th": "ตำแหน่งทางวิชาการ:",
    "type": "text",
    "ariaEn": "1. Academic Position",
    "ariaTh": "1. ตำแหน่งทางวิชาการ"
  },
  {
    "key": "reviewer1Affiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "1. Affiliation",
    "ariaTh": "1. สังกัด"
  },
  {
    "key": "reviewer1Email",
    "en": "E-mail:",
    "th": "อีเมล:",
    "type": "email",
    "ariaEn": "1. Email",
    "ariaTh": "1. อีเมล"
  },
  {
    "key": "reviewer2Name",
    "en": "2. Full name:",
    "th": "2. ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "2. Full Name",
    "ariaTh": "2. ชื่อ-นามสกุล"
  },
  {
    "key": "reviewer2Position",
    "en": "Academic position:",
    "th": "ตำแหน่งทางวิชาการ:",
    "type": "text",
    "ariaEn": "2. Academic Position",
    "ariaTh": "2. ตำแหน่งทางวิชาการ"
  },
  {
    "key": "reviewer2Affiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "2. Affiliation",
    "ariaTh": "2. สังกัด"
  },
  {
    "key": "reviewer2Email",
    "en": "E-mail:",
    "th": "อีเมล:",
    "type": "email",
    "ariaEn": "2. Email",
    "ariaTh": "2. อีเมล"
  },
  {
    "key": "reviewer3Name",
    "en": "3. Full name:",
    "th": "3. ชื่อ-นามสกุล:",
    "type": "text",
    "ariaEn": "3. Full Name",
    "ariaTh": "3. ชื่อ-นามสกุล"
  },
  {
    "key": "reviewer3Position",
    "en": "Academic position:",
    "th": "ตำแหน่งทางวิชาการ:",
    "type": "text",
    "ariaEn": "3. Academic Position",
    "ariaTh": "3. ตำแหน่งทางวิชาการ"
  },
  {
    "key": "reviewer3Affiliation",
    "en": "Affiliation:",
    "th": "สังกัด:",
    "type": "text",
    "ariaEn": "3. Affiliation",
    "ariaTh": "3. สังกัด"
  },
  {
    "key": "reviewer3Email",
    "en": "E-mail:",
    "th": "อีเมล:",
    "type": "email",
    "ariaEn": "3. Email",
    "ariaTh": "3. อีเมล"
  }
]

export const rs1WebFields=rs1DocumentFields.filter(f=>!['advisorSignature','advisorSignDate','leaderSignature','leaderSignDate','teamSignatureName','teamSignDate'].includes(f.key)&&!/^work(?:Task|Period)[1-3]$/.test(f.key)&&!/(?:compensation|directCost|materials|utility)(?:Item|Amount)[23]$/.test(f.key))
