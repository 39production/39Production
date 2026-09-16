import logo39Production from '@/assets/logo-39production.png'

export interface BusinessPdfDocument {
  number: string
  type: string
  title: string
  related_to?: string | null
  date?: string | null
  status?: string | null
  content?: string | null
}

interface PdfColor {
  r: number
  g: number
  b: number
}

interface LogoImage {
  bytes: Uint8Array
  width: number
  height: number
}

interface DetailRow {
  label: string
  value: string
}

type DocumentKind =
  | 'invoice'
  | 'receipt'
  | 'confirmation'
  | 'agreement'
  | 'general'

const PAGE_W = 595.28
const PAGE_H = 841.89

const MARGIN_X = 52
const MARGIN_TOP = 42
const MARGIN_BOTTOM = 52

const CONTENT_W =
  PAGE_W - MARGIN_X * 2

const COLORS = {
  black: {
    r: 0.055,
    g: 0.055,
    b: 0.075,
  },

  dark: {
    r: 0.16,
    g: 0.16,
    b: 0.19,
  },

  gray: {
    r: 0.42,
    g: 0.42,
    b: 0.46,
  },

  lightGray: {
    r: 0.84,
    g: 0.84,
    b: 0.88,
  },

  veryLight: {
    r: 0.965,
    g: 0.965,
    b: 0.975,
  },

  white: {
    r: 1,
    g: 1,
    b: 1,
  },

  violet: {
    r: 0.545,
    g: 0.361,
    b: 0.965,
  },

  violetDark: {
    r: 0.39,
    g: 0.22,
    b: 0.76,
  },

  pink: {
    r: 0.925,
    g: 0.286,
    b: 0.6,
  },

  green: {
    r: 0.10,
    g: 0.55,
    b: 0.32,
  },

  amber: {
    r: 0.72,
    g: 0.49,
    b: 0.08,
  },

  red: {
    r: 0.74,
    g: 0.20,
    b: 0.22,
  },
} satisfies Record<string, PdfColor>

function colorRgb(color: PdfColor) {
  return `${color.r.toFixed(3)} ${color.g.toFixed(
    3,
  )} ${color.b.toFixed(3)}`
}

function latin1(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\xFF]/g, '?')
}

function escapePdfText(value: string) {
  return latin1(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function encodeAscii(value: string) {
  return new TextEncoder().encode(
    latin1(value),
  )
}

function concatBytes(
  chunks: Uint8Array[],
) {
  const total = chunks.reduce(
    (sum, chunk) =>
      sum + chunk.length,
    0,
  )

  const result =
    new Uint8Array(total)

  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

function wrapText(
  text: string,
  maxChars: number,
) {
  const paragraphs = text
    .replace(/\r/g, '')
    .split('\n')

  const lines: string[] = []

  for (const paragraph of paragraphs) {
    const trimmed =
      paragraph.trim()

    if (!trimmed) {
      lines.push('')
      continue
    }

    const words = trimmed
      .split(/\s+/)
      .filter(Boolean)

    let current = ''

    for (const word of words) {
      const candidate = current
        ? `${current} ${word}`
        : word

      if (
        candidate.length <=
        maxChars
      ) {
        current = candidate
      } else {
        if (current) {
          lines.push(current)
        }

        current = word
      }
    }

    if (current) {
      lines.push(current)
    }
  }

  return lines.length
    ? lines
    : ['']
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '-'
  }

  const date = new Date(
    value.includes('T')
      ? value
      : `${value}T00:00:00`,
  )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
}

function formatShortDate(
  value?: string | null,
) {
  if (!value) {
    return '-'
  }

  const date = new Date(
    value.includes('T')
      ? value
      : `${value}T00:00:00`,
  )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(date)
}

function parseDetails(
  content: string,
): DetailRow[] {
  return content
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator =
        line.indexOf(':')

      if (separator > 0) {
        return {
          label: line
            .slice(0, separator)
            .trim(),
          value: line
            .slice(separator + 1)
            .trim(),
        }
      }

      return {
        label: '',
        value: line,
      }
    })
}

function detectDocumentKind(
  type: string,
): DocumentKind {
  const normalized =
    type
      .trim()
      .toLowerCase()

  if (normalized === 'invoice') {
    return 'invoice'
  }

  if (normalized === 'receipt') {
    return 'receipt'
  }

  if (
    normalized ===
    'order confirmation' ||
    normalized.includes(
      'confirmation',
    )
  ) {
    return 'confirmation'
  }

  if (
    normalized.includes(
      'agreement',
    ) ||
    normalized.includes(
      'contract',
    )
  ) {
    return 'agreement'
  }

  return 'general'
}

