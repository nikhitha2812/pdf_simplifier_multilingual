import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

export interface ExtractedPdf {
  text: string
  pageCount: number
  fileName: string
}

export function validatePdf(file: File): string | null {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF files are supported.'
  }
  if (file.size > MAX_BYTES) {
    return 'File exceeds the 20 MB limit.'
  }
  if (file.size === 0) {
    return 'The selected file appears to be empty.'
  }
  return null
}

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const doc = await loadingTask.promise

  const pageTexts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // Reconstruct paragraphs by detecting line breaks via transform y-position deltas
    let lastY: number | null = null
    let line = ''
    const lines: string[] = []
    for (const item of content.items as any[]) {
      const str = item.str ?? ''
      const y = item.transform?.[5] ?? null
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        if (line.trim()) lines.push(line.trim())
        line = ''
      }
      line += str + (item.hasEOL ? '\n' : ' ')
      if (item.hasEOL) {
        if (line.trim()) lines.push(line.trim())
        line = ''
      }
      lastY = y
    }
    if (line.trim()) lines.push(line.trim())
    pageTexts.push(lines.join('\n'))
    page.cleanup()
  }

  await doc.destroy()
  const fullText = pageTexts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()

  if (!fullText) {
    throw new Error(
      'No extractable text found. This PDF may be a scanned image without a text layer.'
    )
  }
  return { text: fullText, pageCount: doc.numPages, fileName: file.name }
}
