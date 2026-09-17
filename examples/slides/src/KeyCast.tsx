import { useEffect, useState } from 'react'

const LABELS: Record<string, string> = {
  // Solid triangles, not arrows: ← and → fall back to another font in
  // JetBrains Mono and end up thinner than ↑ and ↓. These four match.
  arrowup: '▲',
  arrowdown: '▼',
  arrowleft: '◀',
  arrowright: '▶',
  ' ': 'space',
  escape: 'esc',
  enter: '⏎',
  backspace: '⌫',
  tab: '⇥',
}

const LIFETIME_MS = 1000

// A modifier on its own is not worth showing
const MODIFIERS = ['shift', 'control', 'alt', 'meta']

function label(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  const parts = []
  if (event.metaKey) parts.push('⌘')
  if (event.ctrlKey) parts.push('ctrl')
  if (event.altKey) parts.push('⌥')
  if (event.shiftKey) parts.push('⇧')
  parts.push(LABELS[key] ?? key)
  return parts.join(' ')
}

/**
 * Shows the keys as they are pressed, the way a screencast tool does, so the
 * audience can connect what I press to what happens on the screen.
 *
 * It listens on the window itself instead of through boardkey. boardkey only
 * reports the keys nothing handled, and this has to show every key, including
 * the ones that did something.
 */
export default function KeyCast() {
  const [keys, setKeys] = useState<{ id: number; text: string }[]>([])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (MODIFIERS.includes(event.key.toLowerCase())) return

      const id = Date.now() + Math.random()
      const text = label(event)
      setKeys((current) => {
        // The same key again replaces the one on screen, so holding an arrow
        // down does not fill the slide with copies of it. The old entry's
        // timeout finds no matching id and does nothing.
        const last = current[current.length - 1]
        const rest = last?.text === text ? current.slice(0, -1) : current
        return [...rest, { id, text }]
      })
      setTimeout(
        () => setKeys((current) => current.filter((k) => k.id !== id)),
        LIFETIME_MS,
      )
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '60px',
        display: 'flex',
        gap: '16px',
        pointerEvents: 'none',
      }}
    >
      {keys.map((key) => (
        <span
          key={key.id}
          style={{
            padding: '20px 36px',
            borderRadius: '10px',
            border: '1px solid #3a3a3a',
            background: '#2d2d30',
            color: '#d4d4d4',
            fontSize: '56px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            animation: `keycast ${LIFETIME_MS}ms ease-out forwards`,
          }}
        >
          {key.text}
        </span>
      ))}
      <style>{`
        @keyframes keycast {
          0%   { opacity: 0; transform: translateY(12px) }
          10%  { opacity: 1; transform: translateY(0) }
          70%  { opacity: 1 }
          100% { opacity: 0 }
        }
      `}</style>
    </div>
  )
}
