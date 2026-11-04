import { useState } from 'react'
import DocumentPreview from './DocumentPreview'
export default function ResearchDocuments({documents=[]}) {
  const [selected,setSelected]=useState('')
  if(!documents.length)return null
  const document=documents.find(d=>d.id===selected)
  return <section className="panel cl-card"><h2>เอกสารประกอบโครงการ</h2><div className="review-file-links">{documents.map(d=><div key={d.id}><strong>{d.name}</strong>{d.dataUrl?<><button className="outline-button" onClick={()=>setSelected(selected===d.id?'':d.id)}>เปิด / ย่อ PDF</button><a href={d.dataUrl} download={d.name}>ดาวน์โหลด PDF</a></>:<p>ยังเปิดไฟล์ไม่ได้ กรุณาตรวจสอบการเชื่อมต่อ</p>}</div>)}</div>{document?.dataUrl&&<DocumentPreview key={document.id} url={document.dataUrl} filename={document.name} title={document.name}/>}</section>
}
