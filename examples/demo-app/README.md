# React TUI Demo Application

This is a demonstration application showcasing the React TUI keyboard engine features.

## Features Demonstrated

- **Keyboard Navigation**: Arrow keys to control a counter
- **Modal Dialogs**: Epoch-based priority system (modal captures keys first)
- **Text Input with Mute Mode**: Special handling for text inputs with escape key support
- **Event Logging**: Real-time display of keyboard events
- **Multiple Key Bindings**: Ctrl+S, Ctrl+Q, H, ?, M, E, and more

## Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How to Use

1. Open the application in your browser
2. Try the keyboard shortcuts listed in the app:
   - Use arrow keys (↑/↓) to change the counter
   - Press 'M' to open a modal dialog
   - Press 'E' to activate text input
   - Press 'H' or '?' for help
   - Try Ctrl+S or Ctrl+Q to see save/quit events
3. Notice how keyboard shortcuts are disabled when:
   - A modal is open (only modal keys work)
   - Text input is active (only ESC works, other keys type)

## Architecture Highlights

- **Priority Epoch System**: Components mounted later get higher priority
- **Mute Mode**: Text inputs use mute mode to allow typing while preserving escape keys
- **No Stale Closures**: Uses refs to always call the latest version of handlers
- **Single Event Listener**: Efficient window-level keydown listener

## Directory Structure

```
demo-app/
├── src/
│   ├── main.tsx       # Entry point
│   └── App.tsx        # Main demo application
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies
```
