// PROTOTYPE (quiet atlas) — throwaway. The candidate colour sets, each one named set of colours by
// job, and the contrast and colour-blindness checks run on them. Run `node <this file>` to print
// the checks; the prototype page shows the same numbers live.

export interface Shades {
  name: string
  ink: string // text and every control
  inkMuted: string // secondary text
  paper: string // page and panels
  land: string
  landEdge: string
  sea: string
  territory: string
  found: string
  foundTint: string // the new-find pulse
  missed: string
  ochre: string // Unfound Highlight fill
  ochreInk: string // "New best" badge text
  ochreWash: string // "New best" badge fill
}

export const shadeSets: Record<string, Shades> = {
  chart: {
    name: 'Chart room (cool)',
    ink: '#1c2530',
    inkMuted: '#59636e',
    paper: '#fbf9f4',
    land: '#f3efe6',
    landEdge: '#a59f94',
    sea: '#d3e2ea',
    territory: '#e2ddd2',
    found: '#2a6d70',
    foundTint: '#9ccfd0',
    missed: '#cf6a36',
    ochre: '#dca838',
    ochreInk: '#6b4a0c',
    ochreWash: '#f7e9c4',
  },
  atlas: {
    name: 'Old atlas (warm)',
    ink: '#2b2620',
    inkMuted: '#675d51',
    paper: '#f9f4ea',
    land: '#f2ebdb',
    landEdge: '#a8997f',
    sea: '#cfdde3',
    territory: '#e4dac6',
    found: '#326f66',
    foundTint: '#a7d2c8',
    missed: '#c8662f',
    ochre: '#d09c2c',
    ochreInk: '#664610',
    ochreWash: '#f3e3bb',
  },
  strong: {
    name: 'Strong (more contrast)',
    ink: '#121820',
    inkMuted: '#4f5966',
    paper: '#fcfbf8',
    land: '#f4f1ea',
    landEdge: '#8f979f',
    sea: '#cfe0ec',
    territory: '#dedbd3',
    found: '#1f6a6c',
    foundTint: '#8ecfcc',
    missed: '#d4682f',
    ochre: '#e3a92a',
    ochreInk: '#6a4708',
    ochreWash: '#fbe8b8',
  },
}

export interface Check {
  label: string
  value: string
  pass: boolean | null // null: informational only
}

type Rgb = [number, number, number]

function rgbOf(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toLinear = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c: number) => {
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, s)) * 255)
}

function luminance(hex: string) {
  const [r, g, b] = rgbOf(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Machado, Oliveira & Fernandes (2009), full severity, applied in linear RGB.
const cvdMatrices: Record<string, number[][]> = {
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
}

export function simulate(hex: string, kind: string): string {
  const lin = rgbOf(hex).map(toLinear)
  const m = cvdMatrices[kind]
  const out = m.map((row) => fromLinear(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]))
  return '#' + out.map((c) => c.toString(16).padStart(2, '0')).join('')
}

function lab(hex: string): Rgb {
  const [r, g, b] = rgbOf(hex).map(toLinear)
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

// CIEDE2000 colour difference. Around 2 is just noticeable; above about 20 reads as clearly different.
export function deltaE(a: string, b: string) {
  const [L1, a1, b1] = lab(a)
  const [L2, a2, b2] = lab(b)
  const rad = Math.PI / 180
  const C1 = Math.hypot(a1, b1)
  const C2 = Math.hypot(a2, b2)
  const Cm = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)
  const C1p = Math.hypot(a1p, b1)
  const C2p = Math.hypot(a2p, b2)
  const h = (bb: number, aa: number) => {
    const v = Math.atan2(bb, aa) / rad
    return v < 0 ? v + 360 : v
  }
  const h1p = h(b1, a1p)
  const h2p = h(b2, a2p)
  const dLp = L2 - L1
  const dCp = C2p - C1p
  let dhp = h2p - h1p
  if (C1p * C2p === 0) dhp = 0
  else if (dhp > 180) dhp -= 360
  else if (dhp < -180) dhp += 360
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad)
  const Lm = (L1 + L2) / 2
  const Cmp = (C1p + C2p) / 2
  let hmp = h1p + h2p
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hmp += h1p + h2p < 360 ? 360 : -360
    hmp /= 2
  }
  const T =
    1 -
    0.17 * Math.cos((hmp - 30) * rad) +
    0.24 * Math.cos(2 * hmp * rad) +
    0.32 * Math.cos((3 * hmp + 6) * rad) -
    0.2 * Math.cos((4 * hmp - 63) * rad)
  const dTheta = 30 * Math.exp(-(((hmp - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2)
  const Sc = 1 + 0.045 * Cmp
  const Sh = 1 + 0.015 * Cmp * T
  const Rt = -Math.sin(2 * dTheta * rad) * Rc
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh),
  )
}

