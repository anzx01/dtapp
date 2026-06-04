$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$AppDir = Join-Path $RootDir "app"
$PidFile = Join-Path $AppDir ".preview.pid"

if (-not (Test-Path $PidFile)) {
  Write-Host "Preview server is not running, or PID file is missing."
  exit 0
}

$pidText = (Get-Content $PidFile -Raw).Trim()
$previewPid = 0

if (-not [int]::TryParse($pidText, [ref]$previewPid)) {
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Host "PID file was invalid. Cleaned up."
  exit 0
}

$process = Get-CimInstance Win32_Process -Filter "ProcessId=$previewPid" -ErrorAction SilentlyContinue

if (-not $process) {
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Host "Preview process was not found. Cleaned PID file."
  exit 0
}

if ($process.CommandLine -notlike "*serve-h5.mjs*") {
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Host "PID $previewPid is not the preview server. Cleaned PID file only."
  exit 0
}

Stop-Process -Id $previewPid -Force
Remove-Item $PidFile -Force -ErrorAction SilentlyContinue

Write-Host "Preview server stopped."
