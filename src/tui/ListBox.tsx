import React, { useEffect, useState } from 'react'
import { useKeys } from '../useKeys.js'
import { Panel, PANEL_PADDING } from './Panel.js'
import { Colors, withDefaults } from './colors.js'

/** How far the highlight stays away from the border of the panel */
const INSET = 8

export interface ListBoxProps {
  title: string
  options: string[]
  onSelect?: (option: string) => void
  /** Called whenever the selection moves, including once on mount. */
  onChange?: (option: string) => void
  /**
   * Whether this list box owns the arrow keys. Use it when two of them are on
   * screen at the same time: the app decides which one has the focus, and the
   * other one binds nothing. An inactive list box is dimmed.
   */
  active?: boolean
  /** Leave it out for the keys this list box handles itself. */
  footer?: React.ReactNode
  onClose?: () => void
  /** Only the colours you want to change, the rest fall back to the defaults. */
  colors?: Partial<Colors>
  /** A fixed width, so the list does not follow its longest option. */
  width?: React.CSSProperties['width']
}

/**
 * A list of options, as high as the number of options. The arrow keys move the
 * selection and wrap around at both ends, enter picks the selected one. The
 * mouse picks an option in one click.
 *
 * The selection lives here. Give it a `key` that changes with `options` if the
 * selection should start over when the options do.
 */
export function ListBox({
  title,
  options,
  onSelect,
  onChange,
  active = true,
  onClose,
  colors,
  width,
  footer = onClose
    ? '↑ ↓ = move, enter = pick, esc = close'
    : '↑ ↓ = move, enter = pick',
}: ListBoxProps) {
  const c = withDefaults(colors)
  const [selected, setSelected] = useState(0)

  // In a ref, so a new inline callback does not report the same selection again
  const onChangeRef = React.useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  // Reported on mount too, so whatever depends on this list can fill itself in
  // before anything is picked
  useEffect(() => {
    onChangeRef.current?.(options[selected])
  }, [options, selected])

  // Adding options.length keeps the result positive when moving up from 0
  const move = (step: number) =>
    setSelected((i) => (i + step + options.length) % options.length)

  useKeys(
    {
      arrowup: () => move(-1),
      arrowdown: () => move(1),
      enter: () => onSelect?.(options[selected]),
    },
    { active },
  )

  return (
    <Panel
      title={title}
      onClose={onClose}
      colors={colors}
      width={width}
      footer={footer}
    >
      <ul
        role="listbox"
        style={{
          // Dimmed while another list box has the focus, so it is clear where
          // the arrow keys will land
          opacity: active ? 1 : 0.45,
          listStyle: 'none',
          // Cancels most of the panel padding, so the highlight is a bit wider
          // than the text but keeps the same distance to the border on every
          // side, including below the last option
          margin: `0 -${INSET}px -${PANEL_PADDING - INSET}px`,
          padding: 0,
        }}
      >
        {options.map((option, i) => (
          <li
            key={option}
            role="option"
            aria-selected={i === selected}
            // Clicking picks an option right away. No hover selection: that
            // would take the selection away from the arrow keys.
            onClick={() => onSelect?.(option)}
            style={{
              cursor: 'pointer',
              padding: `0 ${PANEL_PADDING - INSET}px`,
              // Inverted colours for the selection, like a terminal
              background: i === selected ? c.selectedBackground : 'none',
              color: i === selected ? c.selectedText : c.text,
            }}
          >
            {option}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
