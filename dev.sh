#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# Starts the demo app in ./examples/demo-app. The demo has a Vite alias that
# points "boardkey" straight at ./src, so there is nothing to build first and a
# library change reloads in the browser right away.

DEMO_DIR="$(dirname "$0")/examples/demo-app"

if [ ! -d "$DEMO_DIR/node_modules" ]; then
  echo "📦 Installing demo dependencies..."
  npm install --prefix "$DEMO_DIR"
fi

echo "🚀 Starting the demo app..."
npm run dev --prefix "$DEMO_DIR"
