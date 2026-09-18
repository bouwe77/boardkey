import { useState } from 'react'
import { useKeys, useMute } from 'boardkey'
import { colors, Hint, Key } from './Code'

const PAINT: Record<string, string> = {
  r: '#f48771',
  g: '#4ec9b0',
  b: '#569cd6',
}

/**
 * The modal calls useMute, so the keyboard belongs to whatever is typed here.
 * It keeps its escape binding, because while muted only the highest
 * registration handles keys, and that is this one.
 */
function NoteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (note: string) => void
}) {
  const [note, setNote] = useState('')

  useMute()
  useKeys({ escape: onClose, enter: () => onSubmit(note) })

  return (
    <div
      style={{
        position: 'absolute',
        inset: '25% 20%',
        background: colors.panel,
        border: `2px solid ${colors.hook}`,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '30px',
      }}
    >
      <Hint>
        type anything, <Key>r</Key> <Key>g</Key> <Key>b</Key> <Key>m</Key>{' '}
        included
      </Hint>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        autoFocus
        spellCheck={false}
        style={{
          width: '100%',
          padding: '14px',
          background: '#1e1e1e',
          border: `1px solid ${colors.border}`,
          color: '#d4d4d4',
          font: 'inherit',
          fontSize: '28px',
          outline: 'none',
        }}
      />
      <Hint fontSize="18px">
        <Key>enter</Key> to put it on the page, <Key>esc</Key> to close it
      </Hint>
    </div>
  )
}

export default function Slide7() {
  const [color, setColor] = useState(PAINT.g)
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  // No active flag needed: the modal mutes, so none of these can fire while
  // it is open, not even m
  useKeys({
    r: () => setColor(PAINT.r),
    g: () => setColor(PAINT.g),
    b: () => setColor(PAINT.b),
    m: () => setOpen(true),
  })

  return (
    <div
      style={{
        width: 'min(1100px, 92vw)',
        height: '70vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
      }}
    >
      <div
        style={{
          width: '260px',
          height: '160px',
          background: color,
          border: `2px solid ${colors.border}`,
        }}
      />
      {note && <p style={{ fontSize: '32px', margin: 0 }}>{note}</p>}
      <Hint>
        <Key>r</Key> <Key>g</Key> <Key>b</Key> to change the color
        <br />
        <Key>m</Key> for a note
      </Hint>
      {open && (
        <NoteModal
          onClose={() => setOpen(false)}
          onSubmit={(submitted) => {
            setNote(submitted)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
