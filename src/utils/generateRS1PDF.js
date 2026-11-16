import {budgetRows,budgetSubtotal} from './rs1Budget'
import {workTasks,taskPeriod} from './rs1WorkPlan'
import {rs1Signers,currentSignature} from './rs1Signatures'
import {jsPDF} from 'jspdf'
import {DRAFT_KEY} from './projectStorage'
import {rs1Document,RS1_DOCUMENT_HEADER} from '../data/rs1Document'
import {projectParticipants,PARTICIPANT_FIELDS} from './rs1Participants'
import {signatureErrors} from './rs1Signatures'

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


export async function generateRS1PDF(proposal){
 const data=proposal||JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')
 const errors=signatureErrors(data);if(errors.length)throw Error(errors.map(e=>e.message+' / '+e.messageEn).join('\n'))
 const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true})
 for(const [filename,style] of [['Sarabun-Regular.ttf','normal'],['Sarabun-Bold.ttf','bold']]){doc.addFileToVFS(filename,await fontToBase64('/fonts/'+filename));doc.addFont(filename,'Sarabun',style)}
 const margin=20,width=170,bottom=275;let y=23,sourcePage=1
 function newPage(){doc.addPage();y=23}
 function space(height){if(y+height>bottom)newPage()}
 function write(text,{bold=false,size=10,gap=3,indent=0}={}){
  doc.setFont('Sarabun',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(30)
  const original=String(text??''),symbolPositions=new Map()
  const layout=Array.from(original).map((char,index)=>{if('✓□☑'.includes(char)){symbolPositions.set(index,char);return 'X'}return char}).join('')
  const lines=doc.splitTextToSize(layout,width-indent),lineHeight=size*.43;let offset=0
  for(const line of lines){
   space(lineHeight);const start=layout.indexOf(line,offset);let x=margin+indent,segment=''
   function flush(){if(segment){doc.text(segment,x,y);x+=doc.getTextWidth(segment);segment=''}}
   for(let index=0;index<line.length;index++){
    const symbol=symbolPositions.get(start+index)
    if(!symbol){segment+=line[index];continue}
    flush();doc.setDrawColor(30);doc.setLineWidth(.25)
    if(symbol==='□'||symbol==='☑')doc.rect(x,y-2.6,2.6,2.6)
    if(symbol==='✓'||symbol==='☑'){doc.line(x+.3,y-1.1,x+1.1,y-.3);doc.line(x+1.1,y-.3,x+2.5,y-2.3)}
    x+=doc.getTextWidth('X')
   }
   flush();offset=start+line.length;y+=lineHeight
  }y+=gap
 }
 const value=key=>data[key]===undefined||data[key]===''?'...........................................................':String(data[key])
 function field(f){
  if(f.en)write(f.en,{bold:!!f.heading,size:f.heading?11:10,gap:2})
  if(f.instruction)write(f.instruction.en,{size:9,gap:3})
  write(value(f.key),{size:10,gap:4})
 }
 function table(headers,rows,widths=[112,58]){
  for(const [index,row] of [headers,...rows].entries()){
   doc.setFont('Sarabun',index===0?'bold':'normal');doc.setFontSize(9)
   const cells=row.map((v,i)=>doc.splitTextToSize(String(v??''),widths[i]-4));let offset=0
   const count=Math.max(...cells.map(v=>v.length),1)
   while(offset<count){const take=Math.min(48,count-offset),height=Math.max(8,take*4+4);space(height);let x=margin
    for(let i=0;i<cells.length;i++){doc.setDrawColor(130);doc.rect(x,y,widths[i],height);const lines=cells[i].slice(offset,offset+take);if(lines.length)doc.text(lines,x+2,y+5);x+=widths[i]}
    y+=height;offset+=take
   }
  }y+=4
 }
 for(const b of rs1Document){
  if(b.page!==sourcePage){newPage();sourcePage=b.page}
  if(b.type==='heading'){space(12);write(b.en,{bold:true,size:b.level<=2?13:11,gap:5})}
  else if(b.type==='fixed'){write('☑ '+b.en,{bold:true})}
  else if(b.type==='text')write((b.id.startsWith('c-requirement-')?'• ':'')+b.en,{size:9,gap:4})
  else if(b.type==='field')field(b)
  else if(b.type==='choices'){
   write(b.en,{bold:true,size:11,gap:3});if(b.instruction)write(b.instruction.en,{size:9})
   for(const o of b.options){write((String(data[b.key]||'').split('|').includes(o.value)?'☑ ':'□ ')+o.en,{size:9,gap:2,indent:4})}
   y+=2
  }
  else if(b.type==='people'){
   space(20);write(b.en,{bold:true,size:11,gap:3})
   const people=b.role==='leader'?[null]:projectParticipants(data),rows=people.length?people:[{}]
   for(const person of rows)for(const [i,f]of b.fields.entries())write(f.en+' '+(person===null?value(f.key):person[PARTICIPANT_FIELDS[i]]===undefined||person[PARTICIPANT_FIELDS[i]]===''?'...........................................................':person[PARTICIPANT_FIELDS[i]]),{size:10,gap:2})
   y+=3
  }
  else if(b.type==='duration'){let index=0;write(b.en.replace(/[….]{3,}/g,placeholder=>{const v=data[index++===0?'startDate':'endDate'];return v||placeholder}),{size:9})}
  else if(b.type==='workTable')table(b.headers,workTasks(data).length?workTasks(data).map(row=>[row.name,taskPeriod(row)]):b.rows.map(()=>['','']))
  else if(b.type==='budgetTable')table(b.headers,[[b.caption,''],...b.categories.flatMap(cat=>[[cat.en,budgetSubtotal(budgetRows(data,cat.key))||''],...(budgetRows(data,cat.key).length?budgetRows(data,cat.key).map(row=>[row.description,row.amount]):cat.rows.map(()=>['','']))]),[b.total,b.categories.reduce((sum,c)=>sum+budgetSubtotal(budgetRows(data,c.key)),0)]])
  else if(b.type==='signature'){
   const modern=Array.isArray(data.electronicSignatures)
   const people=modern?rs1Signers(data).filter(s=>s.role===(b.role==='team'?'participants':b.role)):[null]
   for(const signer of people){
    const record=signer?currentSignature(data,signer):null
    const legacyName=data[b.fields[0].key]||'',actualName=signer?.name||(b.role==='leader'?data.leaderName:b.role==='advisor'?data.advisorName:null)||legacyName
    const legacyMatches=!actualName||!legacyName||actualName===legacyName
    const image=modern?record?.image:legacyMatches?data[b.role+'SignatureImage']:null
    space(39);write(b.en,{bold:true,size:10,gap:2})
    if(image){const prop=doc.getImageProperties(image),scale=Math.min(48/prop.width,16/prop.height);doc.addImage(image,image.startsWith('data:image/png')?'PNG':'JPEG',margin,y,prop.width*scale,prop.height*scale,undefined,'FAST');y+=18}else y+=12
    write(actualName?'('+actualName+')':b.fields[0].en,{size:10,gap:2})
    write(b.title,{size:10,gap:2});const date=modern?record?.date:legacyMatches?data[b.fields[1].key]:null
    write(date?'Date '+date:b.fields[1].en,{size:10,gap:5})
   }
  }
 }
 const pages=doc.getNumberOfPages()
 for(let p=1;p<=pages;p++){doc.setPage(p);doc.setFont('Sarabun','normal');doc.setFontSize(9);doc.setTextColor(50);if([1,4,7].includes(p))doc.text(RS1_DOCUMENT_HEADER,190,15,{align:'right'});doc.text('Page '+p+' of '+pages,190,287,{align:'right'})}
 return {blob:doc.output('blob'),filename:'RS-1_Research_Proposal.pdf'}
}
