// PROTOTYPE — throwaway. The floating bar that cycles a UI prototype's variants, kept in the URL's
// ?variant= so a variant survives reloads and can be shared. It sits at the bottom centre unless the
// variant under test has something there, as the quiet atlas prototype's answer box is.
import { type ReactNode, useEffect } from 'react'

interface PrototypeSwitcherProps {
  variants: readonly { key: string; name: string }[]
  current: string
  onChange: (key: string) => void
  edge?: 'top' | 'bottom'
  // Extra prototype controls, shown after the variant arrows.
  children?: ReactNode
}

export function PrototypeSwitcher({ variants, current, onChange, edge = 'bottom', children }: PrototypeSwitcherProps) {
  const index = Math.max(0, variants.findIndex((variant) => variant.key === current))

  function step(by: number) {
    onChange(variants[(index + by + variants.length) % variants.length].key)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable]')) return
      step(event.key === 'ArrowLeft' ? -1 : 1)
    }
    addEventListener('keydown', handleKeyDown)
    return () => removeEventListener('keydown', handleKeyDown)
  })

  if (!import.meta.env.DEV) return null
  const variant = variants[index]
  return (
    <div className={`prototype-switcher ${edge}`}>
      <button type="button" aria-label="Previous variant" onClick={() => step(-1)}>
        ◀
      </button>
      <span className="prototype-switcher-label">
        {variant.key} — {variant.name}
      </span>
      <button type="button" aria-label="Next variant" onClick={() => step(1)}>
        ▶
      </button>
      {children}
    </div>
  )
}
