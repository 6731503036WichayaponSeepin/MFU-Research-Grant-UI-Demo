import { createRoot } from 'react-dom/client'
import App from '../src/App'
import '../src/index.css'
export default function Preview() {
  function seed() {
    const pdf = '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
    const documents = ['report','publication'].map(kind=>({id:kind,name:kind+'-fixture.pdf',kind,size:pdf.length,dataUrl:'data:application/pdf;base64,'+btoa(pdf)}))
    const projects=['report','publication'].map((method,i)=>({id:'CLOSURE-TEST-'+(i+1),title:i===0?'โครงการทดสอบรายงานฉบับสมบูรณ์':'โครงการทดสอบหลักฐานเผยแพร่',leader:'Demo Researcher',ownerUsername:'demo-user',status:'active',createdAt:'2026-01-01T00:00:00Z',startDate:'2026-01-01',endDate:'2026-12-31',budget:150000,proposal:{},closure:{state:'draft',revision:0,method,summary:'สรุปผลการวิจัยสำหรับทดสอบกระบวนการปิดโครงการ',finishedDate:'2026-10-17',documents:documents.filter(d=>d.kind===method)}}))
    localStorage.setItem('mfu-rs1-prototype-projects',JSON.stringify(projects))
    location.reload()
  }
  return <><div style={{padding:12,background:'#fff3d9'}}>Isolated development fixture · port 5180 only <button onClick={seed}>Reset closure test fixtures</button></div><App/></>
}
if(import.meta.env.DEV && location.port==='5180') createRoot(document.getElementById('root')).render(<Preview/>)
