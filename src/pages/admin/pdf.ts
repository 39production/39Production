export interface BusinessPdfDocument {
  number: string
  type: string
  title: string
  related_to?: string | null
  date?: string | null
  status?: string | null
  content?: string | null
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN_X = 46
const TOP = 52
const BOTTOM = 48
const CONTENT_W = PAGE_W - MARGIN_X * 2

function latin1(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\xFF]/g, '?')
}

function escPdf(value: string) {
  return latin1(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrapText(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length <= maxChars) {
      line = (line + ' ' + word).trim()
    } else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function money(value: string) {
  const match = value.match(/Rp\s*([0-9.,]+)/i)
  if (!match) return value
  return value.replace(match[1], match[1].replace(/\./g, '.'))
}

function parseDetails(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(':')
      if (separator > 0) {
        return { label: line.slice(0, separator).trim(), value: money(line.slice(separator + 1).trim()) }
      }
      return { label: '', value: line }
    })
}

function documentPrefix(type: string) {
  if (type === 'Invoice') return 'INV'
  if (type === 'Receipt') return 'REC'
  if (type === 'Order Confirmation') return 'ORD'
  return 'DOC'
}

function makePage(doc: BusinessPdfDocument, pageIndex: number, totalPages: number, details: { label: string; value: string }[]) {
  const commands: string[] = []
  const text = (x: number, y: number, value: string, size = 9, font = 'F1') => {
    commands.push(`BT /${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escPdf(value)}) Tj ET`)
  }
  const line = (x1: number, y1: number, x2: number, y2: number, width = 0.7) => {
    commands.push(`${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`)
  }
  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    commands.push(`${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`)
  }
  const strokeRect = (x: number, y: number, w: number, h: number, gray = 0.84) => {
    commands.push(`${gray} G 0.7 w ${x} ${y} ${w} ${h} re S`)
  }

  // Header
  fillRect(0, PAGE_H - 112, PAGE_W, 112, 0.545, 0.361, 0.965)
  text(MARGIN_X, PAGE_H - 50, '39Production', 20, 'F2')
  text(MARGIN_X, PAGE_H - 70, 'Creative Production & Digital Services', 8.5, 'F1')
  text(PAGE_W - MARGIN_X - 118, PAGE_H - 49, documentPrefix(doc.type), 9, 'F2')
  text(PAGE_W - MARGIN_X - 118, PAGE_H - 66, doc.number, 8.5, 'F1')
  text(PAGE_W - MARGIN_X - 118, PAGE_H - 82, String(doc.date || '').slice(0, 19), 7.5, 'F1')

  let y = PAGE_H - 150
  text(MARGIN_X, y, doc.type.toUpperCase(), 8, 'F2')
  y -= 24
  const titleLines = wrapText(doc.title, 68)
  for (const l of titleLines) {
    text(MARGIN_X, y, l, 16, 'F2')
    y -= 20
  }

  // Meta box
  y -= 8
  const boxH = 66
  strokeRect(MARGIN_X, y - boxH + 8, CONTENT_W)
  text(MARGIN_X + 14, y - 12, 'RELATED TO', 7, 'F2')
  text(MARGIN_X + 14, y - 29, wrapText(doc.related_to || '-', 40)[0], 9)
  text(MARGIN_X + 285, y - 12, 'STATUS', 7, 'F2')
  text(MARGIN_X + 285, y - 29, doc.status === 'Active' ? 'FINAL' : String(doc.status || 'FINAL').toUpperCase(), 9, 'F2')
  y -= boxH + 10

  // Detail table
  const rowH = 27
  let rows = details
  if (!rows.length) rows = [{ label: 'Description', value: doc.content || '39Production business document.' }]
  const maxRows = Math.max(1, Math.floor((y - BOTTOM - 34) / rowH))
  rows = rows.slice(pageIndex * maxRows, (pageIndex + 1) * maxRows)

  fillRect(MARGIN_X, y - rowH + 8, CONTENT_W, rowH, 0.95, 0.95, 0.97)
  text(MARGIN_X + 12, y - 10, 'DETAIL', 7.5, 'F2')
  text(MARGIN_X + 176, y - 10, 'INFORMATION', 7.5, 'F2')
  y -= rowH

  for (const row of rows) {
    const valueLines = wrapText(row.value, 55)
    const needed = Math.max(1, Math.min(3, valueLines.length)) * 12 + 13
    strokeRect(MARGIN_X, y - needed + 8, CONTENT_W, needed, 0.9)
    if (row.label) text(MARGIN_X + 12, y - 14, row.label, 8, 'F2')
    valueLines.slice(0, 3).forEach((v, i) => text(MARGIN_X + 176, y - 14 - i * 11, v, 8.5))
    y -= needed
  }

  // Footer
  line(MARGIN_X, BOTTOM + 22, PAGE_W - MARGIN_X, BOTTOM + 22, 0.5)
  text(MARGIN_X, BOTTOM + 8, 'Dokumen ini diterbitkan oleh sistem 39Production.', 7, 'F1')
  text(PAGE_W - MARGIN_X - 72, BOTTOM + 8, `Page ${pageIndex + 1}/${totalPages}`, 7, 'F1')
  return commands.join('\n')
}

export function buildBusinessDocumentPdf(doc: BusinessPdfDocument) {
  const details = parseDetails(doc.content || '')
  const rowsPerPage = 19
  const totalPages = Math.max(1, Math.ceil(details.length / rowsPerPage))
  const objects: string[] = []
  const add = (body: string) => {
    objects.push(body)
    return objects.length
  }

  // 1 catalog, 2 pages, 3 font regular, 4 font bold
  add('<< /Type /Catalog /Pages 2 0 R >>')
  const pageObjectIds: number[] = []
  const contentObjectIds: number[] = []
  // reserve pages object
  objects.push('')
  const fontRegular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const fontBold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

  for (let i = 0; i < totalPages; i++) {
    const content = makePage(doc, i, totalPages, details)
    const contentId = add(`<< /Length ${latin1(content).length} >>\nstream\n${content}\nendstream`)
    contentObjectIds.push(contentId)
    const pageId = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`)
    pageObjectIds.push(pageId)
  }
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`

  let pdf = '%PDF-1.4\n%âãÏÓ\n'
  const offsets: number[] = [0]
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  // Convert the PDF string to bytes without UTF-8 expansion.
  const bytes = new Uint8Array(pdf.length)
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
  return new Blob([bytes], { type: 'application/pdf' })
}

export function downloadBusinessDocumentPdf(doc: BusinessPdfDocument) {
  const blob = buildBusinessDocumentPdf(doc)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${doc.number || '39Production-Document'}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
