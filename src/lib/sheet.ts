// Sign-ups and an anonymous visit count go to the team's private Google Sheet through the same Google Form
// the original prototype page used. Each row carries the headline variant (A or B) the visitor saw (assumption D2).

const FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSdC5tAdqqkSD_M4cdUw3iOmKM0Cz1QP0PCT-_bjquUA4hDfUg/formResponse'

const FIELD = {
  type: 'entry.121781733',
  variant: 'entry.1293836295',
  first_name: 'entry.1926124624',
  contact: 'entry.327341190',
  campus: 'entry.207865914',
  arrival: 'entry.1715680743',
  dishes: 'entry.223604846',
  diet: 'entry.1565493096',
  evenings: 'entry.568174952',
} as const

type Field = keyof typeof FIELD
export type Row = Partial<Record<Field, string>>

const params = new URLSearchParams(window.location.search)
/** Local previews (http) and ?nolog never write to the sheet. */
export const LIVE = window.location.protocol === 'https:' && !params.has('nolog')
/** ?test marks rows as test rows, which the sheet's summary does not count. */
const TEST = params.has('test')

function readStore(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage blocked: nothing to remember
  }
}

export type Variant = 'A' | 'B'

/** A/B headline (assumption D2): each browser gets one headline at random and keeps it; ?v=a or ?v=b forces one. */
function pickVariant(): Variant {
  const fromUrl = (params.get('v') || '').toUpperCase()
  if (fromUrl === 'A' || fromUrl === 'B') return fromUrl
  const stored = readStore('kc-variant')
  if (stored === 'A' || stored === 'B') return stored
  const chosen: Variant = Math.random() < 0.5 ? 'A' : 'B'
  writeStore('kc-variant', chosen)
  return chosen
}

export const VARIANT: Variant = pickVariant()

/** Posts one row. Google Forms answers no-cors requests opaquely, so success means "sent", not "confirmed". */
export async function sendRow(row: Row): Promise<boolean> {
  if (!LIVE) return false
  const data: Row = { ...row, variant: row.variant ?? VARIANT }
  if (data.type && TEST) data.type = `test-${data.type}`
  const body = new URLSearchParams()
  for (const key of Object.keys(data) as Field[]) {
    const value = data[key]
    if (value) body.append(FIELD[key], value)
  }
  try {
    await fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', body })
    return true
  } catch {
    return false
  }
}

let visitLogged = false

/** Visitor count (denominator for conversion): one anonymous row per browser, no personal data, no cookies. */
export function logVisit(): void {
  if (!LIVE || visitLogged) return
  visitLogged = true
  const seen = readStore('kc-visit') === '1'
  if (seen && !TEST) return
  if (!TEST) writeStore('kc-visit', '1')
  void sendRow({ type: 'visit' })
}
