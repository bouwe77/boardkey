import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import Demo from '../demo-app/src/App'
import Hangman from '../hangman/src/App'

const EXAMPLES = [
  { path: '/demo', label: 'demo', Component: Demo },
  { path: '/hangman', label: 'hangman', Component: Hangman },
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

  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: '10px',
          padding: '10px 20px',
          borderBottom: '1px solid #3a3a3a',
          background: '#252526',
        }}
      >
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
            {e.label}
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
    <App />
  </React.StrictMode>,
)
