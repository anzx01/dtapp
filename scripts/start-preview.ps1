$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$AppDir = Join-Path $RootDir "app"
$PidFile = Join-Path $AppDir ".preview.pid"
$Url = "http://127.0.0.1:5173"
$Port = 5173

function Get-PreviewProcessById {
  param([int]$ProcessId)

  if (-not $ProcessId) {
    return $null
  }

  $process = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
  if ($process -and $process.CommandLine -like "*serve-h5.mjs*") {
    return $process
  }

  return $null
}

function Open-Preview {
  Write-Host "URL: $Url"
  Start-Process $Url | Out-Null
}

if (-not (Test-Path (Join-Path $AppDir "package.json"))) {
  Write-Error "Cannot find app\package.json."
  exit 1
}

if (Test-Path $PidFile) {
  $oldPidText = (Get-Content $PidFile -Raw).Trim()
  $oldPid = 0
  if ([int]::TryParse($oldPidText, [ref]$oldPid)) {
    $oldProcess = Get-PreviewProcessById -ProcessId $oldPid
    if ($oldProcess) {
      Write-Host "Preview server is already running."
      Write-Host "PID: $oldPid"
      Open-Preview
      exit 0
    }
  }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($connection in $connections) {
  $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($connection.OwningProcess)" -ErrorAction SilentlyContinue
  if ($owner -and $owner.CommandLine -like "*serve-h5.mjs*") {
    Set-Content -Path $PidFile -Value $connection.OwningProcess -Encoding ascii
    Write-Host "Preview server is already running."
    Write-Host "PID: $($connection.OwningProcess)"
    Open-Preview
    exit 0
  }

  if ($owner) {
    Write-Error "Port $Port is already used by another program: $($owner.CommandLine)"
    exit 1
  }
}

Set-Location $AppDir

if (-not (Test-Path (Join-Path $AppDir "node_modules"))) {
  Write-Host "Installing dependencies with domestic npm mirror..."
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

Write-Host "Building H5 preview..."
& npm.cmd run build:h5
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$process = Start-Process -FilePath "node" -ArgumentList "scripts/serve-h5.mjs" -WorkingDirectory $AppDir -WindowStyle Hidden -PassThru
Set-Content -Path $PidFile -Value $process.Id -Encoding ascii

Start-Sleep -Seconds 2

try {
  Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 | Out-Null
} catch {
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
  Write-Error "Preview server did not respond on $Url."
  exit 1
}

Write-Host "Preview server started."
Write-Host "PID: $($process.Id)"
Open-Preview
