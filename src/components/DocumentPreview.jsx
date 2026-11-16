import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc=pdfWorker
export default function DocumentPreview({url,filename='proposal.pdf',title,enhanced=false}) {
  const {i18n}=useTranslation(),th=i18n.language!=='en'
  const [loaded,setLoaded]=useState(null),[page,setPage]=useState(1),[rendered,setRendered]=useState(''),[renderError,setRenderError]=useState(null)
  const [attempt,setAttempt]=useState(0)
  const canvas=useRef(null),container=useRef(null),reader=useRef(null)
  const [zoom,setZoom]=useState(1),[viewWidth,setViewWidth]=useState(0)
  const current=loaded?.url===url?loaded:null,pdf=current?.pdf,key=url+'#'+page+(enhanced?'#'+zoom+'#'+viewWidth:'')
  useEffect(()=>{if(!enhanced||!container.current)return;const observer=new ResizeObserver(entries=>setViewWidth(entries[0].contentRect.width));observer.observe(container.current);return()=>observer.disconnect()},[enhanced,pdf])
  useEffect(()=>{
    let active=true,pdf,objectUrl,task
    fetch(url).then(async response=>{
      if(!response.ok)throw new Error('Unavailable')
      const bytes=await response.arrayBuffer()
      if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('Not PDF')
      objectUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}))
      task=pdfjsLib.getDocument({data:new Uint8Array(bytes)})
      pdf=await task.promise
      if(active){setLoaded({url,pdf,download:objectUrl});setPage(1)}else await task.destroy()
    }).catch(()=>{if(active)setLoaded({url,error:true})})
    return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);task?.destroy().catch(()=>{})}
  },[url,attempt])
  useEffect(()=>{
    if(!pdf || !canvas.current)return
    let active=true,task
    pdf.getPage(page).then(documentPage=>{
      if(!active)return
      const base=documentPage.getViewport({scale:1}),width=enhanced?Math.max(120,viewWidth||container.current?.clientWidth||500)*zoom:Math.min(container.current?.clientWidth || 850,850)
      const viewport=documentPage.getViewport({scale:width/base.width}),ratio=Math.min(window.devicePixelRatio || 1,2)
      const target=canvas.current;target.width=Math.ceil(viewport.width*ratio);target.height=Math.ceil(viewport.height*ratio)
      target.style.width=viewport.width+'px';target.style.height='auto'
      task=documentPage.render({canvasContext:target.getContext('2d'),viewport,transform:ratio===1?undefined:[ratio,0,0,ratio,0,0]})
      return task.promise
    }).then(()=>{if(active)setRendered(key)}).catch(()=>{if(active)setRenderError({key,message:th?'แสดงหน้าเอกสารไม่ได้ กรุณาดาวน์โหลด PDF':'Unable to render this page. Download the PDF.'})})
    return ()=>{active=false;task?.cancel()}
  },[pdf,page,key,th,enhanced,viewWidth,zoom])
  if(!current)return <p role="status">{th?'กำลังเปิดไฟล์ PDF…':'Opening PDF…'}</p>
  if(current.error)return <div role="alert"><p>{th?'ไม่สามารถเปิดไฟล์ PDF ได้ กรุณาตรวจสอบการเชื่อมต่อ':'Unable to open PDF. Check the connection.'}</p><button className="outline-button" onClick={()=>{setLoaded(null);setAttempt(n=>n+1)}}>{th?'ลองอีกครั้ง':'Retry'}</button></div>
  return <section ref={reader} className={"pdf-reader"+(enhanced?" pdf-reader-enhanced":"")} aria-label={title || (th?'เอกสาร PDF':'PDF document')}><div className="pdf-reader-toolbar"><span>{!enhanced&&(th?'หน้า':'Page')} {page} / {pdf.numPages}</span>{pdf.numPages>1&&<div><button type="button" className="outline-button" aria-label={th?'ก่อนหน้า':'Previous'} disabled={page<=1} onClick={()=>setPage(page-1)}>{enhanced?'‹':th?'ก่อนหน้า':'Previous'}</button><button type="button" className="outline-button" aria-label={th?'ถัดไป':'Next'} disabled={page>=pdf.numPages} onClick={()=>setPage(page+1)}>{enhanced?'›':th?'ถัดไป':'Next'}</button></div>}{enhanced&&<><label><span className="pdf-control-label">{th?'ไปหน้า':'Go to page'}</span><input aria-label={th?'ไปหน้า':'Go to page'} type="number" min={1} max={pdf.numPages} value={page} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=pdf.numPages)setPage(n)}}/></label><button type="button" className="outline-button" aria-label={th?'ย่อ':'Zoom out'} disabled={zoom<=0.5} onClick={()=>setZoom(v=>Math.max(.5,v-.25))}>−</button><span>{Math.round(zoom*100)}%</span><button type="button" className="outline-button" aria-label={th?'ขยาย':'Zoom in'} disabled={zoom>=3} onClick={()=>setZoom(v=>Math.min(3,v+.25))}>+</button><button type="button" className="outline-button" aria-label={th?'พอดีความกว้าง':'Fit width'} title={th?'พอดีความกว้าง':'Fit width'} onClick={()=>setZoom(1)}>↔</button>{document.fullscreenEnabled&&<button type="button" className="outline-button" aria-label={th?'เต็มหน้าจอ':'Fullscreen'} title={th?'เต็มหน้าจอ':'Fullscreen'} onClick={()=>{const action=document.fullscreenElement?document.exitFullscreen():reader.current?.requestFullscreen?.();action?.catch(()=>{})}}>⛶</button>}</>}<a href={current.download} download={filename} aria-label={th?'ดาวน์โหลด PDF':'Download PDF'} title={th?'ดาวน์โหลด PDF':'Download PDF'}>{enhanced?'↓':th?'ดาวน์โหลด PDF':'Download PDF'}</a></div>{rendered!==key&&<p role="status">{th?'กำลังแสดงหน้าเอกสาร…':'Rendering page…'}</p>}{renderError?.key===key&&<p role="alert">{renderError.message}</p>}<div className="pdf-canvas-wrap" ref={container}><canvas ref={canvas} data-rendered={rendered===key} role="img" aria-label={(title || 'PDF')+' '+page}/></div></section>
}
