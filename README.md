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

A key set to `null` still counts as handled: it stops there, so it never reaches
a component with a lower epoch and never reaches the browser. Leaving the key
out of the map is the opposite: the key falls through to the next component that
does bind it, or to the browser if nobody does.

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

One call handles as many keys as you like, so a component normally needs only
one. Use a second call when a group of keys has its own `active` flag:

```tsx
function Screen({ open }) {
  useKeys({ o: openDialog }, { active: !open })
  useKeys({ arrowup: up, arrowdown: down })
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

Each `useKeys` call claims its own epoch, not each component. Two calls in the
same component are two registrations, and the second one ranks above the first.

The epoch is claimed once per mount, so `active` does not affect priority. A
component that switches its bindings off and on again keeps its original epoch,
and does not jump above components that stayed active. Only mounting grants a
new, higher epoch.

### When do I need `active`?

Epochs always resolve a conflict, on their own. The question is only whether
mount order is the answer you wanted.

**Stacking: the library handles it.** A modal, a panel or a dialog mounts later,
or sits deeper in the tree, so it gets a higher epoch than the screen behind it.
Mount order is exactly the intent here. Write your bindings and do nothing else.

**Siblings: you handle it.** Two components are on screen at the same time and
both bind `arrowup` — a sidebar and a main list, say. The epoch still decides,
but by mount order, which means nothing here: whichever rendered first loses
every time, even when the user is working in it. The library cannot know which
one counts right now, so you tell it:

```tsx
<Sidebar active={focus === 'sidebar'} />
<MainList active={focus === 'list'} />
```

```tsx
function Sidebar({ active }) {
  useKeys({ arrowup: up, arrowdown: down }, { active })
}
```

Use `active` for the same reason when a component has modes, and its keys only
make sense in one of them.

**Takeover is per key, not per component.** A component higher up the stack only
takes over the keys it actually lists. A modal that binds `escape` does not stop
`arrowup` from reaching the screen behind it. If you want a key to stop there,
bind it to `null`: that counts as handled and goes no further.

It is also per `useKeys` call, not per component. Two calls in one component are
two registrations, each with its own epoch and its own `active` flag.

**Mute is the exception.** While a component calls `useMute`, only the
highest-epoch registration is checked at all. Keys it does not bind stop there
too, instead of falling through. So mute takes over the whole keyboard, and
epochs alone take over only the listed keys. Use mute when a text input needs
every key; use plain epochs when the layers below should keep their own.

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

## TUI components

If you like the keyboard-first feel, `boardkey/tui` ships a small set of retro
terminal-style components built on these hooks: a panel, a list box and a
modal, each with its keys already wired. A modal outranks the screen behind it
for free, because it is the same registry and the same epochs.

```tsx
import { Panel, ListBox, Modal } from 'boardkey/tui'
```

It is a separate entry point, so it costs nothing if you do not use it. See
[`src/tui/README.md`](src/tui/README.md).

## Examples

One app in `examples/` serves every example. The header switches between them,
with a function key or the mouse, and each one has its own URL.

- [`examples/tui`](examples/tui) (`/tui`) — the components from
  [`boardkey/tui`](src/tui/README.md), with a sidebar for changing their
  colours.
- [`examples/hangman`](examples/hangman) (`/hangman`) — a game of hangman.
  Familiar rules, so the keyboard behaviour is the only new thing: 26 letter
  bindings that disappear as you use them, a muted text input for guessing the
  whole word, and modals that outrank the board.
- [`examples/sandbox`](examples/sandbox) (`/sandbox`) — not a showcase but a
  test bench: odd cases and edge cases, tried in a real browser. A counter, a
  modal and a text input for now, and whatever else needs checking later.

Run them with `npm run dev` or `./dev.sh`. They log what boardkey does to the
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
