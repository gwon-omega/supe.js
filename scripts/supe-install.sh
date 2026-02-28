#!/usr/bin/env sh
set -e

echo "supe installer (supe-install.sh)"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js/npm and re-run this script." >&2
  exit 1
fi

# Prefer installing published scoped package from npm if available
if npm view @supejs/supe@latest >/dev/null 2>&1; then
  echo "Installing published '@supejs/supe' package globally..."
  if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
      sudo npm install -g @supejs/supe
    else
      npm install -g @supejs/supe
    fi
  else
    npm install -g @supejs/supe
  fi
  echo "@supejs/supe installed globally. Run 'supe --help' to verify."
  exit 0
fi

echo "Published package not available; attempting local global install (from repository root)."
chmod +x ./bin/* || true
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    sudo npm install -g .
  else
    npm install -g .
  fi
else
  npm install -g .
fi

echo "Local install complete. Run 'supe --help' to verify."

exit 0
