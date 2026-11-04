import { useUnsavedChanges } from '../utils/useFormDraft'
import { getProjects } from '../utils/projectStorage'
import { readProposalDraft, writeProposalDraft } from '../utils/proposalDraft'
import { saveProposal } from '../utils/projectStorage'
import ProposalPDF from '../components/ProposalPDF'
import { Save } from 'lucide-react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'


const parts = [
  ['ข้อมูลโครงการ', 'Project Overview'],
  ['Part A — ข้อมูลข้อเสนอโครงการ', 'Part A — Project Information'],
  ['Part B — ประวัตินักวิจัย', 'Part B — Researcher Autobiography'],
  ['Part C — ผู้ทรงคุณวุฒิ', 'Part C — Final Report Reviewers'],
]

const field = (key, th, en, type = 'text') => ({
  key, th, en, type
})

const overview = [
  field('projectTitle', 'ชื่อโครงการ', 'Project Title'),
  field('projectTitleEn', 'ชื่อโครงการภาษาอังกฤษ', 'English Project Title'),
  field(
    'strategy',
    'ยุทธศาสตร์มหาวิทยาลัย (เลือก 1 ข้อ)',
    'University Strategy (choose one)',
    'strategy'
  ),
]

const aSections = [
  {
    th: '1. คณะผู้วิจัย',
    en: '1. Researchers',
    fields: [
      field('leaderName', 'ชื่อหัวหน้าโครงการ', 'Project Leader Name'),
      field('leaderAffiliation', 'สังกัดหัวหน้าโครงการ', 'Leader Affiliation'),
      field('leaderPhone', 'โทรศัพท์หัวหน้าโครงการ', 'Leader Telephone'),
      field('leaderEmail', 'อีเมลหัวหน้าโครงการ', 'Leader Email', 'email'),
      field('leaderPercent', 'สัดส่วนความรับผิดชอบของหัวหน้า (%)', 'Leader Responsibility (%)', 'number'),
      field('participants', 'ผู้ร่วมวิจัย: ชื่อ สังกัด โทรศัพท์ อีเมล และสัดส่วนความรับผิดชอบ', 'Project Participants: name, affiliation, phone, email, responsibility', 'textarea')
    ]
  },
  {
    th: '2. ที่ปรึกษาโครงการ',
    en: '2. Project Advisor',
    fields: [
      field('advisorName', 'ชื่อที่ปรึกษา', 'Advisor Name'),
      field('advisorQualification', 'คุณวุฒิ', 'Educational Qualification'),
      field('advisorPosition', 'ตำแหน่งทางวิชาการ', 'Academic Position'),
      field('advisorAffiliation', 'สังกัด', 'Affiliation')
    ]
  },
  {
    th: '3. ความร่วมมือจากหน่วยงานอื่น',
    en: '3. Cooperation from Other Agencies',
    fields: [
      field('cooperationName', 'ชื่อผู้ประสานงาน', 'Contact Name'),
      field('cooperationAffiliation', 'สังกัด', 'Affiliation'),
      field('cooperationAddress', 'ที่อยู่', 'Address', 'textarea'),
      field('cooperationType', 'ลักษณะความร่วมมือ', 'Type of Cooperation', 'textarea')
    ]
  },
  {
    th: '4. ประเภทงานวิจัย',
    en: '4. Type of Research',
    fields: [
      field('researchType', 'ประเภทงานวิจัย', 'Type of Research')
    ]
  },
  {
    th: '5. คำสำคัญ',
    en: '5. Project Keywords',
    fields: [
      field('keywords', 'คำสำคัญ', 'Keywords', 'textarea')
    ]
  },
  {
    th: '6. ความเป็นมาและกรอบแนวคิด',
    en: '6. Background and Conceptual Framework',
    fields: [
      field('background', 'ความเป็นมาและกรอบแนวคิด', 'Background and Conceptual Framework', 'textarea')
    ]
  },
  {
    th: '7. วัตถุประสงค์',
    en: '7. Research Objectives',
    fields: [
      field('objectives', 'วัตถุประสงค์ของโครงการ', 'Research Objectives', 'textarea')
    ]
  },
  {
    th: '8. การทบทวนวรรณกรรม',
    en: '8. Literature Review',
    fields: [
      field('literature', 'การทบทวนวรรณกรรม', 'Literature Review', 'textarea')
    ]
  },
  {
    th: '9. เอกสารอ้างอิง',
    en: '9. References',
    fields: [
      field('references', 'เอกสารอ้างอิงตามรูปแบบสากล', 'References (International Format)', 'textarea')
    ]
  },
  {
    th: '10. ระเบียบวิธีวิจัย',
    en: '10. Methodology',
    fields: [
      field(
        'methodology',
        'วิธีดำเนินการวิจัย (รวมการเก็บข้อมูล กลุ่มตัวอย่าง การสุ่ม และการวิเคราะห์)',
        'Methodology (data collection, samples, randomization, analysis)',
        'textarea'
      )
    ]
  },
  {
    th: '11. ขอบเขตการวิจัย',
    en: '11. Scope of Research',
    fields: [
      field('scope', 'ขอบเขตและความสัมพันธ์กับชื่อและวัตถุประสงค์', 'Scope and relevance to title and objectives', 'textarea')
    ]
  },
  {
    th: '12. แผนการดำเนินงาน',
    en: '12. Working Plan',
    fields: [
      field('startDate', 'วันที่เริ่มโครงการ', 'Start Date', 'date'),
      field('endDate', 'วันที่สิ้นสุดโครงการ', 'End Date', 'date'),
      field('workPlan', 'รายการงานและช่วงเวลาดำเนินการ', 'Tasks and Periods', 'textarea')
    ]
  },
  {
    th: '13. แผนความก้าวหน้า',
    en: '13. Research Progress',
    fields: [
      field('progress', 'ผลลัพธ์ที่คาดหวังตามช่วงรายงานความก้าวหน้า', 'Expected Outcomes by Reporting Period', 'textarea')
    ]
  },
  {
    th: '14. ผลผลิตที่คาดว่าจะได้รับ',
    en: '14. Expected Outcomes',
    fields: [
      field('outcomeType', 'ประเภทผลผลิต', 'Outcome Type', 'outcome'),
      field('outcomeDetail', 'รายละเอียดผลผลิต', 'Outcome Details', 'textarea')
    ]
  },
  {
    th: '15. การบูรณาการงานวิจัย',
    en: '15. Integration of Research',
    fields: [
      field('integration', 'การบูรณาการศาสตร์อื่น', 'Integration with Other Disciplines', 'textarea')
    ]
  },
  {
    th: '16. ระดับการเผยแพร่สู่สังคม',
    en: '16. Level of Publishing to Societies',
    fields: [
      field('publicationLevel', 'ระดับการเผยแพร่', 'Dissemination Level', 'publication')
    ]
  },
  {
    th: '17. รายละเอียดงบประมาณ',
    en: '17. Research Budget',
    fields: [
      field('compensationDetail', 'รายละเอียดค่าตอบแทน', 'Compensation Details', 'textarea'),
      field('compensation', 'ค่าตอบแทน (บาท)', 'Compensation (THB)', 'number'),
      field('directDetail', 'รายละเอียดค่าใช้สอย', 'Direct Cost Details', 'textarea'),
      field('directCost', 'ค่าใช้สอย (บาท)', 'Direct Cost (THB)', 'number'),
      field('materialsDetail', 'รายละเอียดค่าวัสดุ', 'Materials and Supplies Details', 'textarea'),
      field('materials', 'ค่าวัสดุ (บาท)', 'Materials and Supplies (THB)', 'number'),
      field('utilityDetail', 'รายละเอียดค่าสาธารณูปโภค', 'Utility Details', 'textarea'),
      field('utility', 'ค่าสาธารณูปโภค (บาท)', 'Utility (THB)', 'number')
    ]
  },
  {
    th: '18. มาตรฐานการวิจัย',
    en: '18. Research Standards',
    fields: [
      field('standards', 'ประเภทมาตรฐานที่เกี่ยวข้อง', 'Applicable Research Standards', 'standards')
    ]
  },
  {
    th: '19. คำชี้แจงเพิ่มเติมและการลงนาม',
    en: '19. Other Clarifications and Signatures',
    fields: [
      field('clarifications', 'คำชี้แจงเพิ่มเติม', 'Other Clarifications', 'textarea'),
      field('advisorSignature', 'ชื่อผู้ลงนาม: ที่ปรึกษาโครงการ', 'Advisor Signatory Name'),
      field('advisorSignDate', 'วันที่ลงนามที่ปรึกษา', 'Advisor Signature Date', 'date'),
      field('leaderSignature', 'ชื่อผู้ลงนาม: หัวหน้าโครงการ', 'Leader Signatory Name'),
      field('leaderSignDate', 'วันที่ลงนามหัวหน้า', 'Leader Signature Date', 'date'),
      field('teamSignatures', 'รายชื่อผู้ร่วมวิจัยที่ลงนามและวันที่', 'Team Signatories and Dates', 'textarea')
    ]
  }
]

