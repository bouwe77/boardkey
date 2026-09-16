import { useEffect, useRef, useState } from 'react'
import { KeyboardProvider, useIsMuted, useKeys, useMute } from 'boardkey'

function TextInput({
  active,
  onActivate,
  onDeactivate,
  onSubmit,
  onOpenModal,
}: {
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
  onSubmit: (text: string) => void
  onOpenModal: () => void
}) {
  const [value, setValue] = useState('')

  // Use mute mode when the input is active
  useMute(active)

  // Escape leaves the input, enter submits. The input stays mounted, so
  // clearing the value keeps the focus.
  useKeys(
    {
      escape: onDeactivate,
      'ctrl+k': onOpenModal,
      enter: () => {
        if (!value.trim()) return
        onSubmit(value.trim())
        setValue('')
      },
    },
    { active },
  )

  if (!active) {
    return (
      <button
        type="button"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          padding: '8px',
          border: '2px solid #3794ff',
          cursor: 'pointer',
          background: '#252526',
          marginBottom: '10px',
        }}
        onClick={onActivate}
      >
        📝 Click to edit (or press 'E')... Current value: {value || '(empty)'}
      </button>
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      // Losing focus has to lift mute mode too, otherwise the app keys stay
      // muted after clicking or tabbing away
      onBlur={onDeactivate}
      autoFocus
      style={{
        padding: '8px',
        border: '2px solid #0078d4',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        width: '100%',
        background: '#1e1e1e',
        color: '#d4d4d4',
        marginBottom: '10px',
      }}
      placeholder="Type here... ENTER to add, ESC to exit, Ctrl+K for the modal"
    />
  )
}

