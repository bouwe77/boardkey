import React from 'react'

export interface HintProps {
  children: React.ReactNode
  onClick: () => void
  style?: React.CSSProperties
  'aria-label'?: string
}

/**
 * A key hint that is also clickable. The keys are the real interface, but a
 * mouse user should not be left out, so every hint doubles as a button.
 */
export function Hint({ children, onClick, style, ...rest }: HintProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none',
        background: 'none',
        color: 'inherit',
        font: 'inherit',
        textAlign: 'left',
        lineHeight: 1,
        padding: 0,
        flexShrink: 0,
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
