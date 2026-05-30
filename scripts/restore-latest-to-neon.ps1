param(
  [Parameter(Mandatory = $true)]
  [string]$NeonUrl
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

$repoRoot = Split-Path -Parent $PSScriptRoot
$latestFile = Join-Path $repoRoot "backups\db\LATEST.txt"

if (-not (Test-Path $latestFile)) {
  throw "LATEST.txt not found at: $latestFile"
}

$latestName = (Get-Content $latestFile -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($latestName)) {
  throw "LATEST.txt is empty."
}

$dumpPath = Join-Path $repoRoot ("backups\db\" + $latestName)
if (-not (Test-Path $dumpPath)) {
  throw "Latest dump file not found: $dumpPath"
}

$fileInfo = Get-Item $dumpPath
if ($fileInfo.Length -le 0) {
  throw "Backup file is empty (0 bytes): $dumpPath"
}

Write-Host "[RESTORE-NEON] Using dump: $dumpPath"
Write-Host "[RESTORE-NEON] Starting restore..."

# Detect format:
# - PGDMP => custom format (pg_restore)
# - otherwise fallback to plain SQL (psql)
$fs = [System.IO.File]::OpenRead($dumpPath)
try {
  $bytes = New-Object byte[] 5
  $read = $fs.Read($bytes, 0, 5)
  $header = [System.Text.Encoding]::ASCII.GetString($bytes, 0, $read)
} finally {
  $fs.Dispose()
}

if ($header -eq "PGDMP") {
  Write-Host "[RESTORE-NEON] Detected custom dump format (PGDMP). Using pg_restore..."
  pg_restore `
    -d "$NeonUrl" `
    --clean `
    --if-exists `
    --no-owner `
    --no-privileges `
    "$dumpPath"
} else {
  Write-Host "[RESTORE-NEON] Detected plain SQL format. Using psql..."
  psql "$NeonUrl" -v ON_ERROR_STOP=1 -f "$dumpPath"
}

Write-Host "[RESTORE-NEON] Done."
