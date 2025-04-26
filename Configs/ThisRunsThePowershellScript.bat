@echo off
setlocal

REM Get current directory
set "scriptDir=%~dp0"

REM Run the PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%scriptDir%UpdateQuizSectionJsonQuestionIds.ps1"

pause