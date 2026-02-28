#!/usr/bin/env sh
set -e

# CI helper: create an executable no-extension installer and symlink for artifacts
if [ -f scripts/supe-install ]; then
  chmod +x scripts/supe-install
fi

if [ -f scripts/supe-install.sh ]; then
  chmod +x scripts/supe-install.sh
  # create a symlink named supe-install (if supported)
  if [ ! -e scripts/supe-install ] && command -v ln >/dev/null 2>&1; then
    ln -s supe-install.sh scripts/supe-install || true
  fi
fi

echo "CI symlinks prepared."
