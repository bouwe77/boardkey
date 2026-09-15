#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

if [ -z "$1" ]; then
  echo "Error: Please provide a version bump type: major, minor, or patch"
  exit 1
fi

# npm runs the tests through "preversion" and the build through "prepublishOnly".
npm version "$1"
npm publish --access public
git push --follow-tags
