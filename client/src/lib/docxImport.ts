export interface ImportedPlantDetails {
  name?: string
  botanical_name?: string
  family?: string
  plant_type?: string
  description?: string
  light?: string
  water?: string
  potting_mix?: string
  maintenance?: string
  common_pests?: string
  common_diseases?: string
  traditional_uses?: string
  propagation?: string
  safety_note?: string
  price?: string
  stock?: string
}

type DetailKey = Exclude<keyof ImportedPlantDetails, 'name' | 'price' | 'stock'>

const FIELD_DEFINITIONS: { key: DetailKey; labels: string[] }[] = [
  {
    key: 'botanical_name',
    labels: ['Botanical Name', 'Scientific Name', 'Latin Name'],
  },
  { key: 'family', labels: ['Family', 'Plant Family'] },
  {
    key: 'plant_type',
    labels: ['Plant Type', 'Plant Habit', 'Growth Habit', 'Habit'],
  },
  { key: 'description', labels: ['Description', 'Overview', 'About'] },
  {
    key: 'light',
    labels: ['Light', 'Sunlight', 'Light Requirements', 'Exposure'],
  },
  {
    key: 'water',
    labels: ['Water', 'Watering', 'Water Requirements', 'Irrigation'],
  },
  {
    key: 'potting_mix',
    labels: [
      'Potting Mix',
      'Potting Soil',
      'Growing Medium',
      'Soil',
      'Substrate',
    ],
  },
  {
    key: 'maintenance',
    labels: [
      'Maintenance',
      'Care',
      'Care Requirements',
      'Maintenance Requirements',
      'Pruning',
    ],
  },
  { key: 'common_pests', labels: ['Common Pests', 'Pests', 'Pest Issues'] },
  {
    key: 'common_diseases',
    labels: ['Common Diseases', 'Diseases', 'Disease Issues'],
  },
  {
    key: 'traditional_uses',
    labels: ['Traditional Uses', 'Uses', 'Medicinal Uses', 'Culinary Uses'],
  },
  {
    key: 'propagation',
    labels: ['Propagation', 'How to Propagate', 'Propagation Methods'],
  },
  {
    key: 'safety_note',
    labels: [
      'Food Safety Note',
      'Safety Note',
      'Safety Notes',
      'Safety',
      'Toxicity',
      'Warning',
      'Caution',
    ],
  },
]

const MULTILINE_FIELDS = new Set<DetailKey>([
  'description',
  'traditional_uses',
  'propagation',
  'safety_note',
])

const ALL_LABELS = [
  ...new Set(FIELD_DEFINITIONS.flatMap((field) => field.labels)),
].sort((a, b) => b.length - a.length)

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const NORMALIZED_LABELS = FIELD_DEFINITIONS.flatMap((field) =>
  field.labels.map((label) => ({
    key: field.key,
    label: normalizeLabel(label),
  })),
)

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + substitutionCost,
      )
    }
    previous = current
  }

  return previous[b.length]
}

function labelSimilarity(a: string, b: string): number {
  if (a === b) return 1
  const longest = Math.max(a.length, b.length)
  return longest === 0 ? 1 : 1 - editDistance(a, b) / longest
}

