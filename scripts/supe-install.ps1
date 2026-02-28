$ErrorActionPreference = "Stop"

Write-Host "supe installer (supe-install.ps1)"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm is required. Install Node.js/npm and re-run this script."
}

$packageName = "@supejs/supe"
$published = $false

try {
  npm view "$packageName@latest" | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $published = $true
  }
} catch {
  $published = $false
}

if ($published) {
  Write-Host "Installing published '$packageName' package globally..."
  npm install -g $packageName
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Global npm install failed for $packageName."
  }
  Write-Host "$packageName installed globally. Run 'supe --help' to verify."
  exit 0
}

Write-Host "Published package not available; attempting local global install (from repository root)."

npm install -g .
if ($LASTEXITCODE -ne 0) {
  Write-Error "Local global npm install failed."
}

Write-Host "Local install complete. Run 'supe --help' to verify."
exit 0
