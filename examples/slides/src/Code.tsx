import type { ReactNode } from 'react'

export const colors = {
  hook: '#569cd6',
  accent: '#4ec9b0',
  dim: '#858585',
  panel: '#252526',
  border: '#3a3a3a',
}

// The only thing worth highlighting: the library is these two calls
const HOOKS = /(useKeys|useMute)/

/**
 * A block of sample code. Everything is plain, except the boardkey hooks.
 * The code on a slide is written by hand and does not have to be the code that
 * runs next to it, so it can leave out whatever is not the point.
 */
export default function Code({
  children,
  fontSize = '22px',
}: {
  children: string
  fontSize?: string
}) {
  return (
    <pre
      style={{
        margin: 0,
        padding: '24px',
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        fontSize,
        lineHeight: 1.6,
        overflowX: 'auto',
      }}
    >
      {children.split(HOOKS).map((part, i) =>
        HOOKS.test(part) ? (
          <span key={i} style={{ color: colors.hook, fontWeight: 'bold' }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </pre>
  )
}

/** A single key in a hint line, in the accent colour. */
export function Key({ children }: { children: ReactNode }) {
  return <span style={{ color: colors.hook }}>{children}</span>
}

/** A line under a demo telling you what to press. Mark the keys with <Key>. */
export function Hint({
  children,
  fontSize = '20px',
}: {
  children: ReactNode
  fontSize?: string
}) {
  return <span style={{ color: colors.dim, fontSize }}>{children}</span>
}
