// PROTOTYPE (quiet atlas) — throwaway.
// Three layouts of the Attempt and Results screens — A floating corners (the agreed design), B a calm
// top bar (the fallback), C a bottom dock — switchable via ?variant= inside the real app flow, with
// in-page switches for the serif, the shade set, the grid, the panel style and the Unfound Highlight
// label. The Quiz list and setup screens keep their layout and take only the palette and type.
// Run `pnpm dev` and open http://localhost:5173/terminus/?variant=A
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/source-serif-4/opsz.css'
import { type ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import { quizCatalog } from '../../quiz/catalog.ts'
import { PrototypeSwitcher } from '../PrototypeSwitcher.tsx'
import { cardVariants, useCardVariant } from './QaQuizListScreen.tsx'
import { fontStacks, setParam, type TweakName, tweaks, useTweak, useVariant, variants } from './params.ts'
import { checks, type Shades, shadeSets } from './shades.ts'
import './quietAtlas.css'

const tokenNames: Record<Exclude<keyof Shades, 'name'>, string> = {
  ink: '--ink',
  inkMuted: '--ink-muted',
  paper: '--paper',
  land: '--land',
  landEdge: '--land-edge',
  sea: '--sea',
  territory: '--territory',
  found: '--found',
  foundTint: '--found-tint',
  missed: '--missed',
  ochre: '--ochre',
  ochreInk: '--ochre-ink',
  ochreWash: '--ochre-wash',
}

// The one named set of colours, as CSS custom properties on the page.
function tokensCss(shades: Shades, fontStack: string) {
  const lines = Object.entries(tokenNames).map(([key, token]) => `  ${token}: ${shades[key as keyof Shades]};`)
  return `html.qa {\n${lines.join('\n')}\n  --display: ${fontStack};\n}`
}

interface QuietAtlasPrototypeProps {
  screen: string
  children: ReactNode
}

export function QuietAtlasPrototype({ screen, children }: QuietAtlasPrototypeProps) {
  const variant = useVariant()
  const card = useCardVariant()
  // On the home page the bar cycles the Quiz card; everywhere else, the play layouts.
  const onHome = screen === 'quiz-list'
  const font = useTweak('font')
  const shadesKey = useTweak('shades')
  const panel = useTweak('panel')
  const bar = useTweak('bar')
  const shades = shadeSets[shadesKey]
  // The bar keeps off the variant's own controls: B has its bar at the top, A and C their answer box
  // at the bottom.
  const edge = variant === 'B' ? 'bottom' : 'top'

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add('qa')
    root.dataset.qaPanelStyle = panel
    root.dataset.qaFont = font
    return () => {
      root.classList.remove('qa')
    }
  }, [panel, font])

  const coverage = useLandUnderPanels(`${screen} ${variant} ${panel} ${font}`)
  const landCount = coverage?.reduce((sum, { places }) => sum + places.length, 0) ?? 0

  return (
    <>
      <style>{tokensCss(shades, fontStacks[font])}</style>
      {children}
      {bar === 'off' ? (
        <button type="button" className={`prototype-restore ${edge}`} title="Show the prototype bar" onClick={() => setParam('bar', 'closed')}>
          P
        </button>
      ) : (
        <PrototypeSwitcher
          variants={onHome ? cardVariants : variants}
          current={onHome ? card : variant}
          edge={edge}
          onChange={(key) => setParam(onHome ? 'card' : 'variant', key)}
        >
          <span className={landCount ? 'prototype-land warn' : 'prototype-land'} title="Countries under the floating panels, at the current view">
            {coverage === null ? 'land: —' : landCount ? `land under panels: ${landCount}` : 'panels clear of land'}
          </span>
          <button type="button" onClick={() => setParam('bar', bar === 'open' ? 'closed' : 'open')}>
            Tweaks {bar === 'open' ? '▴' : '▾'}
          </button>
          <button type="button" aria-label="Hide the prototype bar" onClick={() => setParam('bar', 'off')}>
            ×
          </button>
          {bar === 'open' && <TweaksPanel screen={screen} shades={shades} coverage={coverage} />}
        </PrototypeSwitcher>
      )}
    </>
  )
}

const shownTweaks: TweakName[] = ['font', 'shades', 'grid', 'panel', 'label', 'best']

