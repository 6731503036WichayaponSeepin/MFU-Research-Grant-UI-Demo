import { DRAFT_KEY } from './projectStorage'

import { jsPDF } from 'jspdf'



const sections = [
  {
    title: '1. Project Overview / ข้อมูลโครงการ',
    fields: [
      ['projectTitle', 'Project Title / ชื่อโครงการ'],
      ['strategy', 'University Strategy / ยุทธศาสตร์มหาวิทยาลัย']
    ]
  },
  {
    title: 'Part A: Project Information',
    fields: [
      ['leaderName', '1. Project Leader'],
      ['leaderAffiliation', 'Leader Affiliation'],
      ['leaderPhone', 'Leader Telephone'],
      ['leaderEmail', 'Leader Email'],
      ['leaderPercent', 'Leader Responsibility (%)'],
      ['participants', 'Project Participants'],
      ['advisorName', '2. Project Advisor'],
      ['advisorQualification', 'Advisor Qualification'],
      ['advisorPosition', 'Advisor Academic Position'],
      ['advisorAffiliation', 'Advisor Affiliation'],
      ['cooperationName', '3. Cooperation Contact'],
      ['cooperationAffiliation', 'Cooperation Affiliation'],
      ['cooperationAddress', 'Cooperation Address'],
      ['cooperationType', 'Type of Cooperation'],
      ['researchType', '4. Type of Research'],
      ['keywords', '5. Keywords'],
      ['background', '6. Background and Conceptual Framework'],
      ['objectives', '7. Research Objectives'],
      ['literature', '8. Literature Review'],
      ['references', '9. References'],
      ['methodology', '10. Methodology'],
      ['scope', '11. Scope of Research'],
      ['startDate', '12. Start Date'],
      ['endDate', 'End Date'],
      ['workPlan', 'Working Plan'],
      ['progress', '13. Research Progress'],
      ['outcomeType', '14. Expected Outcome Type'],
      ['outcomeDetail', 'Expected Outcome Details'],
      ['integration', '15. Integration of Research'],
      ['publicationLevel', '16. Dissemination Level'],
      ['compensationDetail', '17. Compensation Details'],
      ['compensation', 'Compensation (THB)'],
      ['directDetail', 'Direct Cost Details'],
      ['directCost', 'Direct Cost (THB)'],
      ['materialsDetail', 'Materials Details'],
      ['materials', 'Materials and Supplies (THB)'],
      ['utilityDetail', 'Utility Details'],
      ['utility', 'Utility (THB)'],
      ['standards', '18. Research Standards'],
      ['clarifications', '19. Other Clarifications'],
      ['advisorSignature', 'Advisor Signatory Name'],
      ['advisorSignDate', 'Advisor Signature Date'],
      ['leaderSignature', 'Project Leader Signatory Name'],
      ['leaderSignDate', 'Project Leader Signature Date'],
      ['teamSignatures', 'Team Signatories and Dates']
    ]
  },
  {
    title: 'Part B: Autobiography of the Researchers',
    fields: [
      ['bioName', '1. Full Name'],
      ['bioPosition', '2. Academic Position'],
      ['bioResearchId', '3. National Researcher ID'],
      ['bioEducation', '4. Educational Background'],
      ['bioExperience', '5. Working Experiences'],
      ['bioExpertise', '6. Areas of Expertise'],
      ['bioPublications', '7. Research Publications'],
      ['bioPresentations', '8. Research Presentations'],
      ['bioIP', '9. Intellectual Property'],
      ['bioManagement', '10. Research Management Experience'],
      ['bioCompleted', '10.1 Completed Research'],
      ['bioOngoing', '10.2 Research in Progress']
    ]
  },
  {
    title: 'Part C: Final Report Reviewers',
    fields: [1, 2, 3].flatMap(n => [
      [`reviewer${n}Name`, `${n}. Reviewer Name`],
      [`reviewer${n}Position`, `Reviewer ${n} Academic Position`],
      [`reviewer${n}Affiliation`, `Reviewer ${n} Affiliation`],
      [`reviewer${n}Email`, `Reviewer ${n} Email`]
    ])
  }
]

async function fontToBase64(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Font not found: ${url}`)
  }

  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + 8192)
    )
  }

  return btoa(binary)
}

export async function generateRS1PDF(proposal) {
  const data = proposal || JSON.parse(
    localStorage.getItem(DRAFT_KEY) || '{}'
  )

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  })

  const regular = await fontToBase64(
    '/fonts/Sarabun-Regular.ttf'
  )
  const bold = await fontToBase64(
    '/fonts/Sarabun-Bold.ttf'
  )

  doc.addFileToVFS('Sarabun-Regular.ttf', regular)
  doc.addFileToVFS('Sarabun-Bold.ttf', bold)
  doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal')
  doc.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 22

  function ensureSpace(height = 12) {
    if (y + height > pageHeight - 22) {
      doc.addPage()
      y = 22
    }
  }

  function writeText(text, options = {}) {
    const {
      bold: isBold = false,
      size = 11,
      indent = 0,
      gap = 4
    } = options

    doc.setFont('Sarabun', isBold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(35, 35, 35)

    const lines = doc.splitTextToSize(
      String(text || '-'),
      contentWidth - indent
    )

    const lineHeight = size * 0.46

    for (const line of lines) {
      ensureSpace(lineHeight + 2)
      doc.text(line, margin + indent, y)
      y += lineHeight
    }

    y += gap
  }

  function heading(text) {
    ensureSpace(22)
    doc.setDrawColor(139, 29, 36)
    doc.setLineWidth(0.6)
    doc.line(margin, y, pageWidth - margin, y)
    y += 9

    writeText(text, {
      bold: true,
      size: 14,
      gap: 7
    })
  }

  writeText('RS-1 Personal Budget', {
    bold: true,
    size: 18,
    gap: 7
  })

  writeText('Research Project Proposal', {
    bold: true,
    size: 13,
    gap: 10
  })

  writeText(
    'Generated from the MFU Research Grant Management System prototype',
    { size: 9, gap: 10 }
  )

  for (const section of sections) {
    heading(section.title)

    for (const [key, label] of section.fields) {
      writeText(label, {
        bold: true,
        size: 10,
        gap: 2
      })

      writeText(data[key] || '-', {
        size: 11,
        indent: 3,
        gap: 7
      })
    }

    if (section.title.startsWith('Part A')) {
      const total = [
        'compensation',
        'directCost',
        'materials',
        'utility'
      ].reduce(
        (sum, key) => sum + (Number(data[key]) || 0),
        0
      )

      writeText(
        `Total Proposed Budget: ${total.toLocaleString()} THB`,
        { bold: true, size: 12, gap: 10 }
      )
    }
  }

  const pages = doc.getNumberOfPages()

  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFont('Sarabun', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `Page ${page} of ${pages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  const blob = doc.output('blob')

  return {
    blob,
    filename: 'RS-1_Research_Proposal.pdf'
  }
}
