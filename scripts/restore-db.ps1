param(
  [string]$FileName = ""
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $root ".env"
$backupDir = Join-Path $root "backups\db"

if (-not (Test-Path $envFile)) {
  throw ".env not found at $envFile"
}

if (-not (Test-Path $backupDir)) {
  throw "Backup directory not found: $backupDir"
}

$dbUrlLine = Get-Content $envFile | Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } | Select-Object -First 1
if (-not $dbUrlLine) {
  throw "DATABASE_URL not found in .env"
}

$dbUrl = ($dbUrlLine -split "=", 2)[1].Trim().Trim('"')
if (-not $dbUrl) {
  throw "DATABASE_URL is empty"
}

if (-not $FileName) {
  $latestPointer = Join-Path $backupDir "LATEST.txt"
  if (-not (Test-Path $latestPointer)) {
    throw "LATEST.txt not found. Provide -FileName explicitly."
  }
  $FileName = (Get-Content $latestPointer | Select-Object -First 1).Trim()
}

$filePath = Join-Path $backupDir $FileName
if (-not (Test-Path $filePath)) {
  throw "Backup file not found: $filePath"
}

Write-Host "Restoring backup: $filePath"
Write-Host "Target DB: $dbUrl"

pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$dbUrl" "$filePath"

Write-Host "Restore completed successfully."
