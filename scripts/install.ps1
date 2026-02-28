param()
Set-StrictMode -Version Latest

Write-Host "Linking package globally for development (requires npm)..."
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm not found in PATH. Install Node.js/npm first."
  exit 1
}

& npm link

Write-Host "Installed 'supe' globally via npm link. Run 'supe --help' to verify."
exit 0