const bFields = [
  field('bioName', '1. ชื่อ-นามสกุล', '1. Full Name'),
  field('bioPosition', '2. ตำแหน่งทางวิชาการ', '2. Academic Position'),
  field('bioResearchId', '3. เลขประจำตัวนักวิจัยแห่งชาติ (ถ้ามี)', '3. National Researcher ID (if any)'),
  field('bioEducation', '4. ประวัติการศึกษา', '4. Educational Background', 'textarea'),
  field('bioExperience', '5. ประสบการณ์ทำงาน', '5. Working Experiences', 'textarea'),
  field('bioExpertise', '6. สาขาที่เชี่ยวชาญ', '6. Areas of Expertise', 'textarea'),
  field('bioPublications', '7. ประวัติการตีพิมพ์ผลงานวิจัย', '7. Research Publications', 'textarea'),
  field('bioPresentations', '8. ประวัติการนำเสนอผลงาน', '8. Research Presentations', 'textarea'),
  field('bioIP', '9. ผลงานด้านทรัพย์สินทางปัญญา', '9. Intellectual Property', 'textarea'),
  field('bioManagement', '10. ประสบการณ์บริหารงานวิจัย', '10. Research Management Experience', 'textarea'),
  field('bioCompleted', '10.1 งานวิจัยที่เสร็จสิ้นแล้ว', '10.1 Completed Research', 'textarea'),
  field('bioOngoing', '10.2 งานวิจัยที่กำลังดำเนินการ', '10.2 Research in Progress', 'textarea')
]

