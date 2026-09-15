import React, { useState } from 'react'
import { KeyboardProvider, useKeys, useMute } from 'boardkey'

// Keep these between 4 and 8 letters, so the game stays easy
const WORDS = [
  'KEYBOARD',
  'SHORTCUT',
  'MODIFIER',
  'ESCAPE',
  'REGISTRY',
  'EPOCH',
  'BINDING',
  'HANDLER',
  'PROVIDER',
  'BROWSER',
  'TERMINAL',
  'PRIORITY',
  'LISTENER',
  'MODAL',
  'SCOPE',
  'FOCUS',
  'ELEPHANT',
  'MOUNTAIN',
  'PUMPKIN',
  'CACTUS',
  'JUKEBOX',
  'WAFFLE',
  'GLACIER',
  'TROMBONE',
]

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

const MAX_WRONG = 6

// One frame per wrong guess, so GALLOWS[wrong.length] is the current drawing
const GALLOWS = [
  ' +---+\n |   |\n     |\n     |\n     |\n=======',
  ' +---+\n |   |\n O   |\n     |\n     |\n=======',
  ' +---+\n |   |\n O   |\n |   |\n     |\n=======',
  ' +---+\n |   |\n O   |\n/|   |\n     |\n=======',
  ' +---+\n |   |\n O   |\n/|\\  |\n     |\n=======',
  ' +---+\n |   |\n O   |\n/|\\  |\n/    |\n=======',
  ' +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n=======',
]

function pickWord(exclude?: string) {
  const options = WORDS.filter((word) => word !== exclude)
  return options[Math.floor(Math.random() * options.length)]
}

const panel: React.CSSProperties = {
  padding: '20px',
  background: '#252526',
  border: '2px solid #3794ff',
  marginBottom: '20px',
}

const kbd: React.CSSProperties = {
  background: '#1e1e1e',
  padding: '2px 6px',
  border: '1px solid #3794ff',
  color: '#4ec9b0',
}

/**
 * The "I know the word" input. It stays mounted so it keeps its epoch, and it
 * is a child of the board, so it outranks it while active.
 *
 * useMute is what makes this work: while the input is open, only the
 * highest-epoch registration handles keys. Typing "A" types a letter instead
 * of guessing one, and Escape still gets you out.
 */
function WordGuess({
  active,
  onCancel,
  onSubmit,
}: {
  active: boolean
  onCancel: () => void
  onSubmit: (word: string) => void
}) {
  const [value, setValue] = useState('')

  useMute(active)

  useKeys(
    {
      escape: () => {
        setValue('')
        onCancel()
      },
      enter: () => {
        if (!value.trim()) return
        onSubmit(value.trim().toUpperCase())
        setValue('')
      },
    },
    { active },
  )

  if (!active) return null

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      // Losing focus lifts mute mode too, otherwise the letter keys stay muted
      // after clicking somewhere else
      onBlur={() => {
        setValue('')
        onCancel()
      }}
      autoFocus
      placeholder="Type the whole word, ENTER to submit, ESC to cancel"
      style={{
        width: '100%',
        padding: '8px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        border: '2px solid #dcdcaa',
        fontFamily: 'inherit',
        fontSize: 'inherit',
      }}
    />
  )
}

/**
 * Mounted later than the board, so it gets a higher epoch. It binds ctrl+h and
 * escape, which the board also binds: the newest registration wins.
 */
function HelpModal({ onClose }: { onClose: () => void }) {
  useKeys({
    escape: onClose,
    'ctrl+h': onClose,
  })

  return (
    <Overlay>
      <h2 style={{ margin: '0 0 15px 0', color: '#0078d4' }}>⌨️ Keys</h2>
      <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
        <li>
          <kbd style={kbd}>A</kbd> … <kbd style={kbd}>Z</kbd> guess a letter.
          Guessed letters are removed from the keymap, so pressing one again is
          reported as unhandled in the console.
        </li>
        <li>
          <kbd style={kbd}>Enter</kbd> guess the whole word. That input uses{' '}
          <code>useMute</code>, so letters are typed, not guessed.
        </li>
        <li>
          <kbd style={kbd}>Ctrl+H</kbd> open and close this help. The board
          binds the same key, but this modal has a higher epoch.
        </li>
        <li>
          <kbd style={kbd}>Ctrl+N</kbd> give up and get a new word. It needs a
          modifier, because the game uses every letter key.
        </li>
        <li>
          <kbd style={kbd}>Esc</kbd> close whatever is open. The board binds it
          to <code>null</code>, so with nothing open it does nothing at all.
        </li>
      </ul>
    </Overlay>
  )
}

/**
 * Also mounted later than the board, so Enter here starts a new game instead of
 * opening the word input.
 */