function documentPrefix(
  type: string,
) {
  const normalized =
    type
      .trim()
      .toLowerCase()

  if (normalized === 'invoice') {
    return 'INV'
  }

  if (normalized === 'receipt') {
    return 'REC'
  }

  if (
    normalized ===
    'order confirmation'
  ) {
    return 'ORD'
  }

  if (
    normalized.includes(
      'quotation',
    ) ||
    normalized.includes('quote')
  ) {
    return 'QTN'
  }

  if (
    normalized.includes(
      'agreement',
    ) ||
    normalized.includes(
      'contract',
    )
  ) {
    return 'AGR'
  }

  return 'DOC'
}

function normalizeStatus(
  status?: string | null,
) {
  if (!status) {
    return 'FINAL'
  }

  if (
    status
      .trim()
      .toLowerCase() === 'active'
  ) {
    return 'FINAL'
  }

  return status
    .trim()
    .toUpperCase()
}

function statusColor(
  status?: string | null,
): PdfColor {
  const normalized =
    String(status || '')
      .trim()
      .toLowerCase()

  if (
    normalized === 'active' ||
    normalized === 'final' ||
    normalized === 'paid' ||
    normalized === 'completed' ||
    normalized === 'approved'
  ) {
    return COLORS.green
  }

  if (
    normalized === 'pending' ||
    normalized === 'draft'
  ) {
    return COLORS.amber
  }

  if (
    normalized === 'cancelled' ||
    normalized === 'rejected' ||
    normalized === 'expired'
  ) {
    return COLORS.red
  }

  return COLORS.violet
}

function numberFromMoney(
  value: string,
) {
  const match = value.match(
    /(?:Rp|IDR)\s*([\d.,]+)/i,
  )

  if (!match) {
    return null
  }

  const numeric =
    Number(
      match[1]
        .replace(/\./g, '')
        .replace(/,/g, ''),
    )

  return Number.isFinite(numeric)
    ? numeric
    : null
}

function calculateMoneyTotal(
  details: DetailRow[],
) {
  let total = 0

  for (const row of details) {
    const numeric =
      numberFromMoney(
        row.value,
      )

    if (
      numeric !== null
    ) {
      total += numeric
    }
  }

  return total
}

function formatRupiah(
  value: number,
) {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function getMeaningfulClient(
  doc: BusinessPdfDocument,
) {
  const value =
    doc.related_to?.trim()

  if (value) {
    return value
  }

  return '39Production Business Client'
}

function getDetailByPossibleLabel(
  details: DetailRow[],
  labels: string[],
) {
  const targetLabels =
    labels.map((label) =>
      label
        .trim()
        .toLowerCase(),
    )

  return (
    details.find((item) =>
      targetLabels.includes(
        item.label
          .trim()
          .toLowerCase(),
      ),
    ) || null
  )
}

function uint16(
  bytes: Uint8Array,
  offset: number,
) {
  return (
    (bytes[offset] << 8) |
    bytes[offset + 1]
  )
}

function readJpegDimensions(
  bytes: Uint8Array,
) {
  if (
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8
  ) {
    return {
      width: 1,
      height: 1,
    }
  }

  let offset = 2

  while (
    offset + 9 <
    bytes.length
  ) {
    if (
      bytes[offset] !==
      0xff
    ) {
      offset += 1
      continue
    }

    const marker =
      bytes[offset + 1]

    offset += 2

    if (
      marker === 0xd8 ||
      marker === 0xd9
    ) {
      continue
    }

    if (
      offset + 2 >
      bytes.length
    ) {
      break
    }

    const segmentLength =
      uint16(
        bytes,
        offset,
      )

    if (
      segmentLength < 2 ||
      offset +
      segmentLength >
      bytes.length
    ) {
      break
    }

    const isSof =
      marker >= 0xc0 &&
      marker <= 0xc3

    if (
      isSof ||
      (marker >= 0xc5 &&
        marker <= 0xc7) ||
      (marker >= 0xc9 &&
        marker <= 0xcb) ||
      (marker >= 0xcd &&
        marker <= 0xcf)
    ) {
      return {
        width: uint16(
          bytes,
          offset + 5,
        ),
        height: uint16(
          bytes,
          offset + 3,
        ),
      }
    }

    offset += segmentLength
  }

  return {
    width: 1,
    height: 1,
  }
}

async function loadLogo(): Promise<LogoImage> {
  const response =
    await fetch(
      logo39Production,
    )

  if (!response.ok) {
    throw new Error(
      'Failed to load the 39Production logo.',
    )
  }

  const blob =
    await response.blob()

  const bitmap =
    await createImageBitmap(
      blob,
    )

  const maxDimension = 900

  const scale =
    Math.min(
      1,
      maxDimension /
      Math.max(
        bitmap.width,
        bitmap.height,
      ),
    )

  const width = Math.max(
    1,
    Math.round(
      bitmap.width * scale,
    ),
  )

  const height = Math.max(
    1,
    Math.round(
      bitmap.height * scale,
    ),
  )

  const canvas =
    document.createElement(
      'canvas',
    )

  canvas.width = width
  canvas.height = height

  const context =
    canvas.getContext('2d')

  if (!context) {
    bitmap.close()

    throw new Error(
      'Failed to process the 39Production logo.',
    )
  }

  /*
   * The PNG may be transparent.
   * White is deliberately used because
   * official documents have a white
   * letterhead.
   */

  context.fillStyle =
    '#ffffff'

  context.fillRect(
    0,
    0,
    width,
    height,
  )

  context.imageSmoothingEnabled =
    true

  context.imageSmoothingQuality =
    'high'

  context.drawImage(
    bitmap,
    0,
    0,
    width,
    height,
  )

  bitmap.close()

  const jpeg =
    await new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(
          resolve,
          'image/jpeg',
          0.95,
        )
      },
    )

  if (!jpeg) {
    throw new Error(
      'Failed to convert the 39Production logo.',
    )
  }

  const buffer =
    await jpeg.arrayBuffer()

  const bytes =
    new Uint8Array(buffer)

  const dimensions =
    readJpegDimensions(
      bytes,
    )

  return {
    bytes,
    width:
      dimensions.width,
    height:
      dimensions.height,
  }
}

