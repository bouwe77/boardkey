import React from 'react'
import { useKeys } from '../useKeys.js'
import { Hint } from './Hint.js'
import { Colors, withDefaults } from './colors.js'

export interface PanelProps {
  title: string
  children?: React.ReactNode
  /** Leave it out for a panel that cannot be closed. */
  onClose?: () => void
  /** Only the colours you want to change, the rest fall back to the defaults. */
  colors?: Partial<Colors>
  /**
   * A fixed width, so the panel does not follow its contents. Anything CSS
   * accepts. Leave it out to let the layout around it decide.
   */
  width?: React.CSSProperties['width']
  /**
   * A line under the box, outside the border, for explaining the keys. A panel
   * that can be closed explains that by itself.
   */
  footer?: React.ReactNode
}

/** Side padding of the panel, so children can cancel it when they need to. */
export const PANEL_PADDING = 16

/**
 * The chrome every TUI component shares: a box drawn with a fieldset. The
 * browser breaks the top border for the legend, so the title and the close hint
 * sit inside the border line itself, with a rule between them. No JavaScript,
 * no absolute positioning.
 *
 * With onClose, escape and x close it. The bindings live here, so a panel
 * opened on top of another one gets the higher epoch and closes first.
 */
export function Panel({
  title,
  children,
  onClose,
  colors,
  width,
  footer = onClose ? 'esc, x = close' : undefined,
}: PanelProps) {
  const c = withDefaults(colors)
  const close = () => onClose?.()

  // boardkey lowercases the key but keeps shift as a modifier, so a capital X
  // arrives as "shift+x" and needs its own binding.
  useKeys(
    { escape: close, x: close, 'shift+x': close },
    { active: Boolean(onClose) },
  )

  return (
    <div style={{ width }}>
      <fieldset
        style={{
          border: `1px solid ${c.border}`,
          background: c.background,
          color: c.text,
          // Just enough to take the hard edge off, without losing the TUI look
          borderRadius: '3px',
          padding: `0 ${PANEL_PADDING}px ${PANEL_PADDING}px`,
          margin: 0,
          minWidth: 0,
        }}
      >
        <legend
          style={{
            display: 'flex',
            alignItems: 'center',
            // Spans the content box, so only the corner stubs of the top border
            // stay visible and the rule below fills everything in between. The
            // negative margin cancels the padding on the left, so the title lines
            // up with the body text while keeping its gap from the corner stub.
            width: 'calc(100% + 12px)',
            // The gaps around the title and the close hint are their own padding,
            // so their background covers those gaps too
            padding: 0,
            margin: '0 0 0 -12px',
          }}
        >
          {/* Cut off with an ellipsis instead of pushing the rule away */}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              color: c.title,
              // The legend sits half over the border line, so the text needs its
              // own background. Only here and on the close hint, so the rule
              // between them keeps the page behind it.
              background: c.background,
              padding: '0 12px',
            }}
          >
            {title}
          </span>
          {/* Never shrinks, so a long title cannot swallow the rule */}
          <span
            style={{ flex: '1 0 24px', borderTop: `1px solid ${c.border}` }}
          />
          {onClose && (
            <Hint
              onClick={onClose}
              aria-label="Close"
              style={{ background: c.background, padding: '0 12px' }}
            >
              X
            </Hint>
          )}
        </legend>
        {children}
      </fieldset>
      {footer && (
        <div style={{ margin: '6px 0 0 4px', opacity: 0.7 }}>{footer}</div>
      )}
    </div>
  )
}
