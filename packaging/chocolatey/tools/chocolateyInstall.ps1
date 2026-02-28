$ErrorActionPreference = 'Stop'

# Chocolatey install script that delegates to npm. This is a minimal draft.
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Throw 'npm is required. Install Node.js before installing supe via Chocolatey.'
}

Write-Host 'Installing @supejs/supe via npm...'
npm install -g @supejs/supe

Write-Host 'supe installed via npm. You may need to restart your shell.'