function Modal({ onClose }: { onClose: () => void }) {
  // A modal owns the keyboard while it is open
  useMute()

  // Its own counter, on the same keys the main app uses
  const [count, setCount] = useState(0)

  useKeys({
    escape: onClose,
    'ctrl+w': onClose,
    arrowup: () => {
      setCount((c) => c + 1)
      console.log('⬆️ Modal count increased')
    },
    arrowdown: () => {
      setCount((c) => c - 1)
      console.log('⬇️ Modal count decreased')
    },
  })

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
        }}
        // Decorative: escape and ctrl+w close the modal from the keyboard
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '30px',
          background: '#252526',
          border: '2px solid #0078d4',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          minWidth: '400px',
          zIndex: 1000,
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', color: '#0078d4' }}>
          🪟 Modal Dialog
        </h2>
        <p style={{ marginBottom: '15px' }}>
          This modal has a higher epoch than the main app, so it captures
          keyboard events first.
        </p>
        <div
          style={{
            padding: '10px',
            background: '#1e1e1e',
            border: '1px solid #3794ff',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '32px', fontWeight: 'bold', color: '#0078d4' }}
          >
            {count}
          </div>
          <div style={{ fontSize: '12px', color: '#858585' }}>
            <strong>Try it:</strong> ↑/↓ change this counter, not the one in the
            main app.
          </div>
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#858585' }}>
          Press{' '}
          <kbd
            style={{
              background: '#1e1e1e',
              padding: '2px 6px',
              border: '1px solid #3794ff',
            }}
          >
            ESC
          </kbd>{' '}
          or{' '}
          <kbd
            style={{
              background: '#1e1e1e',
              padding: '2px 6px',
              border: '1px solid #3794ff',
            }}
          >
            Ctrl+W
          </kbd>{' '}
          to close
        </div>
      </div>
    </>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [entries, setEntries] = useState<string[]>([])

  // Log every mute transition, so you can see which component owns the keyboard
  const isMuted = useIsMuted()
  const wasMuted = useRef(isMuted)
  useEffect(() => {
    if (wasMuted.current === isMuted) return
    wasMuted.current = isMuted
    console.log(isMuted ? '🔇 Muted' : '🔊 Unmuted')
  }, [isMuted])

  // No `active` flag needed: mute mode already blocks these while the modal or
  // the text input owns the keyboard. Toggling `active` would also give these
  // bindings a new, higher epoch on every re-registration.
  useKeys({
    'ctrl+s': () => console.log('💾 Save triggered (Ctrl+S)'),
    'ctrl+q': () => console.log('🚪 Quit triggered (Ctrl+Q)'),
    arrowup: () => {
      setCount((c) => c + 1)
      console.log('⬆️ Count increased')
    },
    arrowdown: () => {
      setCount((c) => c - 1)
      console.log('⬇️ Count decreased')
    },
    m: () => {
      setShowModal(true)
      console.log('🪟 Modal opened (M)')
    },
    e: () => {
      setShowInput(true)
      console.log('📝 Input activated (E)')
    },
    h: () => console.log('❓ Help triggered (H)'),
    '?': () => console.log('❓ Help triggered (?)'),
  })

  return (
    <>
      <main
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px',
          fontFamily: "'Courier New', monospace",
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              marginBottom: '10px',
              color: '#0078d4',
              fontSize: '32px',
            }}
          >
            ⌨️ boardkey sandbox
          </h1>
          <p style={{ color: '#858585', fontSize: '14px' }}>
            A test bench, not a showcase: odd cases tried in a real browser, to
            find the edges before a user does
          </p>
        </div>

        <div
          style={{
            padding: '20px',
            background: '#252526',
            marginBottom: '30px',
            border: '2px solid #3794ff',
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', color: '#3794ff' }}>
            ⌨️ Keyboard Commands:
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <div>
              <strong style={{ color: '#4ec9b0' }}>↑/↓</strong> -
              Increase/decrease counter
              <br />
              <strong style={{ color: '#4ec9b0' }}>M</strong> - Open modal
              dialog
              <br />
              <strong style={{ color: '#4ec9b0' }}>E</strong> - Activate text
              input
              <br />
              <strong style={{ color: '#4ec9b0' }}>H</strong> or{' '}
              <strong style={{ color: '#4ec9b0' }}>?</strong> - Show help
            </div>
            <div>
              <strong style={{ color: '#4ec9b0' }}>Ctrl+S</strong> - Save
              (logged)
              <br />
              <strong style={{ color: '#4ec9b0' }}>Ctrl+Q</strong> - Quit
              (logged)
              <br />
              <strong style={{ color: '#4ec9b0' }}>ESC</strong> - Close
              modal/input
              <br />
              <strong style={{ color: '#4ec9b0' }}>Ctrl+W</strong> - Close modal
            </div>
          </div>
          <p
            style={{
              margin: '15px 0 0 0',
              fontSize: '12px',
              color: '#858585',
            }}
          >
            Any other key is logged to the browser console as unhandled, so you
            can see what boardkey passes on to the browser.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#ce9178', marginBottom: '10px' }}>
            📊 Counter Demo:
          </h3>
          <div
            style={{
              padding: '20px',
              background: '#252526',
              border: '2px solid #ce9178',
              textAlign: 'center',
            }}
          >
            <div
              style={{ fontSize: '48px', fontWeight: 'bold', color: '#ce9178' }}
            >
              {count}
            </div>
            <p
              style={{
                fontSize: '12px',
                color: '#858585',
                margin: '10px 0 0 0',
              }}
            >
              Use ↑/↓ arrow keys to change the counter
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#dcdcaa', marginBottom: '10px' }}>
            📝 Text Input Demo (with Mute Mode):
          </h3>
          <TextInput
            active={showInput}
            onActivate={() => {
              setShowInput(true)
              console.log('📝 Input activated (click)')
            }}
            onDeactivate={() => {
              setShowInput(false)
              console.log('📝 Input closed')
            }}
            onOpenModal={() => {
              setShowModal(true)
              console.log('🪟 Modal opened on top of the input (Ctrl+K)')
            }}
            onSubmit={(text) => {
              setEntries((prev) => [...prev, text])
              console.log(`✅ Added "${text}" (Enter)`)
            }}
          />
          {entries.length > 0 && (
            <ul
              style={{
                margin: '0 0 10px 0',
                padding: '10px 10px 10px 30px',
                background: '#252526',
                border: '2px solid #dcdcaa',
              }}
            >
              {entries.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ul>
          )}
          <p style={{ fontSize: '12px', color: '#858585' }}>
            When editing, keyboard shortcuts are muted, so only the input's own
            ENTER and ESC work. Regular typing goes to the input.
          </p>
          <p style={{ fontSize: '12px', color: '#858585' }}>
            <strong>Nested mute:</strong> while editing, press Ctrl+K to open
            the modal on top. Both the input and the modal are muted, and
            closing the modal keeps mute on because the input is still open
            (watch the browser console). Typing <strong>m</strong> stays a
            letter.
          </p>
        </div>
      </main>

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false)
            console.log('🪟 Modal closed')
          }}
        />
      )}
    </>
  )
}

const MODIFIER_KEYS = ['shift', 'control', 'alt', 'meta']

export default function Root() {
  return (
    <KeyboardProvider
      onUnhandled={(key, event) => {
        // Holding a modifier on its own is not an interesting event
        if (MODIFIER_KEYS.includes(event.key.toLowerCase())) return
        console.log(`Unhandled: ${key}`)
      }}
    >
      <App />
    </KeyboardProvider>
  )
}
