# boardkey

Keyboard handling for React. It gives you keybindings that respect nesting, so a
modal or a panel can take over keys from the screen behind it, and a mute mode so
text inputs keep working.

This library **only handles keyboard input**. It renders no UI and ships no styles.
What your app looks like is up to you.

## Features

- **Priority Epoch System**: Nested components with automatic priority resolution
- **Single Event Listener**: One `keydown` listener with efficient key normalization
- **Mute Mode**: Special mode for text inputs while preserving escape keys
- **Hot-Swappable Handlers**: Uses refs to avoid re-registration when handlers change
- **No UI, No Styles**: Keyboard logic only, so it fits any styling approach

## Installation

```bash
npm install boardkey
```

Requires React 18 or newer. The package is ESM only.

## Quick Start

```tsx
import { KeyboardProvider, useKeys } from 'boardkey'

function App() {
  return (
    <KeyboardProvider>
      <MyApp />
    </KeyboardProvider>
  )
}

function MyApp() {
  const [count, setCount] = React.useState(0)

  useKeys({
    'ctrl+s': () => console.log('Save!'),
    arrowup: () => setCount((c) => c + 1),
    arrowdown: () => setCount((c) => c - 1),
    escape: null, // NOOP - just prevent default
  })

  return <div>Counter: {count}</div>
}
```

## Core Concepts

### KeyboardProvider

The `KeyboardProvider` is the core of the keyboard engine. It maintains:

- **Registry**: A Map of all active keybindings
- **nextEpoch**: A counter that increments for each new component registration (higher = higher priority)
- **isMuted**: Whether "mute mode" is on for text inputs. It is on while at
  least one component asks for it, so a modal on top of a text input does not
  unmute the input when it closes.

```tsx
<KeyboardProvider>
  <YourApp />
</KeyboardProvider>
```

### useKeys Hook

Register keybindings for a component:

```tsx
useKeys(bindings: KeyMap, options?: { active?: boolean })
```

**Key Format**: Keys are normalized to the format `[ctrl+][alt+][shift+]key`:

- `"ctrl+s"` - Control/Command + S
- `"alt+shift+arrowup"` - Alt + Shift + Arrow Up
- `"enter"` - Enter key
- `"escape"` - Escape key

**Handler Types**:

- Function: `(event: KeyboardEvent) => void` - Execute custom logic
- `null` - NOOP (just prevent default browser behavior)

**Example**:

```tsx
function MyComponent() {
  useKeys({
    'ctrl+s': (e) => save(),
    'ctrl+q': (e) => quit(),
    escape: null, // Prevent default only
  })

  return <div>My Component</div>
}
```

### Priority System (Epochs)

When multiple components register the same keybinding, the keyboard engine uses epochs to resolve conflicts:

1. Each component gets a unique epoch when it mounts (higher numbers = mounted later)
2. When a key is pressed, all matching handlers are found
3. The handler with the highest epoch wins

Epochs are claimed while rendering, which runs from parent to child, so a nested
component always ranks above its ancestors. A modal opened later ranks above
everything that was already there.

The epoch is claimed once per mount, so `active` does not affect priority. A
component that switches its bindings off and on again keeps its original epoch,
and does not jump above components that stayed active. Only mounting grants a
new, higher epoch.

### useMute Hook

The `useMute` hook enables "mute mode" for text inputs:

```tsx
function TextInput() {
  const [isEditing, setIsEditing] = useState(false)

  // Enable mute mode when editing
  useMute(isEditing)

  useKeys(
    {
      escape: () => setIsEditing(false),
    },
    { active: isEditing },
  )

  return isEditing ? (
    <input type="text" />
  ) : (
    <div onClick={() => setIsEditing(true)}>Click to edit</div>
  )
}
```

When muted:

- Only the component with the **highest epoch** can handle keys
- This allows escape keys to work while typing
- Regular typing goes to the input element

## API Reference

### KeyboardProvider

```tsx
interface KeyboardProviderProps {
  children: React.ReactNode
  onUnhandled?: (key: string, event: KeyboardEvent) => void
}
```

`onUnhandled` is called when a key is pressed that no active registration
handles, with the normalized key string (e.g. `"ctrl+s"`). Use it for debugging,
or to tell the user a key does nothing:

```tsx
<KeyboardProvider onUnhandled={(key) => console.log(`${key} does nothing`)}>
  <YourApp />
</KeyboardProvider>
```

It is not called while muted, because a text input owns the keyboard then: those
keys are being typed, not left unhandled.

### useKeys

```tsx
function useKeys(bindings: KeyMap, options?: UseKeysOptions): void

type KeyMap = {
  [key: string]: ((event: KeyboardEvent) => void) | null
}

interface UseKeysOptions {
  active?: boolean // Default: true
}
```

### useMute

```tsx
function useMute(active?: boolean): void
```

Enables "mute mode" when `active` is true (default). In mute mode, only the component with the highest epoch can handle keyboard events.

### useIsMuted

```tsx
function useIsMuted(): boolean
```

Whether mute mode is on, so a text input owns the keyboard. Useful for showing
or hiding a shortcut hint.

## Usage patterns

### Modal Dialog

```tsx
function Modal({ onClose }) {
  // Modal gets a higher epoch than parent
  useKeys({
    escape: onClose,
    'ctrl+w': onClose,
  })

  return <div className="modal">Modal Content</div>
}
```

### Nested Navigation

```tsx
function App() {
  const [showPanel, setShowPanel] = useState(false)

  useKeys({
    'ctrl+p': () => setShowPanel(true),
  })

  return (
    <div>
      Main App
      {showPanel && <SidePanel onClose={() => setShowPanel(false)} />}
    </div>
  )
}

function SidePanel({ onClose }) {
  // Panel keys override app keys
  useKeys({
    escape: onClose,
    'ctrl+p': onClose, // Same key, but higher priority
  })

  return <div>Side Panel</div>
}
```

## Architecture

### Key Normalization

Internally, every KeyboardEvent is converted to a consistent format:

```
[ctrl+][alt+][shift+]key
```

Modifiers are added in a consistent order, and the key is lowercased.

### Event Flow

1. User presses a key
2. Window keydown listener captures it
3. Key is normalized to a string (e.g., "ctrl+s")
4. If muted: Only check highest-epoch component
5. If not muted: Find all matching handlers
6. Sort handlers by epoch (descending)
7. Execute the highest-epoch handler
8. Call `preventDefault()` and stop

### Why Refs?

The `useKeys` hook stores bindings in a `useRef` to avoid re-registering the event listener when handler functions change. This means:

- ✅ No performance overhead from re-registration
- ✅ Always calls the latest version of handlers
- ✅ No stale closures

## Examples

One app in `examples/` serves both examples. The header switches between them,
and each one has its own URL.

- [`examples/hangman`](examples/hangman) (`/hangman`) — a game of hangman.
  Familiar rules, so the keyboard behaviour is the only new thing: 26 letter
  bindings that disappear as you use them, a muted text input for guessing the
  whole word, and modals that outrank the board.
- [`examples/demo-app`](examples/demo-app) (`/demo`) — the bare mechanics: a
  counter, a modal and a text input, with no game around them.

Run them with `npm run dev` or `./dev.sh`. Both log what boardkey does to the
browser console.

## Development

```bash
# Install dependencies
npm install

# Start the example app (see Examples above)
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## Releasing

`publish.sh` installs, tests, bumps the version, builds, publishes to NPM and
pushes the git tag:

```bash
./publish.sh patch   # or minor, or major
```

## License

MIT