interface PdfCommandBuilder {
  text: (
    x: number,
    y: number,
    value: string,
    size?: number,
    font?: 'F1' | 'F2',
    color?: PdfColor,
  ) => void

  line: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width?: number,
    color?: PdfColor,
  ) => void

  fillRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    color?: PdfColor,
  ) => void

  strokeRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    color?: PdfColor,
    widthLine?: number,
  ) => void

  image: (
    imageId: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void
}

function createCommandBuilder(
  commands: string[],
): PdfCommandBuilder {
  return {
    text(
      x,
      y,
      value,
      size = 9,
      font = 'F1',
      color = COLORS.black,
    ) {
      commands.push(
        `${colorRgb(
          color,
        )} rg BT /${font} ${size} Tf ${x.toFixed(
          2,
        )} ${y.toFixed(
          2,
        )} Td (${escapePdfText(
          value,
        )}) Tj ET`,
      )
    },

    line(
      x1,
      y1,
      x2,
      y2,
      width = 0.7,
      color = COLORS.lightGray,
    ) {
      commands.push(
        `${colorRgb(
          color,
        )} RG ${width} w ${x1.toFixed(
          2,
        )} ${y1.toFixed(
          2,
        )} m ${x2.toFixed(
          2,
        )} ${y2.toFixed(
          2,
        )} l S`,
      )
    },

    fillRect(
      x,
      y,
      width,
      height,
      color = COLORS.veryLight,
    ) {
      commands.push(
        `${colorRgb(
          color,
        )} rg ${x.toFixed(
          2,
        )} ${y.toFixed(
          2,
        )} ${width.toFixed(
          2,
        )} ${height.toFixed(
          2,
        )} re f`,
      )
    },

    strokeRect(
      x,
      y,
      width,
      height,
      color = COLORS.lightGray,
      widthLine = 0.7,
    ) {
      commands.push(
        `${colorRgb(
          color,
        )} RG ${widthLine} w ${x.toFixed(
          2,
        )} ${y.toFixed(
          2,
        )} ${width.toFixed(
          2,
        )} ${height.toFixed(
          2,
        )} re S`,
      )
    },

    image(
      imageId,
      x,
      y,
      width,
      height,
    ) {
      commands.push(
        `q ${width.toFixed(
          2,
        )} 0 0 ${height.toFixed(
          2,
        )} ${x.toFixed(
          2,
        )} ${y.toFixed(
          2,
        )} cm /Im${imageId} Do Q`,
      )
    },
  }
}