const reviewerFields = [1, 2, 3].flatMap(n => [
  field(`reviewer${n}Name`, `${n}. ชื่อ-นามสกุล`, `${n}. Full Name`),
  field(`reviewer${n}Position`, `${n}. ตำแหน่งทางวิชาการ`, `${n}. Academic Position`),
  field(`reviewer${n}Affiliation`, `${n}. สังกัด`, `${n}. Affiliation`),
  field(`reviewer${n}Email`, `${n}. อีเมล`, `${n}. Email`, 'email')
])

const strategies = [
  ['1', 'เกี่ยวข้องกับคุณวุฒิ คณะ หรือหน้าที่ของนักวิจัย', 'Relevant to researcher qualification, faculty, or duties'],
  ['2', 'พัฒนาทรัพยากรมนุษย์และองค์ความรู้', 'Human resources and knowledge development'],
  ['3', 'นวัตกรรมเพื่อแก้ปัญหาสังคม', 'Innovation for solving social issues'],
  ['4', 'นวัตกรรมเพื่อเพิ่มขีดความสามารถในการแข่งขัน', 'Innovation for competitiveness'],
  ['5', 'นวัตกรรมเชิงพื้นที่และลดความเหลื่อมล้ำ', 'Spatial development and reducing inequality']
]

const outcomes = [
  ['international', 'ตีพิมพ์วารสารวิชาการระดับนานาชาติ', 'International journal publication'],
  ['national', 'ตีพิมพ์วารสารระดับชาติ TCI กลุ่ม 1 หรือ 2', 'National journal (TCI 1 or 2)'],
  ['conference', 'นำเสนอประชุมวิชาการนานาชาติแบบ Full Paper', 'International conference full paper'],
  ['patent', 'อนุสิทธิบัตรหรือสิทธิบัตร', 'Petty patent or patent'],
  ['other', 'อื่น ๆ', 'Other']
]

const publicationLevels = [
  ['broad', 'แนวทางระดับภูมิภาค ประเทศ หรือสากล', 'Regional, national, or international guideline'],
  ['local', 'แนวทางเฉพาะงาน หมู่บ้าน หรือจังหวัด', 'Guideline for jobs, villages, or provinces'],
  ['none', 'ไม่เผยแพร่สู่สังคม', 'Not disseminated to society']
]

