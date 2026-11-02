import { describe, expect, it } from 'vitest'
import stylesheet from './index.css?raw'

// The palette check: every colour is a token declared at the stylesheet's root, and these tests read
// them from there. They hold the shades to contrast and colour-blindness margins rather than to
// exact values, so the shades can be retuned as long as the margins hold.

const rootRule = /:root\s*\{([^}]*)\}/.exec(stylesheet)
const rootBlock = rootRule?.[1] ?? ''
const tokens = new Map(
  [...rootBlock.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
)

// The value of the root token --name.
function token(name: string): string {
  const value = tokens.get(name)
  if (value === undefined) throw new Error(`The stylesheet's root declares no --${name}`)
  return value
}

describe('the palette', () => {
  it('names no hex colour or colour function outside the tokens at the root', () => {
    const outsideRoot = rootRule ? stylesheet.replace(rootRule[0], '') : stylesheet
    const colourLiterals = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/gi

    expect(outsideRoot.match(colourLiterals) ?? []).toEqual([])
  })

  it.each([
    ['ink', 'paper'],
    ['ink-muted', 'paper'],
    ['paper', 'ink'],
    ['ochre-ink', 'ochre-wash'],
  ])('keeps %s text on %s at a contrast of at least 4.5:1', (text, background) => {
    expect(contrast(colour(text), colour(background))).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps muted text on a frosted panel over a Found Country at a contrast of at least 4.5:1', () => {
    const panelOverFound = over(colour('paper'), fraction('panel-paper-share'), colour('found'))

    expect(contrast(colour('ink-muted'), panelOverFound)).toBeGreaterThanOrEqual(4.5)
  })

  it.each([
    ['found', 'land'],
    ['missed', 'land'],
    ['found', 'sea'],
    ['ink', 'land'],
  ])('keeps %s against %s at a contrast of at least 3:1', (shape, background) => {
    expect(contrast(colour(shape), colour(background))).toBeGreaterThanOrEqual(3)
  })

  const pairsKeptApart = [
    ['found', 'missed'],
    ['found', 'ochre'],
    ['ochre', 'land'],
    ['found', 'sea'],
  ]
  const visions: Vision[] = ['normal', 'deutan', 'protan', 'tritan']
  it.each(pairsKeptApart.flatMap(([a, b]) => visions.map((vision) => [a, b, vision] as const)))(
    'keeps %s and %s clearly different, at least 20 apart, under %s vision',
    (a, b, vision) => {
      const seen = (name: string) => simulate(colour(name), vision)

      expect(deltaE2000(seen(a), seen(b))).toBeGreaterThanOrEqual(20)
    },
  )
})

// sRGB channels, 0 to 255.
type Rgb = readonly [number, number, number]

function colour(name: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(token(name))?.[1]
  if (!hex) throw new Error(`--${name} is not a six-digit hex colour`)
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// A percentage token, as a fraction.
function fraction(name: string): number {
  const percent = /^(\d+(?:\.\d+)?)%$/.exec(token(name))?.[1]
  if (!percent) throw new Error(`--${name} is not a percentage`)
  return Number(percent) / 100
}

// What the top colour, at the given share of opacity, looks like over the one under it, as a
// browser blends them (ignoring a frosted panel's blur).
function over(top: Rgb, opacity: number, under: Rgb): Rgb {
  const blend = (i: number) => opacity * top[i] + (1 - opacity) * under[i]
  return [blend(0), blend(1), blend(2)]
}

// An sRGB channel as linear light, 0 to 1.
function toLinear(channel: number) {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

// WCAG 2 relative luminance, which is also CIE Y.
function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG 2 contrast ratio, from 1:1 to 21:1.
function contrast(a: Rgb, b: Rgb) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

// Machado, Oliveira & Fernandes (2009) at full severity, applied in linear RGB.
const colourBlindness = {
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
type Vision = 'normal' | keyof typeof colourBlindness

// Linear light, 0 to 1, as an sRGB channel; out-of-range light is clipped, as a screen would.
function fromLinear(channel: number) {
  const c = Math.min(1, Math.max(0, channel))
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
}

// How a colour looks with the given vision.
function simulate(rgb: Rgb, vision: Vision): Rgb {
  if (vision === 'normal') return rgb
  const linear = rgb.map(toLinear)
  const channel = (row: number[]) => fromLinear(row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2])
  const [r, g, b] = colourBlindness[vision]
  return [channel(r), channel(g), channel(b)]
}

// CIELAB, under the D65 white point.
function lab(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map(toLinear)
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = luminance(rgb)
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

// The CIEDE2000 difference between two colours. About 2 is just noticeable; above about 20 reads as
// clearly different.
function deltaE2000(colour1: Rgb, colour2: Rgb) {
  const [L1, a1, b1] = lab(colour1)
  const [L2, a2, b2] = lab(colour2)
  const rad = Math.PI / 180
  const hue = (b: number, a: number) => {
    const degrees = Math.atan2(b, a) / rad
    return degrees < 0 ? degrees + 360 : degrees
  }

  const Cmean = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2
  const G = 0.5 * (1 - Math.sqrt(Cmean ** 7 / (Cmean ** 7 + 25 ** 7)))
  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)
  const C1p = Math.hypot(a1p, b1)
  const C2p = Math.hypot(a2p, b2)
  const h1p = hue(b1, a1p)
  const h2p = hue(b2, a2p)

  const dLp = L2 - L1
  const dCp = C2p - C1p
  let dhp = h2p - h1p
  if (C1p * C2p === 0) dhp = 0
  else if (dhp > 180) dhp -= 360
  else if (dhp < -180) dhp += 360
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad)

  const Lmean = (L1 + L2) / 2
  const Cpmean = (C1p + C2p) / 2
  let hpmean = h1p + h2p
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hpmean += hpmean < 360 ? 360 : -360
    hpmean /= 2
  }

  const T =
    1 -
    0.17 * Math.cos((hpmean - 30) * rad) +
    0.24 * Math.cos(2 * hpmean * rad) +
    0.32 * Math.cos((3 * hpmean + 6) * rad) -
    0.2 * Math.cos((4 * hpmean - 63) * rad)
  const dTheta = 30 * Math.exp(-(((hpmean - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cpmean ** 7 / (Cpmean ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lmean - 50) ** 2) / Math.sqrt(20 + (Lmean - 50) ** 2)
  const Sc = 1 + 0.045 * Cpmean
  const Sh = 1 + 0.015 * Cpmean * T
  const Rt = -Math.sin(2 * dTheta * rad) * Rc

  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh))
}