function matchFieldLabel(candidate: string): DetailKey | null {
  const normalized = normalizeLabel(candidate)
  if (!normalized) return null

  let bestKey: DetailKey | null = null
  let bestScore = 0

  for (const option of NORMALIZED_LABELS) {
    const score = labelSimilarity(normalized, option.label)
    if (score > bestScore) {
      bestScore = score
      bestKey = option.key
    }
  }

  return bestScore >= 0.78 ? bestKey : null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const NEXT_LABEL_PATTERN = ALL_LABELS.map(escapeRegExp).join('|')

function extractField(text: string, labels: string[]): string {
  const labelPattern = [...labels]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')
  const regex = new RegExp(
    `(?:${labelPattern})\\s*:\\s*([\\s\\S]*?)(?=\\s*(?:${NEXT_LABEL_PATTERN})\\s*:|$)`,
    'i',
  )
  return regex.exec(text)?.[1] ?? ''
}

function cleanLine(line: string): string {
  return line
    .replace(/^\s*(?:[•●▪◦·*]|-\s)\s*/u, '')
    .replace(
      /^(?:growing(?: and care)? requirements|care requirements|plant details?|plant information)$/i,
      '',
    )
    .trim()
}

function cleanValue(value: string, multiline: boolean): string {
  const lines = value
    .replace(/\r/g, '')
    .split('\n')
    .map(cleanLine)
    .filter(Boolean)

  if (lines.length === 0) return ''
  return multiline ? lines.join('\n') : lines.join(' ')
}

const INLINE_LABEL_PATTERN = new RegExp(
  `[ \\t]+(?=(?:${ALL_LABELS.map(escapeRegExp).join('|')})\\s*:)`,
  'gi',
)

function splitInlineLabels(text: string): string {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => {
      const regex = new RegExp(INLINE_LABEL_PATTERN.source, 'gi')
      let result = ''
      let cursor = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(line))) {
        const colonIndex = line.indexOf(':', match.index)
        if (colonIndex === -1) continue

        const candidate = line.slice(0, colonIndex).trim()
        if (matchFieldLabel(candidate)) continue

        result += line.slice(cursor, match.index) + '\n'
        cursor = match.index + match[0].length
      }

      return result + line.slice(cursor)
    })
    .join('\n')
}

function collectFieldBlocks(text: string): Map<DetailKey, string[]> {
  const blocks = new Map<DetailKey, string[]>()
  const lines = splitInlineLabels(text).split('\n')
  let currentKey: DetailKey | null = null

  for (const rawLine of lines) {
    const line = cleanLine(rawLine)
    if (!line) {
      if (currentKey) {
        const block = blocks.get(currentKey)
        if (block && block.at(-1) !== '') block.push('')
      }
      continue
    }

    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = matchFieldLabel(line.slice(0, colonIndex))
      if (key) {
        currentKey = key
        const value = line.slice(colonIndex + 1).trim()
        const existing = blocks.get(key)
        if (existing) existing.push(value)
        else blocks.set(key, [value])
        continue
      }
    } else if (line.length <= 60) {
      const key = matchFieldLabel(line)
      if (key) {
        currentKey = key
        if (!blocks.has(key)) blocks.set(key, [])
        continue
      }
    }

    if (currentKey) {
      blocks.get(currentKey)?.push(line)
    }
  }

  return blocks
}

function extractName(text: string): string {
  const hasBotanicalName = /botanical\s*name\s*:/i.test(text)
  const beforeBotanical = text.split(/botanical\s*name\s*:/i)[0]
  const lines = beforeBotanical
    .replace(/\r/g, '')
    .split('\n')
    .map(cleanLine)
    .filter(Boolean)

  const name = hasBotanicalName ? lines.at(-1) ?? '' : lines[0] ?? ''
  return name.replace(/^(?:plant\s+name|name)\s*:\s*/i, '').trim()
}

export function parsePlantDetails(text: string): ImportedPlantDetails {
  const details: ImportedPlantDetails = {}

  const name = extractName(text)
  if (name) details.name = name

  const blocks = collectFieldBlocks(text)
  for (const field of FIELD_DEFINITIONS) {
    let value = cleanValue(
      (blocks.get(field.key) ?? []).join('\n'),
      MULTILINE_FIELDS.has(field.key),
    )
    if (!value) {
      value = cleanValue(
        extractField(text, field.labels),
        MULTILINE_FIELDS.has(field.key),
      )
    }
    if (value) details[field.key] = value
  }

  const priceMatch = text.match(
    /(?:price|mrp)\s*:\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  )
  if (priceMatch) details.price = priceMatch[1].replace(/,/g, '')

  const stockMatch = text.match(/(?:stock|quantity|available)\s*:\s*(\d+)/i)
  if (stockMatch) details.stock = stockMatch[1]

  return details
}

export async function extractPlantDetailsFromDocx(
  file: File,
): Promise<ImportedPlantDetails> {
  const arrayBuffer = await file.arrayBuffer()
  const mammoth = (await import('mammoth')).default
  const result = await mammoth.extractRawText({ arrayBuffer })
  return parsePlantDetails(result.value)
}