function makeLetterhead(
  builder: PdfCommandBuilder,
  logo: LogoImage,
  logoObjectId: number,
) {
  const logoHeight = 46

  const logoWidth =
    (logo.width /
      Math.max(1, logo.height)) *
    logoHeight

  const logoX =
    MARGIN_X

  const logoY =
    PAGE_H -
    MARGIN_TOP -
    logoHeight

  builder.image(
    logoObjectId,
    logoX,
    logoY,
    logoWidth,
    logoHeight,
  )

  const companyX =
    logoX + logoWidth + 12

  builder.text(
    companyX,
    PAGE_H -
    MARGIN_TOP -
    15,
    '39PRODUCTION',
    14,
    'F2',
    COLORS.black,
  )

  builder.text(
    companyX,
    PAGE_H -
    MARGIN_TOP -
    28,
    'Creative Technology Studio',
    7.2,
    'F1',
    COLORS.gray,
  )

  builder.text(
    companyX,
    PAGE_H -
    MARGIN_TOP -
    40,
    'SanKyuu Production',
    6.8,
    'F1',
    COLORS.gray,
  )

  /*
   * Official document accent.
   */

  const ruleY =
    PAGE_H -
    MARGIN_TOP -
    60

  builder.fillRect(
    MARGIN_X,
    ruleY,
    CONTENT_W,
    2,
    COLORS.violet,
  )

  builder.fillRect(
    MARGIN_X + 115,
    ruleY,
    70,
    2,
    COLORS.pink,
  )

  return ruleY
}

function drawDocumentMeta(
  builder: PdfCommandBuilder,
  doc: BusinessPdfDocument,
  topY: number,
) {
  const boxHeight = 82
  const boxY =
    topY - boxHeight

  builder.fillRect(
    MARGIN_X,
    boxY,
    CONTENT_W,
    boxHeight,
    COLORS.veryLight,
  )

  builder.strokeRect(
    MARGIN_X,
    boxY,
    CONTENT_W,
    boxHeight,
    COLORS.lightGray,
    0.7,
  )

  const col1 =
    MARGIN_X + 14

  const col2 =
    MARGIN_X + 235

  const col3 =
    MARGIN_X + 405

  builder.text(
    col1,
    topY - 17,
    'NOMOR DOKUMEN',
    6.7,
    'F2',
    COLORS.gray,
  )

  builder.text(
    col1,
    topY - 35,
    doc.number,
    8.7,
    'F2',
    COLORS.black,
  )

  builder.text(
    col1,
    topY - 55,
    'TANGGAL',
    6.7,
    'F2',
    COLORS.gray,
  )

  builder.text(
    col1,
    topY - 70,
    formatShortDate(
      doc.date,
    ),
    8,
    'F1',
    COLORS.dark,
  )

  builder.line(
    MARGIN_X + 205,
    boxY + 12,
    MARGIN_X + 205,
    topY - 12,
    0.5,
    COLORS.lightGray,
  )

  builder.text(
    col2,
    topY - 17,
    'JENIS DOKUMEN',
    6.7,
    'F2',
    COLORS.gray,
  )

  builder.text(
    col2,
    topY - 35,
    doc.type.toUpperCase(),
    8.3,
    'F2',
    COLORS.black,
  )

  builder.line(
    MARGIN_X + 370,
    boxY + 12,
    MARGIN_X + 370,
    topY - 12,
    0.5,
    COLORS.lightGray,
  )

  builder.text(
    col3,
    topY - 17,
    'STATUS',
    6.7,
    'F2',
    COLORS.gray,
  )

  builder.text(
    col3,
    topY - 35,
    normalizeStatus(
      doc.status,
    ),
    8.3,
    'F2',
    statusColor(
      doc.status,
    ),
  )

  return boxY
}

function drawRecipient(
  builder: PdfCommandBuilder,
  doc: BusinessPdfDocument,
  topY: number,
) {
  builder.text(
    MARGIN_X,
    topY,
    'KEPADA YTH.',
    7,
    'F2',
    COLORS.gray,
  )

  const recipient =
    getMeaningfulClient(
      doc,
    )

  const recipientLines =
    wrapText(
      recipient,
      62,
    )

  let y =
    topY - 18

  for (
    const line of recipientLines.slice(
      0,
      3,
    )
  ) {
    builder.text(
      MARGIN_X,
      y,
      line,
      9.4,
      'F2',
      COLORS.black,
    )

    y -= 13
  }

  return y
}

function drawSubject(
  builder: PdfCommandBuilder,
  doc: BusinessPdfDocument,
  topY: number,
) {
  builder.text(
    MARGIN_X,
    topY,
    'PERIHAL',
    7,
    'F2',
    COLORS.gray,
  )

  builder.text(
    MARGIN_X + 72,
    topY,
    doc.title,
    8.8,
    'F2',
    COLORS.black,
  )

  return topY - 24
}

