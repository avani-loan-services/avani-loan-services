#!/usr/bin/env pwsh
param(
  [Parameter(Mandatory=$false)][string]$Owner,
  [Parameter(Mandatory=$false)][string]$Repo,
  [Parameter(Mandatory=$false)][string]$Secrets
)

function PromptIfEmpty($varName, [string]$current) {
  if ($null -ne $current -and $current -ne '') { return $current }
  return Read-Host "Enter $varName"
}

if (-not $Owner) { $Owner = PromptIfEmpty "GitHub owner (username or org)" $env:GITHUB_OWNER }
if (-not $Repo)  { $Repo  = PromptIfEmpty "GitHub repo name" $env:GITHUB_REPO }

Write-Host "This will upload selected environment variables as GitHub Actions secrets to $Owner/$Repo." -ForegroundColor Cyan

$loadDotEnv = $false
if (Test-Path .env) {
  $ans = Read-Host ".env file found — do you want to load env vars from it? (y/N)"
  if ($ans -match '^[Yy]') { $loadDotEnv = $true }
}

if ($loadDotEnv) {
  Get-Content .env | ForEach-Object {
    if ($_ -match '^(\s*#|\s*$)') { return }
    $parts = $_ -split '=',2
    if ($parts.Count -eq 2) {
      $name = $parts[0].Trim()
      $value = $parts[1]
      $Env:$name = $value
    }
  }
  Write-Host ".env loaded into this session (temporary)." -ForegroundColor Green
}

if (-not $Secrets) {
  Write-Host "Defaults: VERCEL_TOKEN, VERCEL_PROJECT, SITE_URL, VITE_HUBSPOT_FORM_ID, VITE_HUBSPOT_PORTAL_ID, VITE_HUBSPOT_REGION, PABBLY_CONNECT_URL, PICKY_ASSIST_URL, GOOGLE_WEB_APP_URL" -ForegroundColor Yellow
}

# Read GH token securely
$bstr = $null
$ghTokenPlain = $null
try {
  $ghTokenSecure = Read-Host "Enter GitHub Personal Access Token (input hidden)" -AsSecureString
  $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($ghTokenSecure)
  $ghTokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
} finally {
  if ($bstr) { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

if (-not $ghTokenPlain) {
  Write-Error "No token provided — aborting."
  exit 1
}

# Export to environment for the node script to read (temporary in this session)
$Env:GH_TOKEN = $ghTokenPlain

# Build node args
$args = @("scripts/add-github-secrets.js", "--owner", $Owner, "--repo", $Repo)
if ($Secrets) { $args += @("--secrets", $Secrets) }

try {
  Write-Host "Running: node $($args -join ' ')" -ForegroundColor Cyan
  & node @args
} catch {
  Write-Error "Upload failed: $_"
  exit 1
} finally {
  Remove-Item Env:GH_TOKEN -ErrorAction SilentlyContinue
  $ghTokenPlain = $null
}

Write-Host "Done. Secrets uploaded (those present in environment)." -ForegroundColor Green
