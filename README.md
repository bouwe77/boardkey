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
- **isMuted**: A flag to enable "mute mode" for text inputs

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

This naturally handles nested components - a modal opened later will have priority over the parent.

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
}
```

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

### getEventString

```tsx
function getEventString(event: KeyboardEvent): string
```

Normalizes a keyboard event to a standard string format.

## Examples

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

The `getEventString` function converts browser KeyboardEvents to a consistent format:

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

## Development

```bash
# Install dependencies
npm install

# Start the demo app in examples/demo-app
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