function drawFormalBody(
  builder: PdfCommandBuilder,
  details: DetailRow[],
  topY: number,
  bottomY: number,
) {
  let y = topY

  builder.text(
    MARGIN_X,
    y,
    'ISI DOKUMEN',
    7,
    'F2',
    COLORS.gray,
  )

  y -= 18

  if (!details.length) {
    details = [
      {
        label: '',
        value:
          'Dokumen resmi 39Production.',
      },
    ]
  }

  for (const row of details) {
    if (y <= bottomY) {
      break
    }

    if (row.label) {
      builder.text(
        MARGIN_X,
        y,
        row.label,
        8.2,
        'F2',
        COLORS.black,
      )

      y -= 14
    }

    const lines =
      wrapText(
        row.value,
        87,
      )

    for (const line of lines) {
      if (y <= bottomY) {
        break
      }

      builder.text(
        MARGIN_X,
        y,
        line,
        8.7,
        'F1',
        COLORS.dark,
      )

      y -= 12
    }

    y -= 6
  }

  return y
}

function drawDetailTable(
  builder: PdfCommandBuilder,
  details: DetailRow[],
  topY: number,
  bottomY: number,
) {
  let y = topY

  builder.text(
    MARGIN_X,
    y,
    'RINCIAN',
    7,
    'F2',
    COLORS.gray,
  )

  y -= 16

  const labelWidth = 158

  builder.fillRect(
    MARGIN_X,
    y - 23,
    CONTENT_W,
    23,
    COLORS.black,
  )

  builder.text(
    MARGIN_X + 12,
    y - 15,
    'ITEM',
    7,
    'F2',
    COLORS.white,
  )

  builder.text(
    MARGIN_X +
    labelWidth +
    12,
    y - 15,
    'KETERANGAN',
    7,
    'F2',
    COLORS.white,
  )

  y -= 23

  const source =
    details.length
      ? details
      : [
        {
          label: 'Description',
          value:
            '39Production business document.',
        },
      ]

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    if (y <= bottomY) {
      break
    }

    const row =
      source[index]

    const valueLines =
      wrapText(
        row.value,
        60,
      ).slice(0, 4)

    const rowHeight =
      Math.max(
        34,
        valueLines.length *
        12 +
        16,
      )

    if (index % 2 === 0) {
      builder.fillRect(
        MARGIN_X,
        y - rowHeight,
        CONTENT_W,
        rowHeight,
        {
          r: 0.99,
          g: 0.99,
          b: 0.995,
        },
      )
    }

    builder.strokeRect(
      MARGIN_X,
      y - rowHeight,
      CONTENT_W,
      rowHeight,
      COLORS.lightGray,
      0.5,
    )

    builder.line(
      MARGIN_X +
      labelWidth,
      y,
      MARGIN_X +
      labelWidth,
      y - rowHeight,
      0.5,
      COLORS.lightGray,
    )

    const labelLines =
      wrapText(
        row.label ||
        'Description',
        25,
      ).slice(0, 2)

    labelLines.forEach(
      (
        line,
        lineIndex,
      ) => {
        builder.text(
          MARGIN_X + 12,
          y -
          15 -
          lineIndex *
          11,
          line,
          8,
          'F2',
          COLORS.black,
        )
      },
    )

    valueLines.forEach(
      (
        line,
        lineIndex,
      ) => {
        builder.text(
          MARGIN_X +
          labelWidth +
          12,
          y -
          15 -
          lineIndex *
          11,
          line,
          8.2,
          'F1',
          COLORS.dark,
        )
      },
    )

    y -= rowHeight
  }

  return y
}

