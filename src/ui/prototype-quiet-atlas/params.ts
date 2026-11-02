// PROTOTYPE (quiet atlas) — throwaway. Every switch in the prototype lives in the URL, so a
// combination survives reloads and can be shared: ?variant=A&font=fraunces&shades=chart&…
import { useSyncExternalStore } from 'react'

export const variants = [
  { key: 'A', name: 'Floating corners (agreed)' },
  { key: 'B', name: 'Calm top bar (fallback)' },
  { key: 'C', name: 'Bottom dock' },
  { key: 'D', name: 'Chosen: A to play, dock for Results' },
] as const

export const tweaks = {
  font: {
    label: 'Serif',
    fallback: 'newsreader',
    options: {
      fraunces: 'Fraunces',
      'source-serif': 'Source Serif 4',
      newsreader: 'Newsreader',
      system: 'None (system font)',
    },
  },
  shades: {
    label: 'Shades',
    fallback: 'strong',
    options: { chart: 'Chart room (cool)', atlas: 'Old atlas (warm)', strong: 'Strong (more contrast)' },
  },
  grid: { label: 'Grid', fallback: 'on', options: { on: 'On', off: 'Off' } },
  panel: {
    label: 'Panels',
    fallback: 'frosted',
    options: {
      hairline: 'Hairline border',
      lifted: 'Lifted (shadow)',
      frosted: 'Frosted (see-through)',
      cartouche: 'Cartouche (double rule)',
    },
  },
  label: {
    label: 'Unfound Highlight',
    fallback: 'full',
    options: {
      full: 'Swatch + “Unfound Highlight”',
      short: 'Swatch + “Unfound”',
      icon: 'Icon + “Unfound”',
      'icon-only': 'Icon only (+ key when on)',
    },
  },
  best: { label: 'New best badge', fallback: 'real', options: { real: 'As played', on: 'Force on', off: 'Force off' } },
  bar: { label: 'Bar', fallback: 'closed', options: { closed: 'Closed', open: 'Tweaks open', off: 'Hidden' } },
} as const

export type TweakName = keyof typeof tweaks

export const fontStacks: Record<string, string> = {
  fraunces: "'Fraunces Variable', Georgia, serif",
  'source-serif': "'Source Serif 4 Variable', Georgia, serif",
  newsreader: "'Newsreader Variable', Georgia, serif",
  system: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    removeEventListener('popstate', listener)
  }
}

export function setParam(name: string, value: string) {
  const params = new URLSearchParams(location.search)
  params.set(name, value)
  history.replaceState(history.state, '', `${location.pathname}?${params}${location.hash}`)
  for (const listener of listeners) listener()
}

export function useParam(name: string, fallback: string): string {
  return useSyncExternalStore(subscribe, () => new URLSearchParams(location.search).get(name)) ?? fallback
}

export function useTweak<N extends TweakName>(name: N): keyof (typeof tweaks)[N]['options'] & string {
  const value = useParam(name, tweaks[name].fallback)
  return (value in tweaks[name].options ? value : tweaks[name].fallback) as keyof (typeof tweaks)[N]['options'] &
    string
}

export function useVariant(): string {
  const value = useParam('variant', 'A')
  return variants.some((variant) => variant.key === value) ? value : 'A'
}

// The prototype is on in development builds whenever the URL names a variant.
export const quietAtlasOn = import.meta.env.DEV && new URLSearchParams(location.search).has('variant')
