import { useRef } from 'react'
import { useKeys } from 'boardkey'
import { Colors, pageColor, Hint } from 'boardkey/tui'
import { THEMES, randomColors } from './themes'

export interface SidebarProps {
  colors: Colors
  onChange: (colors: Colors) => void
  onZen: () => void
}

const FIELDS: { name: keyof Colors; key: string; label: string }[] = [
  { name: 'page', key: 'p', label: 'Page background' },
  { name: 'title', key: 't', label: 'Title' },
  { name: 'border', key: 'b', label: 'Border' },
  { name: 'background', key: 'g', label: 'Background' },
  { name: 'text', key: 'e', label: 'Text' },
  { name: 'selectedBackground', key: 's', label: 'Selected background' },
  { name: 'selectedText', key: 'd', label: 'Selected text' },
]

const heading = {
  margin: 0,
  font: 'inherit',
  textTransform: 'uppercase',
} as const

/**
 * Picks the palette for the boxes on the right: a whole set at once, a random
 * one, or a single colour with the native colour pickers.
 */
export function Sidebar({ colors, onChange, onZen }: SidebarProps) {
  const inputs = useRef<Partial<Record<keyof Colors, HTMLInputElement | null>>>(
    {},
  )

  // showPicker is the supported way to open a colour picker without a click.
  // Falling back to click() keeps older browsers working.
  const openPicker = (name: keyof Colors) => {
    const input = inputs.current[name]
    if (!input) return
    if (input.showPicker) input.showPicker()
    else input.click()
  }

  useKeys(
    Object.fromEntries(
      FIELDS.map((field) => [field.key, () => openPicker(field.name)]),
    ),
  )

  return (
    <aside
      style={{
        width: '280px',
        flexShrink: 0,
        padding: '20px',
        borderRight: '1px solid #3a3a3a',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <h2 style={heading}>View</h2>

      <Hint onClick={onZen}>Z = Zen mode</Hint>

      <h2 style={heading}>Color sets</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {THEMES.map((theme) => (
          <Hint key={theme.key} onClick={() => onChange(theme.colors)}>
            {theme.key} = {theme.label}
          </Hint>
        ))}
        <Hint onClick={() => onChange(randomColors())}>R = Random</Hint>
      </div>

      <h2 style={heading}>Single colors</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {FIELDS.map((field) => (
          <label
            key={field.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="color"
              ref={(element) => {
                inputs.current[field.name] = element
              }}
              value={
                field.name === 'page' ? pageColor(colors) : colors[field.name]
              }
              onChange={(event) =>
                onChange({ ...colors, [field.name]: event.target.value })
              }
              style={{
                // Fixed, so a long label cannot squeeze the swatch
                width: '28px',
                height: '20px',
                flexShrink: 0,
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            />
            {field.key.toUpperCase()} = {field.label}
          </label>
        ))}
      </div>
    </aside>
  )
}
