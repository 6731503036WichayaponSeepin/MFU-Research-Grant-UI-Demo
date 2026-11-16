import {budgetRows,budgetSubtotal,invalidBudgetAmount} from '../utils/rs1Budget'
import {Trash2} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {rs1Document,RS1_DOCUMENT_HEADER} from '../data/rs1Document'
import {projectParticipants,PARTICIPANT_FIELDS} from '../utils/rs1Participants'
import SignatureImages from './SignatureImages'
import RS1WorkPlan from './RS1WorkPlan'
import './RS1DocumentForm.css'

export default function RS1DocumentForm({data={},onChange,onParticipants,onBudget,onWorkPlan,editableFields,readOnly=false,signatures=true}){
 const {i18n}=useTranslation(),th=i18n.language!=='en',text=(a,b)=>th?a:b
 const locked=key=>readOnly||!!editableFields&&!editableFields.includes(key)
 const wording=(en,thai)=>th?<><span>{thai}</span>{en&&<small className="rs1-original-en">{en}</small>}</>:en
 function input(f,options={}){
  const key=options.key||f.key,value=options.value??data[key]??'',disabled=options.disabled??locked(key),label=options.label??(th?f.ariaTh:f.ariaEn)
  return <div className="rs1-field" data-rs1-key={key} key={key}>
   {f.en&&<label htmlFor={'rs1-'+key}>{wording(f.en,f.th)}</label>}
   {f.instruction&&<p className="rs1-source-instruction">{wording(f.instruction.en,f.instruction.th)}</p>}
   {readOnly?<p className="rs1-document-value">{String(value)===''?'...........................................................':String(value)}</p>:f.inputType==='textarea'?<textarea id={'rs1-'+key} aria-label={label} rows={3} value={value} disabled={disabled} onChange={e=>(options.change||onChange)(key,e.target.value)}/>:<input id={'rs1-'+key} aria-label={label} placeholder={f.placeholder} type={f.inputType||'text'} min={f.inputType==='number'?0:undefined} max={/Percent$|percent$/.test(key)?100:undefined} value={value} disabled={disabled} onChange={e=>(options.change||onChange)(key,e.target.value)}/>}
  </div>
 }
 function render(b){
  if(b.type==='heading'){const H=b.level===1?'h2':'h'+b.level;return <H data-rs1-source={b.id} key={b.id}>{wording(b.en,b.th)}</H>}
  if(b.type==='fixed')return <p key={b.id} data-rs1-source={b.id}>☑ {wording(b.en,b.th)}</p>
  if(b.type==='text')return <p key={b.id} data-rs1-source={b.id} className="rs1-source-instruction">{b.id.startsWith('c-requirement-')?'• ':''}{wording(b.en,b.th)}</p>
  if(b.type==='field')return <div key={b.id} data-rs1-source={b.id} className={b.heading?'rs1-source-section':''}>{input(b)}</div>
  if(b.type==='choices')return <fieldset className="rs1-field rs1-document-options" data-rs1-key={b.key} data-rs1-source={b.id} key={b.id} disabled={locked(b.key)}><legend>{wording(b.en,b.th)}</legend>{b.instruction&&<p className="rs1-source-instruction">{wording(b.instruction.en,b.instruction.th)}</p>}{b.options.map(o=><label key={o.value}><input type={b.multiple?'checkbox':'radio'} name={'rs1-'+b.key} value={o.value} checked={String(data[b.key]||'').split('|').includes(o.value)} disabled={locked(b.key)} onChange={e=>onChange(b.key,b.multiple?(e.target.checked?[...String(data[b.key]||'').split('|').filter(Boolean),o.value]:String(data[b.key]||'').split('|').filter(v=>v!==o.value)).join('|'):o.value)}/><span>{wording(o.en,o.th)}</span></label>)}</fieldset>
  if(b.type==='people'){
   const people=b.role==='leader'?[{}]:projectParticipants(data),rows=people.length?people:[{}],disabled=locked('participantRecords')
   return <section key={b.id} data-rs1-source={b.id} className={'rs1-document-people rs1-'+b.role}><h4>{wording(b.en,b.th)}</h4>{rows.map((person,index)=><div className="rs1-participant" key={index}>{b.role==='participant'&&people.length>0&&!readOnly&&<button className="outline-button rs1-remove-person" type="button" disabled={disabled} onClick={()=>onParticipants(people.filter((_,i)=>i!==index))}>{text('ลบผู้ร่วมโครงการ','Remove Participant')} {index+1}</button>}<div className="rs1-fields">{b.fields.map((f,i)=>b.role==='leader'||index===0?input(f):input(f,{key:'participant-'+index+'-'+PARTICIPANT_FIELDS[i],value:person[PARTICIPANT_FIELDS[i]]??'',disabled,label:(th?f.ariaTh:f.ariaEn)+' ('+(index+1)+')',change:(_key,value)=>onParticipants(people.map((row,n)=>n===index?{...row,[PARTICIPANT_FIELDS[i]]:value}:row))}))}</div></div>)}{b.role==='participant'&&!readOnly&&<button type="button" className="outline-button" disabled={disabled} onClick={()=>onParticipants([...people,Object.fromEntries(PARTICIPANT_FIELDS.map(key=>[key,'']))])}>{text('เพิ่มผู้ร่วมโครงการ','Add Participant')}</button>}</section>
  }
  if(b.type==='duration')return <section key={b.id} data-rs1-source={b.id}><p className="rs1-source-instruction">{wording(b.en,b.th)}</p><div className="rs1-fields">{b.fields.map(f=>input(f))}</div></section>
  if(b.type==='workTable')return <div data-rs1-source={b.id} key={b.id}><RS1WorkPlan data={data} onChange={onWorkPlan} disabled={locked('workTasks')} readOnly={readOnly}/></div>
  if(b.type==='budgetTable')return <div className="rs1-table-wrap" data-rs1-source={b.id} key={b.id}><table className="rs1-reference-table"><thead><tr>{b.headers.map((v,i)=><th key={i}>{wording(v,b.headersTh[i])}</th>)}</tr></thead><tbody><tr><th>{wording(b.caption,b.captionTh)}</th><td/></tr>{b.categories.map(cat=><FragmentRows key={cat.key} category={cat} input={input} wording={wording} data={data} onBudget={onBudget} locked={locked('budgetItems')} readOnly={readOnly} text={text} th={th}/>)}<tr><th>{wording(b.total,b.totalTh)}</th><td><output>{b.categories.reduce((sum,c)=>sum+budgetSubtotal(budgetRows(data,c.key)),0).toLocaleString(th?'th-TH':'en-GB')}</output></td></tr></tbody></table></div>
  if(b.type==='signature')return null
 }
 const groups=[rs1Document.filter(b=>b.id==='title'||b.id==='budget-type'||b.id==='project-title'||b.id==='strategy'),rs1Document.slice(rs1Document.findIndex(b=>b.id==='part-a'),rs1Document.findIndex(b=>b.id==='part-b')),rs1Document.slice(rs1Document.findIndex(b=>b.id==='part-b'),rs1Document.findIndex(b=>b.id==='part-c')),rs1Document.slice(rs1Document.findIndex(b=>b.id==='part-c'))]
 return <div className="rs1-document-form"><p className="rs1-source-header">{RS1_DOCUMENT_HEADER}</p>{groups.map((blocks,i)=><section className="panel rs1-continuous-card" key={i}>{blocks.map(render)}{i===1&&signatures&&<SignatureImages data={data} onChange={onChange} editableFields={editableFields} readOnly={readOnly}/>}</section>)}</div>
}

