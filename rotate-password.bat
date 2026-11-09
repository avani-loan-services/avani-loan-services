@echo off
setlocal enabledelayedexpansion

:: Switch working directory to the project folder containing this batch script
cd /d "%~dp0"

echo =========================================================================
echo   AVANI LOAN SERVICES -- SECURE ADMIN CREDENTIAL ROTATION UTILITY
echo =========================================================================
echo.

set NEW_PASS=%~1

if "!NEW_PASS!"=="" (
    echo Enter your preferred Admin Password ^(min 12 characters^),
    set /p "NEW_PASS=or press [ENTER] to generate a cryptographically strong secret: "
)

echo.
echo Processing credential rotation...
echo.

if "!NEW_PASS!"=="" (
    node scripts\rotate_admin_credential.cjs
) else (
    node scripts\rotate_admin_credential.cjs --password "!NEW_PASS!"
)

echo.
echo =========================================================================
echo Rotation complete. Your current credentials are saved in:
echo   .admin_credential_rotated.secret  ^(git-ignored^)
echo.
echo Admin Portal URL: https://www.avanifinserv.com/admin
echo =========================================================================
echo.
pause
