@echo off
REM Gradle wrapper script for Windows

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Use the local Gradle distribution if available
if exist "%SCRIPT_DIR%gradle-8.10.2\bin\gradle.bat" (
    call "%SCRIPT_DIR%gradle-8.10.2\bin\gradle.bat" %*
) else if exist "%SCRIPT_DIR%gradle-8.10.2\bin\gradle" (
    call "%SCRIPT_DIR%gradle-8.10.2\bin\gradle" %*
) else (
    REM Fall back to system gradle
    gradle %*
)

endlocal
