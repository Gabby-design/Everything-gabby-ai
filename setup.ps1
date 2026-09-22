# everything-gabby-ai - one-line bootstrap for Windows PowerShell 5.1+ / PowerShell 7
#   irm https://raw.githubusercontent.com/Gabby-design/everything-gabby-ai/main/setup.ps1 | iex

param(
  [string]$Owner = "",
  [string]$Home = ".agents",
  [switch]$Yes = $false
)

$ErrorActionPreference = "Stop"

# 1. Check Node >= 18
try {
  $nodeVer = node --version
  $major = [int]($nodeVer -replace '^v','' -split '.')[0]
  if ($major -lt 18) {
    Write-Error "Node.js 18+ required (found $nodeVer). Install from https://nodejs.org"
    exit 1
  }
} catch {
  Write-Error "Node.js 18+ required but node was not found on PATH. Install from https://nodejs.org"
  exit 1
}

# 2. Check Git
try {
  git --version | Out-Null
} catch {
  Write-Error "Git required but not found on PATH. Install from https://git-scm.com"
  exit 1
}

$dest = Join-Path $env:USERPROFILE $Home
$repoUrl = "https://github.com/Gabby-design/everything-gabby-ai.git"

if (-not (Test-Path $dest)) {
  Write-Host "[+] Cloning everything-gabby-ai into $dest..."
  git clone $repoUrl $dest
} else {
  Write-Host "[ok] $dest already exists."
}

# 3. Run bin/setup.js
$setupArgs = @()
if ($Owner) { $setupArgs += "--owner", $Owner }
if ($Home -ne ".agents") { $setupArgs += "--home", $Home }
if ($Yes) { $setupArgs += "--yes" }

node (Join-Path $dest "bin/setup.js") @setupArgs
