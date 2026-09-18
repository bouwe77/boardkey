import { useState } from 'react'
import { KeyboardProvider, useKeys } from 'boardkey'
import { Colors, pageColor, Panel, ListBox, Modal, Hint } from 'boardkey/tui'
import { THEMES, randomColors } from './themes'
import { Sidebar } from './Sidebar'

const FRAMEWORKS: Record<string, string[]> = {
  JavaScript: ['React', 'Vue', 'Svelte', 'Angular'],
  Python: ['Django', 'Flask', 'FastAPI'],
  Ruby: ['Rails', 'Sinatra', 'Hanami'],
  PHP: ['Laravel', 'Symfony', 'CodeIgniter'],
  Go: ['Gin', 'Echo', 'Fiber'],
}

const LANGUAGES = Object.keys(FRAMEWORKS)

// Fixed, so the two lists do not jump around when the options change
const LIST_WIDTH = '330px'

function Screen() {
  // Passed as a function, so it runs once instead of on every render
  const [colors, setColors] = useState<Colors>(randomColors)
  const [open, setOpen] = useState(true)
  const [modal, setModal] = useState(false)
  // Hides everything that explains the demo, leaving only the demo itself
  const [zen, setZen] = useState(true)

  // Two list boxes at once, so the app has to say which one owns the arrow
  // keys. Epochs cannot decide this: they rank by mount order, not by focus.
  const [focus, setFocus] = useState<'language' | 'framework'>('language')
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [framework, setFramework] = useState<string | null>(null)
  const [choice, setChoice] = useState<string | null>(null)

  // The same palette everywhere, so one choice themes the whole screen. Off in
  // zen mode: the sidebar that explains these keys is gone, and a key that
  // nothing on screen mentions should do nothing.
  useKeys(
    {
      ...Object.fromEntries(
        THEMES.map((theme) => [theme.key, () => setColors(theme.colors)]),
      ),
      r: () => setColors(randomColors()),
    },
    { active: !zen },
  )

  // Only while the dialog is closed, so "o" does nothing when it is already
  // open. The epoch is kept, so this does not outrank the dialog later on.
  useKeys({ o: () => setOpen(true) }, { active: !open })

  useKeys({ m: () => setModal(true) }, { active: !modal })

  // Always on, so they share one call. The examples header switches on function
  // keys now, so left and right are free for moving between the two lists.
  useKeys({
    arrowleft: () => setFocus('language'),
    arrowright: () => setFocus('framework'),
    z: () => setZen((on) => !on),
  })

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: pageColor(colors),
        color: colors.text,
      }}
    >
      {!zen && (
        <Sidebar
          colors={colors}
          onChange={setColors}
          onZen={() => setZen(true)}
        />
      )}

      <main
        style={{
          flex: 1,
          padding: '40px',
          maxWidth: '760px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {zen ? (
          <Hint onClick={() => setZen(false)} style={{ opacity: 0.7 }}>
            Z = leave zen mode
          </Hint>
        ) : (
          <p style={{ margin: 0, opacity: 0.7 }}>
            boardkey and the components from <code>boardkey/tui</code>,
            together: every box brings its own keys, and the one on top always
            wins. Every key here also works with the mouse, but that part is
            plain React in the components — boardkey only decides who owns the
            keyboard.
          </p>
        )}

        {open ? (
          <Panel
            title="Panel title"
            colors={colors}
            onClose={() => setOpen(false)}
          >
            <p>Some text here</p>
          </Panel>
        ) : (
          <Hint onClick={() => setOpen(true)}>O = open dialog</Hint>
        )}

        <Panel title="Framework wars" colors={colors}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              paddingTop: '16px',
            }}
          >
            <div
              style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}
            >
              <ListBox
                width={LIST_WIDTH}
                title="Which language?"
                options={LANGUAGES}
                colors={colors}
                active={focus === 'language'}
                onChange={(option) => {
                  setLanguage(option)
                  // The old pick was a framework of another language, so it is gone
                  setChoice(null)
                }}
                onSelect={() => setFocus('framework')}
                footer={
                  focus === 'language'
                    ? '↑ ↓ = move, → or enter = next list'
                    : '← = back to this list'
                }
              />
              {/* A new key for every language, so the selection starts over with
                  the options instead of pointing at a framework of the one before */}
              <ListBox
                key={language}
                width={LIST_WIDTH}
                title={`Which ${language} framework?`}
                options={FRAMEWORKS[language]}
                colors={colors}
                active={focus === 'framework'}
                onChange={setFramework}
                onSelect={(option) => setChoice(`${option}, in ${language}`)}
                footer={
                  focus === 'framework'
                    ? '↑ ↓ = move, enter = pick'
                    : '→ = focus this list'
                }
              />
            </div>

            <Panel title="The hill I'd die on" colors={colors}>
              <p style={{ margin: 0 }}>
                {choice ??
                  `No hill yet. Currently eyeing: ${framework}, in ${language}.`}
              </p>
            </Panel>
          </div>
        </Panel>

        <Panel title="Choose a color set in a modal" colors={colors}>
          <Hint onClick={() => setModal(true)}>M = Open the modal</Hint>
        </Panel>

        {modal && (
          <Modal onClose={() => setModal(false)}>
            <ListBox
              title="Color sets"
              options={THEMES.map((theme) => theme.label)}
              colors={colors}
              onClose={() => setModal(false)}
              onSelect={(label) => {
                const theme = THEMES.find((t) => t.label === label)
                if (theme) setColors(theme.colors)
                setModal(false)
              }}
            />
          </Modal>
        )}
      </main>
    </div>
  )
}

export default function Tui() {
  return (
    <KeyboardProvider
      onUnhandled={(pressed) =>
        console.log(`boardkey: nothing handles "${pressed}"`)
      }
    >
      <Screen />
    </KeyboardProvider>
  )
}
