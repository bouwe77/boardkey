#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# Starts the examples app in ./examples. It has a Vite alias that points
# "boardkey" straight at ./src, so there is nothing to build first and a library
# change reloads in the browser right away.

EXAMPLES_DIR="$(dirname "$0")/examples"

if [ ! -d "$EXAMPLES_DIR/node_modules" ]; then
  echo "📦 Installing example dependencies..."
  npm install --prefix "$EXAMPLES_DIR"
fi

echo "🚀 Starting the examples app..."
npm run dev --prefix "$EXAMPLES_DIR"
