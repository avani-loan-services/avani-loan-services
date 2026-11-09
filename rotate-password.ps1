<#
.SYNOPSIS
    Secure Admin Credential Rotation for Avani Loan Services Unified Portal.
    Automatically switches to the project directory before executing.
#>
param(
    [Parameter(Position=0)]
    [string]$Password
)

Set-Location -Path $PSScriptRoot

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  AVANI LOAN SERVICES -- SECURE ADMIN CREDENTIAL ROTATION UTILITY" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $Password) {
    Write-Host "Enter your preferred Admin Password (min 12 characters)," -ForegroundColor Yellow
    $Password = Read-Host "or press [ENTER] to generate a cryptographically strong secret"
}

Write-Host "`nProcessing credential rotation...`n" -ForegroundColor Green

if ([string]::IsNullOrWhiteSpace($Password)) {
    node scripts/rotate_admin_credential.cjs
} else {
    node scripts/rotate_admin_credential.cjs --password "$Password"
}

Write-Host "`n=========================================================================" -ForegroundColor Cyan
Write-Host "Rotation complete. Your current credentials are saved in:" -ForegroundColor Green
Write-Host "  .admin_credential_rotated.secret  (git-ignored)" -ForegroundColor Yellow
Write-Host "`nAdmin Portal URL: https://www.avanifinserv.com/admin" -ForegroundColor Cyan
Write-Host "=========================================================================`n" -ForegroundColor Cyan
