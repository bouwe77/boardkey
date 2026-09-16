import { useState } from 'react'
import { KeyboardProvider, useKeys, useMute } from 'boardkey'

const FILE_NAME = 'boardkey.txt'

const WELCOME = [
  'boardkey vi',
  '',
  'A tiny vi clone. Only the modes, no editing commands.',
  '',
  'h j k l   move the cursor',
  'i         insert mode, Escape gets you back',
  ':         command line: :w saves, :q starts over',
  '',
]

const colors = {
  background: '#1e1e1e',
  text: '#d4d4d4',
  status: '#569cd6',
  cursor: '#4ec9b0',
  error: '#f48771',
  dim: '#858585',
}

/**
 * The line you are typing in, as a real input. It mounts on top of the
 * normal-mode bindings, so its epoch is the highest one, and that is exactly
 * what useMute needs: while muted, only the highest-epoch registration handles
 * keys. So "h" types an h instead of moving the cursor, and Escape still leaves
 * insert mode.
 */
function InsertLine({
  active,
  value,
  onChange,
  onNewLine,
  onLeave,
}: {
  active: boolean
  value: string
  onChange: (line: string, col: number) => void
  onNewLine: () => void
  onLeave: () => void
}) {
  useMute(active)

  useKeys(
    {
      escape: onLeave,
      enter: onNewLine,
    },
    { active },
  )

  if (!active) return null

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value, e.target.selectionStart ?? 0)}
      // Clicking elsewhere would leave the app muted with no visible input
      onBlur={onLeave}
      autoFocus
      spellCheck={false}
      style={{
        display: 'block',
        width: '100%',
        padding: 0,
        margin: 0,
        border: 'none',
        outline: 'none',
        background: colors.background,
        color: colors.text,
        font: 'inherit',
        caretColor: colors.cursor,
      }}
    />
  )
}

/** The `:` line. Muted for the same reason as the insert line. */
function CommandLine({
  active,
  onRun,
  onLeave,
}: {
  active: boolean
  onRun: (command: string) => void
  onLeave: () => void
}) {
  const [value, setValue] = useState('')

  useMute(active)

  useKeys(
    {
      escape: () => {
        setValue('')
        onLeave()
      },
      enter: () => {
        onRun(value.trim())
        setValue('')
      },
    },
    { active },
  )

  if (!active) return null

  return (
    <div style={{ display: 'flex' }}>
      <span>:</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          setValue('')
          onLeave()
        }}
        autoFocus
        spellCheck={false}
        style={{
          flex: 1,
          padding: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: colors.text,
          font: 'inherit',
          caretColor: colors.cursor,
        }}
      />
    </div>
  )
}

