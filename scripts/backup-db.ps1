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

# pg_dump does not support Prisma-style query param `schema=...` in URI.
try {
  $uri = [System.Uri]$dbUrl
  $queryParts = @()
  if ($uri.Query) {
    $raw = $uri.Query.TrimStart("?")
    $queryParts = $raw -split "&" | Where-Object { $_ -and ($_ -notmatch "^schema=") }
  }
  $cleanBuilder = [System.UriBuilder]$dbUrl
  $cleanBuilder.Query = ($queryParts -join "&")
  $dbUrlForPgDump = $cleanBuilder.Uri.AbsoluteUri
} catch {
  # Fallback: strip schema query by regex if URI parse fails
  $dbUrlForPgDump = ($dbUrl -replace "([?&])schema=[^&]*&?", '$1').TrimEnd('?', '&')
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeLabel = ($Label -replace "[^a-zA-Z0-9_-]", "-")

$backupDir = Join-Path $root "backups\db"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$fileName = "ben-que-market-$timestamp-$safeLabel.dump"
$filePath = Join-Path $backupDir $fileName

Write-Host "Creating backup: $filePath"
pg_dump --dbname="$dbUrlForPgDump" --format=custom --file="$filePath" --no-owner --no-privileges
if ($LASTEXITCODE -ne 0) {
  throw "pg_dump failed with exit code $LASTEXITCODE"
}

$latestPointer = Join-Path $backupDir "LATEST.txt"
Set-Content -Path $latestPointer -Value $fileName -Encoding UTF8

Write-Host "Backup created successfully."
Write-Host "Latest pointer updated: $latestPointer"
