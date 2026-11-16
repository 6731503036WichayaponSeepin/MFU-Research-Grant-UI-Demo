import {extractRS1Tables} from './rs1FieldMapping.js'
import { rs1Fields } from './rs1Fields.js'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
const MAX_SIZE = 10 * 1024 * 1024


export const previewFields = rs1Fields.map(f=>[f.key,f.th,f.en,f.ariaTh?.replace(/ \*$/,''),f.ariaEn?.replace(/ \*$/,'')])

export const validateFile = (file) => {
  if (!file) {
    throw new Error('กรุณาเลือกไฟล์')
  }

  const extension = '.' + file.name.split('.').pop().toLowerCase()

  if (!['.pdf', '.docx'].includes(extension)) {
    throw new Error('รองรับเฉพาะไฟล์ PDF และ DOCX')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 10 MB')
  }

  if (file.size === 0) {
    throw new Error('ไฟล์ว่างเปล่า')
  }

  return extension
}

async function extractPDFText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())

  // Verify PDF signature before parsing.
  const signature = new TextDecoder('ascii').decode(bytes.slice(0, 5))

  if (signature !== '%PDF-') {
    throw new Error('ไฟล์ PDF ไม่ถูกต้อง')
  }

  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise

  try {
    const pages = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()

      let pageText = ''
      let previousY = null

      for (const item of content.items) {
        if (!('str' in item)) continue

        const y = item.transform?.[5]

        if (
          previousY !== null &&
          y !== undefined &&
          Math.abs(y - previousY) > 3
        ) {
          pageText += '\n'
        } else if (pageText) {
          pageText += ' '
        }

        pageText += item.str

        if (y !== undefined) {
          previousY = y
        }
      }

      pages.push(pageText)
    }

    return {
      text: pages.join('\n\n'),
      pageCount: pdf.numPages
    }
  } finally {
    await pdf.loadingTask.destroy().catch(() => {})
  }
}

async function extractDOCXText(file) {
  const arrayBuffer = await file.arrayBuffer()

  // Mammoth extracts text from DOCX documents.
  const result = await mammoth.extractRawText({ arrayBuffer })
  const html=await mammoth.convertToHtml({arrayBuffer},{convertImage:mammoth.images.imgElement(async()=>({src:''}))})
  const parsed=new DOMParser().parseFromString(html.value,'text/html')
  const tables=Array.from(parsed.querySelectorAll('table')).map(table=>Array.from(table.rows).map(row=>Array.from(row.cells).map(cell=>cell.textContent||'')))

  return {
    text: result.value || '',
    pageCount: 0,
    fields:extractRS1Tables(tables)
  }
}

export async function extractDocumentText(file) {
  const extension = validateFile(file)

  if (extension === '.pdf') {
    return extractPDFText(file)
  }

  if (extension === '.docx') {
    return extractDOCXText(file)
  }

  throw new Error('ไม่รองรับไฟล์ประเภทนี้')
}