function drawFinancialSummary(
  builder: PdfCommandBuilder,
  details: DetailRow[],
  doc: BusinessPdfDocument,
  topY: number,
) {
  let y = topY - 18

  const total =
    calculateMoneyTotal(
      details,
    )

  const summaryWidth = 230
  const summaryHeight = 94

  const summaryX =
    PAGE_W -
    MARGIN_X -
    summaryWidth

  builder.fillRect(
    summaryX,
    y - summaryHeight,
    summaryWidth,
    summaryHeight,
    COLORS.veryLight,
  )

  builder.strokeRect(
    summaryX,
    y - summaryHeight,
    summaryWidth,
    summaryHeight,
    COLORS.lightGray,
    0.7,
  )

  builder.text(
    summaryX + 14,
    y - 18,
    'RINGKASAN PEMBAYARAN',
    7,
    'F2',
    COLORS.gray,
  )

  builder.line(
    summaryX + 14,
    y - 27,
    summaryX +
    summaryWidth -
    14,
    y - 27,
    0.5,
    COLORS.lightGray,
  )

  builder.text(
    summaryX + 14,
    y - 46,
    'Total',
    8.2,
    'F1',
    COLORS.dark,
  )

  const totalLabel =
    total > 0
      ? formatRupiah(
        total,
      )
      : '-'

  builder.text(
    summaryX +
    summaryWidth -
    90,
    y - 46,
    totalLabel,
    10,
    'F2',
    COLORS.black,
  )

  builder.text(
    summaryX + 14,
    y - 67,
    'Status Pembayaran',
    8,
    'F1',
    COLORS.dark,
  )

  builder.text(
    summaryX +
    summaryWidth -
    62,
    y - 67,
    normalizeStatus(
      doc.status,
    ),
    8,
    'F2',
    statusColor(
      doc.status,
    ),
  )

  return y - summaryHeight
}

function drawNotes(
  builder: PdfCommandBuilder,
  topY: number,
) {
  let y = topY - 20

  builder.text(
    MARGIN_X,
    y,
    'CATATAN',
    7,
    'F2',
    COLORS.gray,
  )

  y -= 16

  const notes = [
    'Dokumen ini diterbitkan secara elektronik oleh 39Production.',
    'Dokumen ini merupakan dokumen resmi dan dapat disimpan untuk keperluan administrasi.',
    'Apabila terdapat ketidaksesuaian data, harap segera menghubungi 39Production.',
  ]

  for (
    const note of notes
  ) {
    builder.text(
      MARGIN_X,
      y,
      '•',
      8,
      'F2',
      COLORS.violet,
    )

    const lines =
      wrapText(
        note,
        88,
      )

    lines.forEach(
      (
        line,
        lineIndex,
      ) => {
        builder.text(
          MARGIN_X + 12,
          y -
          lineIndex *
          10,
          line,
          7.3,
          'F1',
          COLORS.gray,
        )
      },
    )

    y -=
      lines.length *
      10 +
      6
  }

  return y
}

function drawSignature(
  builder: PdfCommandBuilder,
) {
  const baseY =
    MARGIN_BOTTOM + 92

  const signatureWidth = 155

  const signatureX =
    PAGE_W -
    MARGIN_X -
    signatureWidth

  builder.text(
    signatureX,
    baseY + 50,
    'Hormat kami,',
    8.2,
    'F1',
    COLORS.dark,
  )

  builder.text(
    signatureX,
    baseY + 34,
    '39Production',
    9,
    'F2',
    COLORS.black,
  )

  builder.text(
    signatureX,
    baseY + 21,
    'Creative Technology Studio',
    7.2,
    'F1',
    COLORS.gray,
  )

  builder.line(
    signatureX,
    baseY,
    signatureX +
    signatureWidth,
    baseY,
    0.8,
    COLORS.black,
  )

  builder.text(
    signatureX,
    baseY - 14,
    'Authorized Representative',
    7.2,
    'F1',
    COLORS.gray,
  )
}

function drawFooter(
  builder: PdfCommandBuilder,
  doc: BusinessPdfDocument,
  pageIndex: number,
  totalPages: number,
) {
  const footerRuleY =
    MARGIN_BOTTOM + 24

  builder.line(
    MARGIN_X,
    footerRuleY,
    PAGE_W -
    MARGIN_X,
    footerRuleY,
    0.6,
    COLORS.lightGray,
  )

  builder.text(
    MARGIN_X,
    MARGIN_BOTTOM + 9,
    '39PRODUCTION',
    7,
    'F2',
    COLORS.black,
  )

  builder.text(
    MARGIN_X + 70,
    MARGIN_BOTTOM + 9,
    'Creative Technology Studio',
    6.8,
    'F1',
    COLORS.gray,
  )

  builder.text(
    PAGE_W -
    MARGIN_X -
    82,
    MARGIN_BOTTOM + 9,
    `Page ${pageIndex + 1} of ${totalPages}`,
    6.8,
    'F1',
    COLORS.gray,
  )

  builder.text(
    MARGIN_X,
    MARGIN_BOTTOM - 6,
    `Document No. ${doc.number}`,
    6.5,
    'F1',
    COLORS.gray,
  )
}