function TweaksPanel({ screen, shades, coverage }: { screen: string; shades: Shades; coverage: Coverage[] | null }) {
  const font = useTweak('font')
  const tabular = useTabularCheck(fontStacks[font])
  return (
    <div className="prototype-tweaks">
      {shownTweaks.map((name) => (
        <TweakSelect key={name} name={name} />
      ))}
      <p className="prototype-note">Serif tabular digits: {tabular}</p>
      {screen === 'attempt' && (
        <div className="prototype-row">
          <button type="button" onClick={() => dispatchEvent(new CustomEvent('qa-find', { detail: 40 }))}>
            Find 40 at random
          </button>
          <button type="button" onClick={() => dispatchEvent(new CustomEvent('qa-find', { detail: 1 }))}>
            Find 1
          </button>
          <button type="button" onClick={() => dispatchEvent(new CustomEvent('qa-flash'))}>
            Flash a Found one
          </button>
        </div>
      )}
      <h3>Land under panels (current view)</h3>
      {coverage === null ? (
        <p className="prototype-note">The map isn't showing.</p>
      ) : (
        <ul>
          {coverage.map(({ panel, places }) => (
            <li key={panel} className={places.length ? 'warn' : ''}>
              {panel}: {places.length ? places.join(', ') : 'clear'}
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => dispatchEvent(new Event('qa-measure'))}>
        Measure again
      </button>
      <h3>{shades.name}</h3>
      <div className="prototype-swatches">
        {Object.entries(tokenNames).map(([key, token]) => (
          <span key={key} title={`${token} ${shades[key as keyof Shades]}`} style={{ background: shades[key as keyof Shades] }} />
        ))}
      </div>
      <table>
        <tbody>
          {checks(shades).map((check) => (
            <tr key={check.label} className={check.pass === false ? 'warn' : ''}>
              <td>{check.pass === null ? '' : check.pass ? '✓' : '✗'}</td>
              <td>{check.label}</td>
              <td>{check.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="prototype-note">ΔE: N normal, D deutan, P protan, T tritan (CIEDE2000 on Machado simulations).</p>
    </div>
  )
}

function TweakSelect({ name }: { name: TweakName }) {
  const value = useTweak(name)
  const tweak = tweaks[name]
  return (
    <label className="prototype-row">
      <span>{tweak.label}</span>
      <select value={value} onChange={(event) => setParam(name, event.target.value)}>
        {Object.entries(tweak.options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}

// Whether the serif's digits all take the same width once tabular-nums is asked for.
function useTabularCheck(fontStack: string) {
  const [result, setResult] = useState('checking…')
  useEffect(() => {
    let cancelled = false
    const family = fontStack.split(',')[0]
    document.fonts.load(`600 40px ${family}`, '0123456789').then(() => {
      if (cancelled) return
      const width = (text: string, numeric: string) => {
        const span = document.createElement('span')
        span.style.cssText = `position:absolute;visibility:hidden;font:600 40px ${fontStack};font-variant-numeric:${numeric}`
        span.textContent = text
        document.body.append(span)
        const w = span.getBoundingClientRect().width
        span.remove()
        return w
      }
      const tabular = Math.abs(width('1111', 'tabular-nums') - width('8888', 'tabular-nums')) < 0.5
      const proportionalByDefault = Math.abs(width('1111', 'normal') - width('8888', 'normal')) >= 0.5
      setResult(
        `${tabular ? 'yes ✓' : 'NO ✗'} (default figures are ${proportionalByDefault ? 'proportional' : 'tabular'})`,
      )
    })
    return () => {
      cancelled = true
    }
  }, [fontStack])
  return result
}

interface Coverage {
  panel: string
  places: string[]
}

const namesById = new Map(quizCatalog.flatMap((quiz) => quiz.places.map((place) => [place.id, place.name])))

// Which Countries lie under each floating panel, found by hit-testing a grid of points across it.
// Territories are never answers and ignore the pointer, so they don't count.
function measureLandUnderPanels(): Coverage[] | null {
  if (!document.querySelector('.world-map svg')) return null
  const panels = [...document.querySelectorAll<HTMLElement>('[data-qa-panel], .world-map .reset-view')]
  return panels.map((panel) => {
    const rect = panel.getBoundingClientRect()
    const ids = new Set<string>()
    for (let y = rect.top + 1; y < rect.bottom; y += 4) {
      for (let x = rect.left + 1; x < rect.right; x += 4) {
        const shape = document
          .elementsFromPoint(x, y)
          .find((element) => element instanceof SVGElement && (element.dataset.id || element.classList.contains('sphere')))
        if (shape instanceof SVGElement && shape.classList.contains('country')) ids.add(shape.dataset.id!)
      }
    }
    return {
      panel: panel.dataset.qaPanel ?? 'Reset view',
      places: [...ids].map((id) => namesById.get(id) ?? id),
    }
  })
}

// Measures again after the window, the layout or the view changes, once things settle.
function useLandUnderPanels(layoutKey: string) {
  const [coverage, setCoverage] = useState<Coverage[] | null>(null)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      clearTimeout(timer)
      // Long enough for the Reset view animation to finish.
      timer = setTimeout(() => setCoverage(measureLandUnderPanels()), 800)
    }
    schedule()
    // The map may still be loading when the screen first shows.
    const retry = setTimeout(schedule, 1500)
    const events = ['resize', 'qa-measure', 'wheel', 'pointerup']
    for (const event of events) addEventListener(event, schedule)
    return () => {
      clearTimeout(timer)
      clearTimeout(retry)
      for (const event of events) removeEventListener(event, schedule)
    }
  }, [layoutKey])
  return coverage
}
