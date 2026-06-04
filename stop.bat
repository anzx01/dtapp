@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-preview.ps1"
exit /b %errorlevel%