function FragmentRows({category:b,input,wording,data,onBudget,locked,readOnly,text,th}){
 const rows=budgetRows(data,b.key),shown=rows.length||Array.isArray(data.budgetItems?.[b.key])?rows:[{description:'',amount:''}]
 const money=value=>value.toLocaleString(th?'th-TH':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})
 return <><tr className="rs1-budget-category"><th colSpan={2}>{wording(b.en,b.th)}</th></tr>{shown.map((row,index)=><tr className="rs1-budget-row" data-category={b.key} key={index}>{['description','amount'].map((key,col)=>{
 const template=b.rows[0][col],f={...template,key:b.key+(col===0?'Item':'Amount')+(index+1),ariaEn:template.ariaEn.replace('1',String(index+1)),ariaTh:template.ariaTh.replace('1',String(index+1))}
 return <td key={key}>{input(f,{value:row[key]??'',disabled:locked,change:(_field,value)=>onBudget(b.key,shown.map((r,i)=>i===index?{...r,[key]:value}:r))})}{col===1&&!readOnly&&<button type="button" className="rs1-remove-expense" disabled={locked} aria-label={text('ลบรายการค่าใช้จ่าย','Remove expense')+' '+(index+1)+' — '+b.key} onClick={()=>onBudget(b.key,shown.filter((_,i)=>i!==index))}><Trash2 size={16}/></button>}{col===1&&invalidBudgetAmount(row.amount)&&<p role="alert" className="rs1-amount-error">{text('กรุณาระบุจำนวนเงินที่ไม่ติดลบ','Enter a non-negative amount')}</p>}</td>
 })}</tr>)}<tr className="rs1-budget-actions"><td colSpan={2}>{!readOnly&&<button type="button" className="outline-button" disabled={locked} aria-label={text('เพิ่มรายการค่าใช้จ่าย','Add expense')+' — '+b.key} onClick={()=>onBudget(b.key,[...shown,{description:'',amount:''}])}>+ {text('เพิ่มรายการค่าใช้จ่าย','Add expense')}</button>}<span>{text('รวม','Subtotal')} <output>{money(budgetSubtotal(rows))}</output> {text('บาท','THB')}</span></td></tr></>
}
