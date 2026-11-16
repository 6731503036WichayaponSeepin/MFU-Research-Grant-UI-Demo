export function workDate(value){
 return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value
}
export function twoYearEnd(start){
 if(!workDate(start))return ''
 const [year,month,day]=start.split('-').map(Number),last=new Date(Date.UTC(year+2,month,0)).getUTCDate()
 return `${year+2}-${String(month).padStart(2,'0')}-${String(Math.min(day,last)).padStart(2,'0')}`
}
export function parseWorkPeriod(period=''){
 const dates=String(period).match(/\d{4}-\d{2}-\d{2}/g)||[]
 return dates.length===2&&dates.every(workDate)?{startDate:dates[0],endDate:dates[1]}:null
}
export function workTasks(data={}){
 const rows=Array.isArray(data.workTasks)?data.workTasks:[1,2,3].map(n=>({name:String(data['workTask'+n]||''),endDate:parseWorkPeriod(data['workPeriod'+n])?.endDate||'',legacyPeriod:String(data['workPeriod'+n]||'')})).filter(row=>row.name||row.legacyPeriod)
 return chainTasks(rows,data.startDate)
}
export function chainTasks(rows,start){
 return rows.map((row,i)=>({...row,startDate:i===0?(start||''):(rows[i-1].endDate||'')}))
}
export function taskPeriod(row){
 if(row.startDate&&row.endDate)return row.startDate+' – '+row.endDate
 return row.legacyPeriod||[row.startDate,row.endDate].filter(Boolean).join(' – ')
}
export function workPlanPatch(data,rows){
 const tasks=chainTasks(rows,data.startDate)
 return {workTasks:tasks,...Object.fromEntries([1,2,3].flatMap(n=>[['workTask'+n,tasks[n-1]?.name||''],['workPeriod'+n,tasks[n-1]?taskPeriod(tasks[n-1]):'']]))}
}
export function workPlanErrors(data={}){
 const errors=[],add=(field,message,messageEn)=>errors.push({field,message,messageEn})
 if(workDate(data.startDate)&&workDate(data.endDate)&&data.endDate>twoYearEnd(data.startDate))add('endDate','ระยะเวลาโครงการต้องไม่เกิน 2 ปี','Project duration must not exceed two years.')
 // Unparsed legacy periods remain visible and preserved; never guess dates from free text.
 for(const [i,row]of workTasks(data).entries()){
  if(!Array.isArray(data.workTasks)&&!row.endDate)continue
  if(!row.name&&!row.endDate)continue
  if(!workDate(row.startDate)||!workDate(row.endDate))add('workTasks',`งานที่ ${i+1}: โปรดระบุวันที่ให้ถูกต้อง`,`Task ${i+1}: enter valid dates.`)
  else if(row.endDate<row.startDate)add('workTasks',`งานที่ ${i+1}: วันสิ้นสุดต้องไม่ก่อนวันเริ่ม`,`Task ${i+1}: end date must not precede start date.`)
  if(workDate(row.endDate)&&workDate(data.endDate)&&row.endDate>data.endDate||workDate(row.startDate)&&workDate(data.startDate)&&row.startDate<data.startDate)add('workTasks',`งานที่ ${i+1}: วันที่ต้องอยู่ภายในระยะเวลาโครงการ`,`Task ${i+1}: dates must be within the project period.`)
 }
 return errors
}
export function extractWorkPlanText(text,data={}){
 const block=text.match(/(?:^|\n)\s*Task\s+Period\s*\n([\s\S]*?)(?=\n\s*13[.]?\s*Research Progress|$)/i)?.[1]
 if(!block)return {}
 const rows=[]
 for(const line of block.split('\n').map(v=>v.trim()).filter(Boolean)){
  if(/^Page \d+ of \d+|^RS-1 Personal Budget$|^Task\s+Period$/i.test(line))continue
  const match=line.match(/^(.*?)\s*(\d{4}-\d{2}-\d{2})\s*[–—-]\s*(\d{4}-\d{2}-\d{2})\s*$/)
  if(match&&workDate(match[2])&&workDate(match[3]))rows.push({name:match[1].trim(),endDate:match[3],legacyPeriod:match[2]+' – '+match[3]})
  else if(rows.length)rows.at(-1).name+=' '+line
 }
 return rows.length?workPlanPatch(data,rows):{}
}
