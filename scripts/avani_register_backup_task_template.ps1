<#
.SYNOPSIS
  Phase 5.3.60 — Windows Task Scheduler Registration Template for AVANI Google Drive Backup.
.DESCRIPTION
  Prepares a daily Windows Task Scheduler job for scripts\avani_rclone_backup_template.ps1.
  DO NOT RUN / REGISTER until:
    1. Sufficient disk space is available (or rclone is installed on an approved external NTFS volume).
    2. Owner has completed interactive Google Drive OAuth (`rclone config`).
    3. A manual test upload + `rclone check --one-way` has passed.
#>
param(
  [string]$TaskName = "AVANI_Loan_Services_Daily_GDrive_Backup",
  [string]$ScriptPath = "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27\scripts\avani_rclone_backup_template.ps1",
  [string]$TriggerTime = "22:00",
  [switch]$ConfirmOAuthAndTestPassed
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmOAuthAndTestPassed) {
  Write-Warning "SAFETY GATE: Task Scheduler registration is blocked until -ConfirmOAuthAndTestPassed is explicitly supplied after OAuth & test upload verification."
  return
}

if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
  throw "rclone is not installed on PATH. Install rclone and complete OAuth first."
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At $TriggerTime
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Daily non-destructive rclone copy backup of approved AVANI folders to Google Drive AVANI_SAFE_ARCHIVE."
Write-Output "REGISTERED_TASK: $TaskName at $TriggerTime daily."
