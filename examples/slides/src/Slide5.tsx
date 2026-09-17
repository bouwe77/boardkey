import { useState } from 'react'
import { useKeys } from 'boardkey'
import { colors, Hint, Key } from './Code'

function Counter({ title }: { title?: string }) {
  const [count, setCount] = useState(0)

  useKeys({
    arrowup: () => setCount((c) => c + 1),
    arrowdown: () => setCount((c) => c - 1),
  })

  return (
    <div style={{ textAlign: 'center' }}>
      {title && (
        <div style={{ color: colors.dim, fontSize: '20px' }}>{title}</div>
      )}
      <strong style={{ fontSize: '80px', color: colors.accent }}>
        {count}
      </strong>
    </div>
  )
}

function Modal({ onClose }: { onClose: () => void }) {
  useKeys({ escape: onClose })

  return (
    <div
      style={{
        position: 'absolute',
        inset: '20% 25%',
        // See-through, so the counter on the page behind it stays visible
        background: 'rgba(37, 37, 38, 0.85)',
        border: `2px solid ${colors.hook}`,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <Counter />
      <Hint fontSize="18px">
        <Key>esc</Key> to close it again
      </Hint>
    </div>
  )
}

export default function Slide5() {
  const [open, setOpen] = useState(false)

  // Off while the modal is open, so m does not open a second one
  useKeys({ m: () => setOpen(true) }, { active: !open })

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
      <h1 style={{ color: colors.hook, margin: 0 }}>
        Same key, whoever is rendered last
      </h1>
      <Counter />
      <Hint>
        <Key>▲</Key> <Key>▼</Key> to count, <Key>m</Key> to open a modal
      </Hint>
      {open && <Modal onClose={() => setOpen(false)} />}
    </div>
  )
}
