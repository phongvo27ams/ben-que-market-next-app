param(
  [string]$Label = "manual"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
  throw ".env not found at $envFile"
}

$dbUrlLine = Get-Content $envFile | Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } | Select-Object -First 1
if (-not $dbUrlLine) {
  throw "DATABASE_URL not found in .env"
}

$dbUrl = ($dbUrlLine -split "=", 2)[1].Trim().Trim('"')
if (-not $dbUrl) {
  throw "DATABASE_URL is empty"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeLabel = ($Label -replace "[^a-zA-Z0-9_-]", "-")

$backupDir = Join-Path $root "backups\db"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$fileName = "ben-que-market-$timestamp-$safeLabel.dump"
$filePath = Join-Path $backupDir $fileName

Write-Host "Creating backup: $filePath"
pg_dump --dbname="$dbUrl" --format=custom --file="$filePath" --no-owner --no-privileges

$latestPointer = Join-Path $backupDir "LATEST.txt"
Set-Content -Path $latestPointer -Value $fileName -Encoding UTF8

Write-Host "Backup created successfully."
Write-Host "Latest pointer updated: $latestPointer"