function makePageContent(
  doc: BusinessPdfDocument,
  pageIndex: number,
  totalPages: number,
  details: DetailRow[],
  logo: LogoImage,
  logoObjectId: number,
) {
  const commands: string[] = []

  const builder =
    createCommandBuilder(
      commands,
    )

  /*
   * Header
   */

  const letterheadBottom =
    makeLetterhead(
      builder,
      logo,
      logoObjectId,
    )

  /*
   * Right header document type
   */

  const rightX =
    PAGE_W -
    MARGIN_X -
    118

  builder.text(
    rightX,
    PAGE_H -
    MARGIN_TOP -
    14,
    documentPrefix(
      doc.type,
    ),
    12,
    'F2',
    COLORS.violet,
  )

  builder.text(
    rightX,
    PAGE_H -
    MARGIN_TOP -
    29,
    doc.number,
    7.5,
    'F2',
    COLORS.black,
  )

  builder.text(
    rightX,
    PAGE_H -
    MARGIN_TOP -
    42,
    formatShortDate(
      doc.date,
    ),
    6.8,
    'F1',
    COLORS.gray,
  )

  /*
   * Main title
   */

  let y =
    letterheadBottom - 32

  builder.text(
    MARGIN_X,
    y,
    doc.type.toUpperCase(),
    7.5,
    'F2',
    COLORS.violet,
  )

  y -= 22

  const titleLines =
    wrapText(
      doc.title,
      68,
    )

  titleLines
    .slice(0, 3)
    .forEach(
      (line) => {
        builder.text(
          MARGIN_X,
          y,
          line,
          18,
          'F2',
          COLORS.black,
        )

        y -= 21
      },
    )

  /*
   * Meta block
   */

  y -= 7

  const metaBottom =
    drawDocumentMeta(
      builder,
      doc,
      y,
    )

  y =
    metaBottom - 27

  /*
   * Recipient and subject
   */

  y =
    drawRecipient(
      builder,
      doc,
      y,
    )

  y =
    drawSubject(
      builder,
      doc,
      y - 4,
    )

  y -= 3

  /*
   * Reserve footer/signature area.
   */

  const bodyBottom =
    MARGIN_BOTTOM +
    150

  const kind =
    detectDocumentKind(
      doc.type,
    )

  /*
   * Multi-page slicing.
   *
   * 8 rows is intentionally conservative
   * because this is a formal document rather
   * than a dense report.
   */

  const rowsPerPage =
    8

  const startIndex =
    pageIndex *
    rowsPerPage

  const pageDetails =
    details.length
      ? details.slice(
        startIndex,
        startIndex +
        rowsPerPage,
      )
      : []

  if (
    kind === 'invoice' ||
    kind === 'receipt' ||
    kind ===
    'confirmation'
  ) {
    y =
      drawDetailTable(
        builder,
        pageDetails,
        y,
        bodyBottom + 95,
      )

    if (
      pageIndex ===
      totalPages - 1
    ) {
      const summaryBottom =
        drawFinancialSummary(
          builder,
          details,
          doc,
          y,
        )

      drawNotes(
        builder,
        summaryBottom,
      )

      drawSignature(
        builder,
      )
    }
  } else {
    y =
      drawFormalBody(
        builder,
        pageDetails,
        y,
        bodyBottom,
      )

    if (
      pageIndex ===
      totalPages - 1
    ) {
      drawNotes(
        builder,
        y,
      )

      drawSignature(
        builder,
      )
    }
  }

  /*
   * Page footer
   */

  drawFooter(
    builder,
    doc,
    pageIndex,
    totalPages,
  )

  return commands.join('\n')
}

function makePdfObject(
  objectNumber: number,
  body: Uint8Array,
) {
  const header =
    encodeAscii(
      `${objectNumber} 0 obj\n`,
    )

  const footer =
    encodeAscii(
      `\nendobj\n`,
    )

  return concatBytes([
    header,
    body,
    footer,
  ])
}