const standardOptions = [
  ['none', 'ไม่มีการวิจัยในมนุษย์/สัตว์ หรือเทคโนโลยีชีวภาพสมัยใหม่ที่เกี่ยวข้อง', 'No relevant human/animal/modern biotechnology research'],
  ['human', 'วิจัยในมนุษย์', 'Human research'],
  ['animal', 'ใช้สัตว์ทดลอง', 'Experimental animals'],
  ['plants', 'ศึกษาพืชพื้นเมือง/พืชป่า/เห็ด/รา ตามกฎหมายคุ้มครองพันธุ์พืช', 'Native or wild plants, mushrooms, or fungi under plant protection law']
]

const allFields = [
  ...overview,
  ...aSections.flatMap(section => section.fields),
  ...bFields,
  ...reviewerFields
]

const initial = Object.fromEntries(
  allFields.map(f => [f.key, ''])
)

function loadDraft() {
  try {
    const saved = readProposalDraft()
    if (saved !== null && (typeof saved !== 'object' || Array.isArray(saved))) throw new Error('Invalid draft')
    return {...initial,...saved,_projectId:saved?._projectId || crypto.randomUUID()}
  } catch {
    return {...initial,_loadError:true}
  }
}

export default function ManualEntry({ onBack, onConfirm, currentUser, onSaved }) {
  const { i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const label = (thai, english) => th ? thai : english

  const [part, setPart] = useState(0)
  const [section, setSection] = useState(0)
  const [review, setReview] = useState(false)
  const [reviewPart,setReviewPart]=useState(0),[reviewSection,setReviewSection]=useState(0)
  const [data, setData] = useState(loadDraft)
  const savedProposal=getProjects().find(p=>p.id===data._projectId)?.proposal||{}
  const markSaved=useUnsavedChanges(data,{...initial,...savedProposal,_projectId:data._projectId})
  const [notice, setNotice] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [saving,setSaving] = useState(false)


  const setValue = (key, value) => {
    const next = {...data,[key]:value}
    setData(next); setConfirmed(false); setNotice('')
    try { if (!data._loadError) writeProposalDraft(next) }
    catch { setNotice(label('บันทึกอัตโนมัติไม่ได้ โปรดตรวจสอบพื้นที่จัดเก็บ', 'Autosave failed. Check browser storage before leaving.')) }
  }

  const budget = ['compensation', 'directCost', 'materials', 'utility']
    .reduce((total, key) => total + (Number(data[key]) || 0), 0)

  const optionsFor = type => {
    if (type === 'strategy') return strategies
    if (type === 'outcome') return outcomes
    if (type === 'publication') return publicationLevels
    if (type === 'standards') return standardOptions
    return null
  }

  function renderField(f) {
    const options = optionsFor(f.type)

    return (
      <label className="rs1-field" key={f.key}>
        <span>{label(f.th, f.en)}{['projectTitle','leaderName','objectives','methodology','startDate','endDate'].includes(f.key) ? ' *' : ''}</span>

        {options ? (
          <select
            value={data[f.key]}
            onChange={e => setValue(f.key, e.target.value)}
          >
            <option value="">{label('กรุณาเลือก', 'Please select')}</option>
            {options.map(([value, thai, english]) => (
              <option value={value} key={value}>
                {label(thai, english)}
              </option>
            ))}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea
            rows={4}
            value={data[f.key]}
            onChange={e => setValue(f.key, e.target.value)}
          />
        ) : (
          <input
            type={
              f.type === 'number' ? 'number'
              : f.type === 'date' ? 'date'
              : f.type === 'email' ? 'email'
              : 'text'
            }
            min={f.type === 'number' ? '0' : undefined}
            max={f.key === 'leaderPercent' ? '100' : undefined}
            value={data[f.key]}
            onChange={e => setValue(f.key, e.target.value)}
          />
        )}
      </label>
    )
  }

  function next() {
    setNotice('')
    if (review) return

    if (part === 1 && section < aSections.length - 1) {
      setSection(s => s + 1)
    } else if (part < 3) {
      setPart(p => p + 1)
      setSection(0)
    } else {
      setReview(true)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setNotice('')

    if (review) {
      setReview(false)
    } else if (part === 1 && section > 0) {
      setSection(s => s - 1)
    } else if (part > 0) {
      setPart(p => p - 1)
      setSection(part === 2 ? aSections.length - 1 : 0)
    } else {
      onBack()
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function jump(p) {
    setPart(p)
    setSection(0)
    setReview(false)
    setNotice('')
  }

  async function save(redirect=true) {
    if (data._loadError) { setNotice(label('อ่านร่างเดิมไม่ได้ ข้อมูลเดิมยังคงอยู่', 'Cannot read the existing draft. Original data is preserved.')); return false }
    if (saving) return false
    setSaving(true)
    try {
      const project = await saveProposal(data, currentUser)
      const saved = {...data,...project.proposal,_projectId:project.id}
      writeProposalDraft(saved); setData(saved); markSaved(saved)
      if(redirect!==false)onSaved?.(project)
    } catch (error) { setNotice(label('บันทึกร่างไม่สำเร็จ: ', 'Unable to save draft: ')+error.message); return false }
    finally { setSaving(false) }
    setNotice(label(
      'บันทึกร่างเรียบร้อยแล้ว',
      'Draft saved successfully'
    ))
    return true
  }

  function display(f) {
    const value = data[f.key]
    const options = optionsFor(f.type)
    const match = options?.find(o => o[0] === value)

    return match
      ? label(match[1], match[2])
      : value
  }

  const activeFields =
    part === 0 ? overview
    : part === 1 ? aSections[section].fields
    : part === 2 ? bFields
    : reviewerFields

  return (
    <div className="rs1-page">
      {data._loadError && <p role="alert">{label('อ่านร่างเดิมไม่ได้ กรุณาตรวจสอบข้อมูลที่จัดเก็บ', 'Existing draft cannot be read. Check browser storage.')}</p>}

      <div className="rs1-heading">
        <div>
          <span className="rs1-eyebrow">
            RS-1 · Personal Research Grant
          </span>
          <h1>
            {label(
              'แบบฟอร์มข้อเสนอโครงการวิจัย',
              'Research Proposal Form'
            )}
          </h1>
          <p>
            {label(
              'กรอกข้อมูลตามส่วนของแบบฟอร์ม RS-1',
              'Complete the RS-1 form by part'
            )}
          </p>
        </div>

        <div className="heading-actions"><ProposalPDF proposal={data} /><button className="outline-button" disabled={saving} onClick={save}>
          <Save size={16} /> {label('บันทึกร่าง', 'Save Draft')}
        </button></div>
      </div>

      <section className="panel rs1-progress">
        <div className="rs1-progress-heading">
          <strong>
            {review
              ? label('ตรวจสอบข้อมูล', 'Review')
              : label('ส่วนที่', 'Part') + ' ' + (part + 1) + ' / 4'}
          </strong>
          <span>
            {review ? '100%' : Math.round((part + 1) / 4 * 100) + '%'}
          </span>
        </div>

        <div className="rs1-progress-track">
          <div
            style={{
              width: (review ? 100 : (part + 1) / 4 * 100) + '%'
            }}
          />
        </div>

        <div className="rs1-step-list">
          {parts.map((p, i) => (
            <button
              type="button"
              key={i}
              className={
                'rs1-step ' +
                (!review && part === i ? 'current' : '')
              }
              onClick={() => jump(i)}
            >
              <span>{i + 1}</span>
              <small>{p[th ? 0 : 1]}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel rs1-form-panel">
        {review ? (
          <>
            <div className="rs1-section-header">
              <span>{label('ตรวจสอบและยื่นข้อเสนอ', 'Review & Submit')}</span>
              <h2>
                {label(
                  'ตรวจสอบข้อมูลก่อนยืนยัน',
                  'Review Information'
                )}
              </h2>
            </div>

            <p className="rs1-note">
              {label(
                'ข้อมูลนี้ยังไม่ถูกส่งเข้าระบบอนุมัติจริง',
                'This information has not been submitted to an approval system'
              )}
            </p>

            <nav className="focused-tabs" aria-label="ส่วนตรวจทาน RS-1">{parts.map((p,i)=><button type="button" key={i} aria-current={reviewPart===i?'page':undefined} onClick={()=>setReviewPart(i)}>{p[th?0:1]}</button>)}</nav>
            {reviewPart===1&&<label>หัวข้อ Part A<select aria-label="หัวข้อตรวจทาน Part A" value={reviewSection} onChange={e=>setReviewSection(Number(e.target.value))}>{aSections.map((s,i)=><option key={i} value={i}>{s[th?'th':'en']||s.title?.[th?0:1]||'หัวข้อ '+(i+1)}</option>)}</select></label>}
            {parts.map((p,i)=>[p,i]).filter(([,i])=>i===reviewPart).map(([p,i]) => {
              const fields =
                i === 0 ? overview
                : i === 1 ? aSections[reviewSection].fields
                : i === 2 ? bFields
                : reviewerFields

              return (
                <div className="rs1-review-group" key={i}>
                  <div className="rs1-review-title">
                    <strong>{p[th ? 0 : 1]}</strong>
                    <button
                      className="outline-button"
                      onClick={() => jump(i)}
                    >
                      {label('แก้ไข', 'Edit')}
                    </button>
                  </div>

                  {fields
                    .filter(f => data[f.key])
                    .map(f => (
                      <div className="rs1-review-row" key={f.key}>
                        <span>{label(f.th, f.en)}</span>
                        <strong>{display(f)}</strong>
                      </div>
                    ))}
                </div>
              )
            })}

            <label className="rs1-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
              />
              {label(
                'ฉันได้ตรวจสอบข้อมูลแล้ว',
                'I have reviewed the information'
              )}
            </label>
          </>
        ) : (
          <>
            <div className="rs1-section-header">
              <span>{parts[part][th ? 0 : 1]}</span>
              <h2>
                {part === 1
                  ? aSections[section][th ? 'th' : 'en']
                  : parts[part][th ? 0 : 1]}
              </h2>
            </div>

            {part === 1 && (
              <div className="rs1-subnav">
                {aSections.map((s, i) => (
                  <button
                    type="button"
                    key={i}
                    className={section === i ? 'selected' : ''}
                    onClick={() => setSection(i)}
                    title={s[th ? 'th' : 'en']}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {part === 3 && (
              <p className="rs1-note">
                {label(
                  'สำหรับกรณีส่งรายงานฉบับสมบูรณ์ 5 บท: ผู้ทรงคุณวุฒิ 3 คน ต้องจบปริญญาเอก ไม่เป็นที่ปรึกษาหรือผู้ร่วมวิจัย และหัวหน้าโครงการติดต่อก่อนเสนอชื่อ',
                  'For a five-chapter final report: three PhD-qualified reviewers, not project advisors or participants, contacted in advance by the project leader.'
                )}
              </p>
            )}

            {part === 1 && section === 11 && (
              <p className="rs1-note">
                {label(
                  'ตามแบบฟอร์ม ระยะเวลาดำเนินงานไม่เกิน 2 ปี',
                  'The form specifies a research duration not exceeding two years.'
                )}
              </p>
            )}

            <div className="rs1-fields">
              {activeFields.map(renderField)}
            </div>

            {part === 1 && section === 16 && (
              <div className="rs1-total">
                <span>{label('งบประมาณรวม', 'Total Budget')}</span>
                <strong>{budget.toLocaleString()} ฿</strong>
              </div>
            )}

            {part === 1 && section === 18 && (
              <p className="rs1-note">
                {label(
                  'แบบฟอร์มกำหนดส่วนลงนามจริง โปรดตรวจสอบขั้นตอนการลงนามกับหน่วยงานก่อนใช้ระบบจริง',
                  'The source form includes actual signatures. Confirm signature workflow before production use.'
                )}
              </p>
            )}
          </>
        )}
      </section>

      {notice && (
        <div className="rs1-message" role="status">
          {notice}
        </div>
      )}

      <div className="rs1-footer">
        <button className="outline-button" onClick={back}>
          ← {label('ย้อนกลับ', 'Back')}
        </button>

        <div className="rs1-footer-right">
          <button className="outline-button" onClick={save}>
            {label('บันทึกร่าง', 'Save Draft')}
          </button>

          {review ? (
            <button
            type="button"
            className="primary"
            disabled={!confirmed || saving}
            onClick={async () => {
                if (await save(false)) onConfirm()
            }}
            >
              {label('ยืนยันการตรวจสอบ', 'Confirm Review')}
            </button>
          ) : (
            <button className="primary" onClick={next}>
              {part === 3
                ? label('ตรวจสอบข้อมูล', 'Review')
                : label('ถัดไป', 'Next')} →
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
