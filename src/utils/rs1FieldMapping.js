import { rs1Document } from '../data/rs1Document.js'
import { participantPatch } from './rs1Participants.js'
import {parseWorkPeriod,workPlanPatch,workDate,extractWorkPlanText} from './rs1WorkPlan.js'
import { rs1Fields } from './rs1Fields.js'
import { rs1LegacyFields } from './rs1LegacyFields.js'
function meaningful(value) {
  return !!value && !/^[\s.…_-]+$/.test(value) && !/^(Full name|Affiliation|Telephone|E-mail|Percentage|Please |Must |Signature|Date\s*\.)/i.test(value)
}
function findValue(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match && (match.index === 0 || text[match.index-1] === '\n') && meaningful(match?.[1]?.trim())) {
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

  // Exact, labelled values only: never infer names from repeated blank template labels,
  // signatures from embedded graphics, or checkbox selections from unmarked options.
  const lines = text.split(/\r?\n/).map(line=>line.trim())
  const participantRows=[]
  const structured = /Part A/i.test(text)
  if(structured) {
    for(const key of Object.keys(result)) delete result[key]
    let context='', reviewer=0
    for(const line of lines) {
      if(/^Part B/i.test(line))context='bio'
      else if(/^Part C/i.test(line))context='reviewers'
      else if(/^(?:1\.1\s*)?Project Leader\s*$/i.test(line))context='leader'
      else if(/^(?:1\.2\s*)?Project Participant(?:\s+\d+)?\s*$/i.test(line)){context='participant';participantRows.push({})}
      else if(/^(?:2[.)]?\s*)?Project Advisor\s*$/i.test(line))context='advisor'
      else if(/^(?:3[.)]?\s*)?Cooperation from other Agencies/i.test(line))context='cooperation'
      const match=line.match(/^(?:\d+(?:\.\d+)*[.)]?\s*)?(Full name|Affiliation|Telephone number\/Mobile number|E-mail|Percentage of the responsibility toward the project|Educational qualification|Academic positions?|Address|The type of research cooperation)\s*[:：]\s*(.+)$/i)
      if(!match || !meaningful(match[2]))continue
      const suffix=({'full name':'Name',affiliation:'Affiliation','telephone number/mobile number':'Phone','e-mail':'Email','percentage of the responsibility toward the project':'Percent','educational qualification':'Qualification','academic position':'Position','academic positions':'Position',address:'Address','the type of research cooperation':'Type'})[match[1].toLowerCase()]
      if(context==='reviewers' && suffix==='Name')reviewer++
      if(context==='participant'){if(!participantRows.length||suffix==='Name'&&participantRows.at(-1).name)participantRows.push({});participantRows.at(-1)[suffix.toLowerCase()]=match[2].trim()}
      const prefix=context==='reviewers'?`reviewer${reviewer}`:context
      const key=prefix+suffix
      if([...rs1Fields,...rs1LegacyFields].some(f=>f.key===key))result[key]=match[2].trim()
    }
  }
  for (const f of [...rs1LegacyFields,...rs1Fields]) {
    if(!rs1Fields.some(current=>current.key===f.key))continue
    if (/^reviewer/.test(f.key) && !/Part C/i.test(text)) continue
    for (const label of [f.en, f.th]) {
      if(/^(Affiliation|Full name:?|Academic positions?:?|E-mail:?|Email)$/i.test(label))continue
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
      const pattern = new RegExp('^\\s*(?:\\d+(?:\\.\\d+)*[.)]?\\s*)?'+escaped+'\\s*[:：]\\s*(.+)$','i')
      const partB=lines.findIndex(line=>/^Part B/i.test(line)),partC=lines.findIndex(line=>/^Part C/i.test(line))
      const scoped=f.key.startsWith('bio')&&partB>=0?lines.slice(partB,partC>=0?partC:undefined):f.key.startsWith('reviewer')&&partC>=0?lines.slice(partC):lines
      const value = scoped.map(line=>line.match(pattern)?.[1]?.trim()).find(meaningful)
      if (value) { result[f.key]=value; break }
    }
  }
  // Original long headings may have their response in the following paragraph.
  // Match only exact source headings, stop at the next original heading, and omit instructions/placeholders.
  const labelKey=value=>value.replace(/^\d+(?:\.\d+)*[.]?\s+/,'').replace(/\s+/g,' ').trim().toLowerCase()
  const boundaries=new Set(rs1Document.flatMap(b=>[b.en,...(b.fields||[]).map(f=>f.en)]).filter(Boolean).map(labelKey))
  for(const b of rs1Document.filter(b=>b.type==='field'&&(b.heading||b.key.startsWith('bio')))){
    const partB=lines.findIndex(line=>/^Part B/i.test(line)),partC=lines.findIndex(line=>/^Part C/i.test(line))
    const scope=b.key.startsWith('bio')&&partB>=0?lines.slice(partB,partC>=0?partC:undefined):lines
    const start=scope.findIndex(line=>labelKey(line)===labelKey(b.en));if(start<0)continue
    let end=start+1;while(end<scope.length&&!boundaries.has(labelKey(scope[end])))end++
    let candidate=scope.slice(start+1,end).filter(line=>meaningful(line)&&!/^\d*[. …]+$/.test(line)).join('\n')
    if(b.instruction){const instruction=b.instruction.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');candidate=candidate.replace(new RegExp('^'+instruction+'\\s*','i'),'')}
    if(meaningful(candidate))result[b.key]=candidate
  }
  const duration=text.match(/The duration\s*(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})/i)
  if(duration){result.startDate=duration[1];result.endDate=duration[2]}
  Object.assign(result,extractWorkPlanText(text,result))
  const people=participantRows.filter(row=>Object.values(row).some(v=>String(v).trim()))
  if(people.length)Object.assign(result,participantPatch(people))
  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value)
  )
}


