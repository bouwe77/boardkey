#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# Check argument
if [ -z "$1" ]; then
  echo "Error: Please provide a version bump type: major, minor, or patch"
  exit 1
fi

echo "🚀 Starting publish process..."

# 1. Install first, so the build cannot fail on a missing build tool halfway
#    through a release, after the version bump has already happened.
echo "📦 Installing dependencies..."
npm install

# 2. Run the tests, so a broken version never reaches NPM
echo "🧪 Running tests..."
npm test

# 3. Bump version
echo "🔖 Bumping version ($1)..."
npm version "$1"

# 4. Build
echo "🛠 Building..."
npm run build

# 5. Publish
echo "🚀 Publishing to NPM..."
npm publish --access public

# 6. Push tags (Only happens if publish succeeds)
echo "pushing git tags..."
git push --follow-tags

echo "✅ Boardkey published successfully!"