export async function buildBusinessDocumentPdf(
  doc: BusinessPdfDocument,
) {
  const details =
    parseDetails(
      doc.content || '',
    )

  const logo =
    await loadLogo()

  const rowsPerPage =
    8

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        Math.max(
          1,
          details.length,
        ) /
        rowsPerPage,
      ),
    )

  const objects: Uint8Array[] =
    []

  /*
   * 1 Catalog
   */

  objects.push(
    encodeAscii(
      '<< /Type /Catalog /Pages 2 0 R >>',
    ),
  )

  /*
   * 2 Pages placeholder
   */

  objects.push(
    new Uint8Array(),
  )

  /*
   * 3 Regular font
   */

  objects.push(
    encodeAscii(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    ),
  )

  /*
   * 4 Bold font
   */

  objects.push(
    encodeAscii(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ),
  )

  /*
   * 5 Embedded company logo
   *
   * IMPORTANT:
   * The image bytes remain binary.
   * We do NOT convert them into a normal
   * JavaScript string.
   */

  objects.push(
    makePdfObject(
      5,
      concatBytes([
        encodeAscii(
          `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`,
        ),
        logo.bytes,
        encodeAscii(
          '\nendstream',
        ),
      ]),
    ),
  )

  /*
   * Because object 5 has already been wrapped
   * as a complete PDF object while the earlier
   * objects are still raw bodies, rebuild all
   * objects consistently from here.
   */

  const rawBodies: Uint8Array[] =
    []

  rawBodies.push(
    encodeAscii(
      '<< /Type /Catalog /Pages 2 0 R >>',
    ),
  )

  rawBodies.push(
    new Uint8Array(),
  )

  rawBodies.push(
    encodeAscii(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    ),
  )

  rawBodies.push(
    encodeAscii(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ),
  )

  rawBodies.push(
    concatBytes([
      encodeAscii(
        `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`,
      ),
      logo.bytes,
      encodeAscii(
        '\nendstream',
      ),
    ]),
  )

  const pageIds: number[] =
    []

  for (
    let pageIndex = 0;
    pageIndex < totalPages;
    pageIndex += 1
  ) {
    const content =
      makePageContent(
        doc,
        pageIndex,
        totalPages,
        details,
        logo,
        5,
      )

    const contentId =
      rawBodies.length + 1

    rawBodies.push(
      encodeAscii(
        `<< /Length ${encodeAscii(
          content,
        ).length} >>\nstream\n${content}\nendstream`,
      ),
    )

    const pageId =
      rawBodies.length + 1

    rawBodies.push(
      encodeAscii(
        `<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${PAGE_W} ${PAGE_H}]
/Resources <<
  /Font <<
    /F1 3 0 R
    /F2 4 0 R
  >>
  /XObject <<
    /Im5 5 0 R
  >>
>>
/Contents ${contentId} 0 R
>>`,
      ),
    )

    pageIds.push(
      pageId,
    )
  }

  /*
   * Fill Pages object.
   */

  rawBodies[1] =
    encodeAscii(
      `<< /Type /Pages /Kids [${pageIds
        .map(
          (id) =>
            `${id} 0 R`,
        )
        .join(
          ' ',
        )}] /Count ${pageIds.length} >>`,
    )

  /*
   * ======================================
   * Assemble complete binary-safe PDF
   * ======================================
   */

  const chunks: Uint8Array[] =
    []

  chunks.push(
    encodeAscii(
      '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n',
    ),
  )

  const offsets: number[] =
    [0]

  let currentOffset =
    chunks[0].length

  for (
    let index = 0;
    index < rawBodies.length;
    index += 1
  ) {
    const objectNumber =
      index + 1

    const object =
      makePdfObject(
        objectNumber,
        rawBodies[index],
      )

    offsets.push(
      currentOffset,
    )

    chunks.push(object)

    currentOffset +=
      object.length
  }

  const xrefOffset =
    currentOffset

  const xrefLines: string[] =
    []

  xrefLines.push(
    `xref\n0 ${rawBodies.length + 1
    }\n`,
  )

  xrefLines.push(
    '0000000000 65535 f \n',
  )

  for (
    let index = 1;
    index <
    offsets.length;
    index += 1
  ) {
    xrefLines.push(
      `${String(
        offsets[index],
      ).padStart(
        10,
        '0',
      )} 00000 n \n`,
    )
  }

  const trailer =
    `${xrefLines.join('')}trailer\n` +
    `<< /Size ${rawBodies.length + 1
    } /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`

  chunks.push(
    encodeAscii(
      trailer,
    ),
  )

  const pdfBytes =
    concatBytes(chunks)

  return new Blob(
    [pdfBytes],
    {
      type: 'application/pdf',
    },
  )
}

export async function downloadBusinessDocumentPdf(
  doc: BusinessPdfDocument,
) {
  const blob =
    await buildBusinessDocumentPdf(
      doc,
    )

  const url =
    URL.createObjectURL(blob)

  try {
    const anchor =
      document.createElement(
        'a',
      )

    anchor.href = url
    anchor.download = `${doc.number || '39Production-Document'}.pdf`

    document.body.appendChild(
      anchor,
    )

    anchor.click()

    anchor.remove()
  } finally {
    window.setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }
}