function GameOver({
  won,
  word,
  onNewGame,
}: {
  won: boolean
  word: string
  onNewGame: () => void
}) {
  useKeys({
    enter: onNewGame,
    escape: null,
  })

  return (
    <Overlay>
      <h2
        style={{
          margin: '0 0 10px 0',
          color: won ? '#4ec9b0' : '#f48771',
          textAlign: 'center',
        }}
      >
        {won ? '🎉 You got it!' : '💀 Out of guesses'}
      </h2>
      <p
        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '4px' }}
      >
        {word}
      </p>
      <p style={{ textAlign: 'center', color: '#858585', fontSize: '13px' }}>
        Press <kbd style={kbd}>Enter</kbd> or <kbd style={kbd}>Ctrl+N</kbd> for
        a new word
      </p>
    </Overlay>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          padding: '30px',
          background: '#252526',
          border: '2px solid #0078d4',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          maxWidth: '560px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function Game() {
  const [word, setWord] = useState(pickWord)
  // Single letters, plus any failed whole-word guess
  const [guessed, setGuessed] = useState<string[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [guessingWord, setGuessingWord] = useState(false)

  // Entries longer than one character are failed word guesses, always wrong
  const wrong = guessed.filter((g) => g.length > 1 || !word.includes(g))
  const won = [...word].every((letter) => guessed.includes(letter))
  const lost = wrong.length >= MAX_WRONG
  const over = won || lost

  const newGame = () => {
    setWord((current) => pickWord(current))
    setGuessed([])
    setGuessingWord(false)
  }

  const guessLetter = (letter: string) =>
    setGuessed((current) => [...current, letter])

  const guessWord = (attempt: string) => {
    setGuessingWord(false)
    // A correct guess reveals every letter, a wrong one costs a life
    setGuessed((current) =>
      attempt === word ? [...current, ...word] : [...current, attempt],
    )
  }

  // The letters. A guessed letter is simply not in the keymap anymore, so
  // pressing it again reaches onUnhandled instead of a handler.
  useKeys(
    Object.fromEntries(
      ALPHABET.filter((letter) => !guessed.includes(letter)).map((letter) => [
        letter.toLowerCase(),
        () => guessLetter(letter),
      ]),
    ),
    // Mute already covers the word input, so `active` only has to handle the
    // two cases without a text field
    { active: !over && !showHelp },
  )

  // The commands. Always active, so the help modal has something to outrank.
  useKeys({
    'ctrl+n': newGame,
    'ctrl+h': () => setShowHelp(true),
    enter: () => setGuessingWord(true),
    escape: null, // NOOP: nothing to close
  })

  return (
    <main
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1
          style={{ margin: '0 0 10px 0', color: '#0078d4', fontSize: '32px' }}
        >
          🪢 boardkey hangman
        </h1>
        <p style={{ color: '#858585', fontSize: '14px', margin: 0 }}>
          Just start typing letters. Open the browser console to watch what
          boardkey does with every key.
        </p>
      </div>

      <div
        style={{ ...panel, display: 'flex', gap: '30px', alignItems: 'center' }}
      >
        <pre
          style={{
            margin: 0,
            color: '#ce9178',
            fontSize: '16px',
            lineHeight: 1.3,
          }}
        >
          {GALLOWS[Math.min(wrong.length, MAX_WRONG)]}
        </pre>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '28px',
              letterSpacing: '6px',
              color: '#4ec9b0',
              wordBreak: 'break-all',
            }}
          >
            {[...word]
              .map((letter) => (guessed.includes(letter) ? letter : '_'))
              .join(' ')}
          </div>
          <p
            style={{ color: '#858585', fontSize: '13px', margin: '10px 0 0 0' }}
          >
            {MAX_WRONG - wrong.length} guesses left
            {wrong.length > 0 && <> · wrong: {wrong.join(', ')}</>}
          </p>
        </div>
      </div>

      <div style={{ ...panel, borderColor: '#4ec9b0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ALPHABET.map((letter) => {
            const used = guessed.includes(letter)
            return (
              <span
                key={letter}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #3794ff',
                  background: '#1e1e1e',
                  color: used
                    ? word.includes(letter)
                      ? '#4ec9b0'
                      : '#f48771'
                    : '#d4d4d4',
                  opacity: used ? 0.4 : 1,
                }}
              >
                {letter}
              </span>
            )
          })}
        </div>
      </div>

      <div style={{ ...panel, borderColor: '#dcdcaa', marginBottom: 0 }}>
        <WordGuess
          active={guessingWord && !over}
          onCancel={() => setGuessingWord(false)}
          onSubmit={guessWord}
        />
        {!guessingWord && (
          <p style={{ margin: 0, fontSize: '14px' }}>
            <kbd style={kbd}>Enter</kbd> guess the whole word ·{' '}
            <kbd style={kbd}>Ctrl+N</kbd> new word ·{' '}
            <kbd style={kbd}>Ctrl+H</kbd> help
          </p>
        )}
      </div>

      {over && <GameOver won={won} word={word} onNewGame={newGame} />}
      {/* Rendered last, so help outranks the game-over overlay and Escape
          always closes the thing on top */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </main>
  )
}

// Holding a modifier on its own is not an interesting event
const MODIFIER_KEYS = ['shift', 'control', 'alt', 'meta']

export default function App() {
  return (
    <KeyboardProvider
      onUnhandled={(pressed, event) => {
        if (MODIFIER_KEYS.includes(event.key.toLowerCase())) return
        console.log(`boardkey: nothing handles "${pressed}"`)
      }}
    >
      <Game />
    </KeyboardProvider>
  )
}
