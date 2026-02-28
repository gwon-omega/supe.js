#!/usr/bin/env sh
set -e

echo "Making CLI entrypoints executable..."
chmod +x ./bin/* || true

echo "Linking package globally for development (requires npm)..."
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found in PATH. Install Node.js/npm first." >&2
  exit 1
fi

npm link

echo "Installed 'supe' globally via npm link. Run 'supe --help' to verify."

exit 0