const ratio = (label: string, fg: string, bg: string, min: number | null): Check => {
  const r = contrast(fg, bg)
  return { label, value: `${r.toFixed(1)}:1`, pass: min === null ? null : r >= min }
}

// The smallest difference between two colours across normal vision and the three colour blindnesses.
const apart = (label: string, a: string, b: string, min: number): Check => {
  const kinds = ['normal', 'deutan', 'protan', 'tritan']
  const values = kinds.map((k) =>
    k === 'normal' ? deltaE(a, b) : deltaE(simulate(a, k), simulate(b, k)),
  )
  return {
    label,
    value: values.map((v, i) => `${kinds[i][0].toUpperCase()}${v.toFixed(0)}`).join(' '),
    pass: Math.min(...values) >= min,
  }
}

// What the Frosted panel's 72% paper looks like over a map colour, ignoring the blur.
function frosted(paper: string, under: string) {
  const p = rgbOf(paper)
  const u = rgbOf(under)
  return '#' + p.map((c, i) => Math.round(0.72 * c + 0.28 * u[i]).toString(16).padStart(2, '0')).join('')
}

export function checks(s: Shades): Check[] {
  return [
    ratio('Muted text, frosted over Found (4.5)', s.inkMuted, frosted(s.paper, s.found), 4.5),
    ratio('Muted text, frosted over Missed (4.5)', s.inkMuted, frosted(s.paper, s.missed), 4.5),
    ratio('Muted text, frosted over Ochre (4.5)', s.inkMuted, frosted(s.paper, s.ochre), 4.5),
    ratio('Ink on paper (text, AA 4.5)', s.ink, s.paper, 4.5),
    ratio('Muted text on paper (AA 4.5)', s.inkMuted, s.paper, 4.5),
    ratio('Paper on ink button (AA 4.5)', s.paper, s.ink, 4.5),
    ratio('Badge text on wash (AA 4.5)', s.ochreInk, s.ochreWash, 4.5),
    ratio('Ink outline on land (focus, 3)', s.ink, s.land, 3),
    ratio('Found vs land (3)', s.found, s.land, 3),
    ratio('Missed vs land (3)', s.missed, s.land, 3),
    ratio('Found vs sea', s.found, s.sea, null),
    ratio('Ochre vs land', s.ochre, s.land, null),
    apart('Found ↔ Missed ΔE (N D P T ≥ 20)', s.found, s.missed, 20),
    apart('Found ↔ Ochre ΔE (≥ 20)', s.found, s.ochre, 20),
    apart('Ochre ↔ land ΔE (≥ 15)', s.ochre, s.land, 15),
    apart('Found ↔ sea ΔE (≥ 15)', s.found, s.sea, 15),
  ]
}

// Prints every set's checks when run directly with node.
const node = (globalThis as { process?: { argv: string[] } }).process
if (node?.argv[1]?.endsWith('shades.ts')) {
  for (const s of Object.values(shadeSets)) {
    console.log(`\n${s.name}`)
    for (const c of checks(s)) {
      const mark = c.pass === null ? ' ' : c.pass ? '✓' : '✗'
      console.log(`  ${mark} ${c.label.padEnd(38)} ${c.value}`)
    }
  }
}
