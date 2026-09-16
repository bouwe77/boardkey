import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { KeyboardProvider, useKeys } from 'boardkey'
import Sandbox from '../sandbox/src/App'
import Hangman from '../hangman/src/App'
import Tui from '../tui/src/App'
import Vi from '../vi/src/App'

// The nicest one first: it is also what an unknown path falls back to
const EXAMPLES = [
  { path: '/tui', label: 'tui', key: 'f1', Component: Tui },
  { path: '/hangman', label: 'hangman', key: 'f2', Component: Hangman },
  { path: '/vi', label: 'vi', key: 'f3', Component: Vi },
  { path: '/sandbox', label: 'sandbox', key: 'f4', Component: Sandbox },
]

function App() {
  const [path, setPath] = useState(window.location.pathname)

  // Back and forward buttons change the path without a reload, so listen for it.
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const current = EXAMPLES.find((e) => e.path === path) ?? EXAMPLES[0]

  const navigate = (to: string) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }

  // A function key per example. Each example has its own KeyboardProvider, so
  // this registry is separate from theirs, and a function key is safe there:
  // nothing types one, not even a text input that muted its own provider.
  useKeys(
    Object.fromEntries(
      EXAMPLES.map((example) => [example.key, () => navigate(example.path)]),
    ),
  )

  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: '10px',
          padding: '10px 20px',
          borderBottom: '1px solid #3a3a3a',
          background: '#252526',
          alignItems: 'baseline',
        }}
      >
        {/* The same blue as the active tab, so the header has one accent */}
        <strong style={{ marginRight: '20px', color: '#569cd6' }}>
          boardkey demos
        </strong>
        {EXAMPLES.map((e) => (
          <a
            key={e.path}
            href={e.path}
            onClick={(event) => {
              event.preventDefault()
              navigate(e.path)
            }}
            style={{
              padding: '4px 10px',
              textDecoration: 'none',
              color: e === current ? '#1e1e1e' : '#d4d4d4',
              background: e === current ? '#569cd6' : 'transparent',
            }}
          >
            <span
              style={{ opacity: 0.6, marginRight: '6px', fontSize: '12px' }}
            >
              {e.key.toUpperCase()}
            </span>
            <span style={{ fontSize: '16px' }}>{e.label}</span>
          </a>
        ))}
      </nav>
      {/* Remount on switch, so each example starts with a clean state */}
      <current.Component key={current.path} />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KeyboardProvider>
      <App />
    </KeyboardProvider>
  </React.StrictMode>,
)