// Tables are supplied as plain cell text by the DOCX adapter; never evaluate or render imported HTML.
export function extractRS1Tables(tables){
 const result={},clean=value=>String(value??'').trim(),has=value=>meaningful(value)&&!/^\d*[. …]+$/.test(value)
 const amount=value=>/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(value)?value.replaceAll(',',''):value
 for(const table of tables){
  const rows=table.map(row=>row.map(clean)),head=rows[0]||[]
  if(/^Task(?: Name)?$/.test(head[0]||'')&&(head[1]==='Period'||head[1]==='Start Date'&&head[2]==='End Date')){
   const tasks=rows.slice(1).filter(row=>has(row[0])||has(row[1])||has(row[2])).map(row=>{const period=head[1]==='Period'?row[1]:[row[1],row[2]].join(' – '),parsed=parseWorkPeriod(period);return {name:has(row[0])?row[0]:'',endDate:parsed?.endDate||(head[2]==='End Date'&&workDate(row[2])?row[2]:''),legacyPeriod:has(period)?period:''}})
   if(tasks.length)Object.assign(result,workPlanPatch(result,tasks))
  }
  if(!/^The Expense list/i.test(head[0]||'')||!/^Amount \(Baht\)/i.test(head[1]||''))continue
  let category='',index=0
  for(const row of rows.slice(1)){
   const match=row[0]?.match(/^Category\s*([1-4])\s*:/i)
   if(match){category=['compensation','directCost','materials','utility'][Number(match[1])-1];index=0;if(has(row[1]))result[category]=amount(row[1]);continue}
   if(!category||/^The total budget/i.test(row[0]||''))continue
   if(index>=3)continue;index++
   if(has(row[0]))result[category+'Item'+index]=row[0]
   if(has(row[1]))result[category+'Amount'+index]=amount(row[1])
  }
  for(const key of ['compensation','directCost','materials','utility']){const values=[1,2,3].map(n=>result[key+'Amount'+n]).filter(v=>v!==undefined);if(values.length&&values.every(v=>Number.isFinite(Number(v))))result[key]=String(values.reduce((sum,v)=>sum+Number(v),0))}
 }
 return result
}
