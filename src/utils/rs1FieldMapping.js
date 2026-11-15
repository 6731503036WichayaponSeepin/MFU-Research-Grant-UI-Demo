function findValue(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match?.[1]?.trim()) {
      return match[1].trim()
    }
  }

  return ''
}

// Extract preliminary RS-1 fields.
// Users must review the extracted information before saving.
export function extractRS1Fields(text) {
  const normalized = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')

  const result = {
    projectTitle: findValue(normalized, [
      /(?:Project Title|ชื่อโครงการ)\s*[:：]\s*([^\n]+)/i
    ]),
    leaderName: findValue(normalized, [
      /(?:Project Leader|หัวหน้าโครงการ)\s*[:：]\s*([^\n]+)/i
    ]),
    leaderAffiliation: findValue(normalized, [
      /(?:Affiliation|สังกัด|หน่วยงาน)\s*[:：]\s*([^\n]+)/i
    ]),
    leaderPhone: findValue(normalized, [
      /(?:Telephone|Mobile|โทรศัพท์)\s*[:：]\s*([+\d()\-\s]+)/i
    ]),
    leaderEmail: findValue(normalized, [
      /(?:E-mail|Email|อีเมล)\s*[:：]\s*([^\s]+)/i
    ]),
    advisorName: findValue(normalized, [
      /(?:Project Advisor|ที่ปรึกษาโครงการ)\s*[:：]\s*([^\n]+)/i
    ]),
    researchType: findValue(normalized, [
      /(?:Type of the Research|ประเภทงานวิจัย)\s*[:：]\s*([^\n]+)/i
    ]),
    keywords: findValue(normalized, [
      /(?:Keywords of the Project|Keywords|คำสำคัญ)\s*[:：]\s*([^\n]+)/i
    ]),
    objectives: findValue(normalized, [
      /(?:Objectives of the Research Project|วัตถุประสงค์)\s*[:：]\s*([^\n]+)/i
    ])
  }

  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value)
  )
}

