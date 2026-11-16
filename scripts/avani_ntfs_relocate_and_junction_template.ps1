<#
.SYNOPSIS
  Phase 5.3.60 — Safe External NTFS Relocation & Junction Preparation Template.
.DESCRIPTION
  DO NOT EXECUTE until an external NTFS volume (>= 50 GB free, Healthy, non-FAT32) is attached
  and the owner explicitly approves migration of the target directory.
  Never use for Google Drive streaming locations, FAT32 volumes, or unstable removable drives.
#>
param(
  [Parameter(Mandatory = $true)][string]$SourceDir,
  [Parameter(Mandatory = $true)][string]$DestinationDir,
  [switch]$Execute
)

$ErrorActionPreference = 'Stop'

$destRoot = [System.IO.Path]::GetPathRoot($DestinationDir)
$vol = Get-Volume -DriveLetter ($destRoot.TrimEnd(':\')) -ErrorAction Stop
if ($vol.FileSystem -ne 'NTFS') {
  throw "BLOCKED: Destination filesystem is '$($vol.FileSystem)'. Only NTFS is permitted."
}
if ($vol.HealthStatus -ne 'Healthy') {
  throw "BLOCKED: Destination volume health is '$($vol.HealthStatus)'."
}
if ($vol.SizeRemaining -lt 50GB) {
  throw "BLOCKED: Destination free space ($([math]::Round($vol.SizeRemaining/1GB,2)) GB) is below 50 GB minimum."
}

if (-not $Execute) {
  Write-Output "DRY_RUN: Verified destination $destRoot is NTFS, Healthy, FreeGB=$([math]::Round($vol.SizeRemaining/1GB,2)). Re-run with -Execute only after closing open handles and confirming backup."
  return
}

# Step 1: Non-destructive mirror copy
robocopy $SourceDir $DestinationDir /E /COPY:DAT /R:2 /W:2 /MT:8
if ($LASTEXITCODE -gt 7) { throw "Robocopy failed with exit code $LASTEXITCODE" }

# Step 2: File count & SHA-256 verification
$srcFiles = Get-ChildItem -LiteralPath $SourceDir -Recurse -File -Force | Sort-Object FullName
$dstFiles = Get-ChildItem -LiteralPath $DestinationDir -Recurse -File -Force | Sort-Object FullName
if ($srcFiles.Count -ne $dstFiles.Count) {
  throw "HASH_ABORT: File count mismatch (Source=$($srcFiles.Count), Dest=$($dstFiles.Count))."
}

for ($i = 0; $i -lt $srcFiles.Count; $i++) {
  $h1 = (Get-FileHash -LiteralPath $srcFiles[$i].FullName -Algorithm SHA256).Hash
  $h2 = (Get-FileHash -LiteralPath $dstFiles[$i].FullName -Algorithm SHA256).Hash
  if ($h1 -ne $h2) {
    throw "HASH_ABORT: SHA-256 mismatch on $($srcFiles[$i].FullName)"
  }
}

# Step 3: Git integrity check if .git exists
if (Test-Path -LiteralPath (Join-Path $DestinationDir '.git')) {
  Push-Location $DestinationDir
  try {
    $head = git rev-parse HEAD
    Write-Output "DEST_GIT_HEAD: $head"
  } finally {
    Pop-Location
  }
}

# Step 4: Preserve original path via backup rename + NTFS junction
$backupPath = "${SourceDir}_PRE_JUNCTION_BAK"
Rename-Item -LiteralPath $SourceDir -NewName (Split-Path $backupPath -Leaf)
cmd /c "mklink /J `"$SourceDir`" `"$DestinationDir`""
if ($LASTEXITCODE -ne 0) {
  Rename-Item -LiteralPath $backupPath -NewName (Split-Path $SourceDir -Leaf)
  throw "JUNCTION_FAILED: Rolled back original directory name."
}

Write-Output "MIGRATION_AND_JUNCTION_VERIFIED: $SourceDir -> $DestinationDir (Rollback backup retained at $backupPath until owner confirms deletion)."
