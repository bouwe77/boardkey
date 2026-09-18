import { useState } from 'react'
import { useKeys } from 'boardkey'
import { Hint, Key } from './Code'

// The real thing, so the arrow keys work on this slide too
function Counter() {
  const [count, setCount] = useState(0)

  useKeys({
    arrowup: () => setCount((c) => c + 1),
    arrowdown: () => setCount((c) => c - 1),
  })

  return (
    <span
      style={{
        display: 'inline-block',
        minWidth: '80px',
        padding: '10px 20px',
        border: '2px solid #4ec9b0',
        background: '#252526',
        color: '#4ec9b0',
        fontSize: '40px',
        textAlign: 'center',
      }}
    >
      {count}
    </span>
  )
}

const colors = {
  hook: '#569cd6',
  dim: '#858585',
}

/**
 * The same component as text, so the code on the slide reads well without
 * having to be the code that runs. Written as JSX and not one string, because
 * the whole point of the slide is that `useKeys` stands out.
 */
const CODE = (
  <>
    {'import { '}
    <span style={{ color: colors.hook }}>useKeys</span>
    {" } from 'boardkey'\n\n"}
    {'function Counter() {\n'}
    {'  const [count, setCount] = useState(0)\n\n'}
    {'  '}
    <span style={{ color: colors.hook, fontWeight: 'bold' }}>useKeys</span>
    {'({\n'}
    {'    arrowup: () => setCount((c) => c + 1),\n'}
    {'    arrowdown: () => setCount((c) => c - 1),\n'}
    {'  })\n\n'}
    {'  return <strong>{count}</strong>\n}'}
  </>
)

export default function Slide4() {
  const [showCode, setShowCode] = useState(false)

  useKeys({ c: () => setShowCode((on) => !on) })

  return (
    <div style={{ width: 'min(1200px, 92vw)' }}>
      <h1 style={{ color: '#569cd6' }}>Example</h1>
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, fontSize: '30px', lineHeight: 2 }}>
          Just call <span style={{ color: colors.hook }}>useKeys</span>
          <div style={{ marginTop: '50px', textAlign: 'center' }}>
            <div>
              <Counter />
            </div>
            <Hint fontSize="18px">
              <Key>↑</Key> <Key>↓</Key> to count up and down
              <br />
              <Key>c</Key> for the code
            </Hint>
          </div>
        </div>
        {showCode && (
          <pre
            style={{
              flex: 1,
              margin: 0,
              padding: '20px',
              background: '#252526',
              border: '1px solid #3a3a3a',
              fontSize: '15px',
              lineHeight: 1.6,
              overflowX: 'auto',
            }}
          >
            {CODE}
          </pre>
        )}
      </div>
    </div>
  )
}