function Editor({
  message,
  setMessage,
}: {
  message: string
  setMessage: (message: string) => void
}) {
  const [lines, setLines] = useState(WELCOME)
  const [row, setRow] = useState(0)
  const [col, setCol] = useState(0)
  const [mode, setMode] = useState<'normal' | 'insert' | 'command'>('normal')

  // In vi the cursor sits on a character, so the last column is length - 1
  const clamp = (line: string, wanted: number) =>
    Math.max(0, Math.min(wanted, Math.max(0, line.length - 1)))

  const moveRow = (step: number) => {
    const next = Math.max(0, Math.min(row + step, lines.length - 1))
    setRow(next)
    setCol((current) => clamp(lines[next], current))
  }

  const setLine = (index: number, text: string) =>
    setLines((current) => current.map((l, i) => (i === index ? text : l)))

  // Normal mode. Every binding lives behind `active`, so while you type none of
  // these keys exist at all: they are not registered, not just ignored.
  useKeys(
    {
      h: () => setCol((c) => Math.max(0, c - 1)),
      l: () => setCol((c) => clamp(lines[row], c + 1)),
      j: () => moveRow(1),
      k: () => moveRow(-1),
      i: () => {
        setMessage('')
        setMode('insert')
      },
      // Boardkey keeps shift as a modifier but reports the key as it was
      // typed, so a US layout sends "shift+:" and a layout with its own colon
      // key sends ":". Bind both.
      ':': () => setMode('command'),
      'shift+:': () => setMode('command'),
    },
    { active: mode === 'normal' },
  )

  const save = (name: string) => {
    // ponytail: a download, so every :w drops a new copy in the downloads
    // folder. showSaveFilePicker could overwrite the same file, but Firefox and
    // Safari do not have it.
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const run = (input: string) => {
    setMode('normal')

    // vi splits a command from its argument at the first space, as in
    // ":w other.txt"
    const [command, ...rest] = input.split(' ')
    const argument = rest.join(' ').trim()

    if (command === 'w' || command === 'wq') {
      // Like vi, a name here writes a copy: the file you are editing keeps its
      // own name, so the next plain :w goes back to it. The command that does
      // rename the buffer is :saveas, which this demo does not have.
      const name = argument || FILE_NAME
      save(name)
      setMessage(`"${name}" ${lines.length}L written`)
    }

    if (command === 'q' || command === 'wq') {
      setLines([''])
      setRow(0)
      setCol(0)
      if (command === 'q') setMessage('')
      return
    }

    if (command !== 'w') {
      setMessage(`E492: Not an editor command: ${input}`)
    }
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 53px)',
        display: 'flex',
        flexDirection: 'column',
        background: colors.background,
        color: colors.text,
        padding: '10px 20px',
      }}
    >
      <pre style={{ flex: 1, margin: 0, whiteSpace: 'pre-wrap' }}>
        {lines.map((line, index) => {
          if (mode === 'insert' && index === row) {
            return (
              <InsertLine
                key={index}
                active
                value={line}
                onChange={(text, caret) => {
                  setLine(index, text)
                  setCol(caret)
                }}
                onNewLine={() => {
                  setLines((current) => [
                    ...current.slice(0, index + 1),
                    '',
                    ...current.slice(index + 1),
                  ])
                  setRow(index + 1)
                  setCol(0)
                }}
                onLeave={() => {
                  setMode('normal')
                  setCol((c) => clamp(line, c))
                }}
              />
            )
          }

          const isCursor = mode !== 'insert' && index === row

          return (
            <div key={index}>
              {isCursor ? (
                <>
                  {line.slice(0, col)}
                  <span
                    style={{
                      background: colors.cursor,
                      color: colors.background,
                    }}
                  >
                    {line[col] ?? ' '}
                  </span>
                  {line.slice(col + 1)}
                </>
              ) : (
                // A blank line still needs a line box
                line || ' '
              )}
            </div>
          )
        })}
      </pre>

      <div style={{ borderTop: `1px solid #3a3a3a`, paddingTop: '6px' }}>
        <CommandLine
          active={mode === 'command'}
          onRun={run}
          onLeave={() => setMode('normal')}
        />
        {mode !== 'command' && (
          <div style={{ display: 'flex', gap: '20px' }}>
            <strong
              style={{
                color: mode === 'insert' ? colors.cursor : colors.status,
              }}
            >
              {mode === 'insert' ? '-- INSERT --' : FILE_NAME}
            </strong>
            <span
              style={{
                flex: 1,
                color: message.startsWith('E') ? colors.error : colors.dim,
              }}
            >
              {message}
            </span>
            <span style={{ color: colors.dim }}>
              {row + 1},{col + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Holding a modifier on its own is not an interesting event
const MODIFIER_KEYS = ['shift', 'control', 'alt', 'meta']

export default function App() {
  // Owned here, because the status line shows both what a command said and what
  // the provider reports about a key nothing handles.
  const [message, setMessage] = useState('')

  return (
    <KeyboardProvider
      onUnhandled={(pressed, event) => {
        if (MODIFIER_KEYS.includes(event.key.toLowerCase())) return
        setMessage(`E349: no handler for "${pressed}"`)
      }}
    >
      <Editor message={message} setMessage={setMessage} />
    </KeyboardProvider>
  )
}
