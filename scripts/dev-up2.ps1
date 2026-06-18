# dev-up2.ps1 — boot the Panacea core shell with the Admin module loaded, in one action.
# Run from anywhere in PowerShell:   .\scripts\dev-up2.ps1
# (if blocked by execution policy:   powershell -ExecutionPolicy Bypass -File .\scripts\dev-up2.ps1)
#
# What it does, in order:
#   1. Start Postgres + Redis (docker compose)
#   2. Boot the core backend — it runs migrations, then the module loader discovers
#      the Admin module via MODULES_PATH, registers /api/admin/* and syncs its permissions
#   3. Verify the Admin module actually mounted (probe a guarded admin route)
#   4. Seed a dev login and grant it every synced permission
#   5. Boot the core frontend (the Admin tab loads the real admin UI)

$ErrorActionPreference = 'Stop'

# --- dev config: env for the backend + seed (the backend has no dotenv loader) ---
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/panacea'
$env:REDIS_URL    = 'redis://localhost:6379'
$env:JWT_SECRET   = 'dev-secret'
$env:PORT         = '3000'
$env:NODE_ENV     = 'development'
# which module repos the shell loads (sibling dirs under panacea-sourcecode/)
$env:MODULES_PATH = 'panacea-admin'

# repo root = parent of this script's folder
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '==> Starting Postgres + Redis (docker compose)...' -ForegroundColor Cyan
docker compose up -d postgres redis

Write-Host '==> Waiting for Postgres to accept connections...' -ForegroundColor Cyan
$pgReady = $false
for ($i = 0; $i -lt 30; $i++) {
  docker compose exec -T postgres pg_isready -U postgres -d panacea *> $null
  if ($LASTEXITCODE -eq 0) { $pgReady = $true; break }
  Start-Sleep -Seconds 1
}
if (-not $pgReady) { throw 'Postgres did not become ready within 30s.' }

# Guard against a leftover backend from a previous run still holding the port.
$portInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($portInUse) {
  $pid3000 = ($portInUse | Select-Object -First 1).OwningProcess
  $proc = Get-Process -Id $pid3000 -ErrorAction SilentlyContinue
  $who = if ($proc) { "$($proc.ProcessName) (PID $pid3000)" } else { "PID $pid3000" }
  Write-Host "Port 3000 is held by: $who" -ForegroundColor Yellow
  Write-Host "  - if it's 'node', a previous backend is still alive:  Stop-Process -Id $pid3000 -Force" -ForegroundColor DarkGray
  Write-Host "  - if it's Docker, the compose backend is running:     docker compose stop backend" -ForegroundColor DarkGray
  throw "Port 3000 is already in use by $who. Stop it, then re-run this script."
}

Write-Host '==> Starting core backend (migrations + loads Admin module on :3000)...' -ForegroundColor Cyan
# new window; inherits the env vars set above (incl. MODULES_PATH).
# Tee its output to a log so this script can surface boot errors if /health never comes up.
$backendLog = Join-Path $root 'backend-dev.log'
Remove-Item $backendLog -Force -ErrorAction SilentlyContinue
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', "pnpm --filter @panacea/shell dev 2>&1 | Tee-Object -FilePath `"$backendLog`""
) | Out-Null

Write-Host '==> Waiting for backend /health to report ok...' -ForegroundColor Cyan
# Use 127.0.0.1 (not localhost): the server binds IPv4 0.0.0.0, but on Windows
# 'localhost' often resolves to IPv6 ::1 first, which the server is not listening on.
$healthy = $false
for ($i = 0; $i -lt 120; $i++) {
  try {
    $res = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/health' -TimeoutSec 2
    if ($res.status -eq 'ok' -and $res.db -eq 'ok') { $healthy = $true; break }
  } catch { }
  Start-Sleep -Seconds 1
}
if (-not $healthy) {
  Write-Host '--- backend boot log (tail) ----------------------------------' -ForegroundColor Yellow
  if (Test-Path $backendLog) { Get-Content $backendLog -Tail 40 } else { Write-Host '(no log captured)' }
  Write-Host '--------------------------------------------------------------' -ForegroundColor Yellow
  throw 'Backend /health did not return ok within 60s (see the backend boot log above).'
}

Write-Host '==> Verifying the Admin module mounted...' -ForegroundColor Cyan
# A guarded admin route returns 401 when present (loaded) and 404 when the module did not load.
$adminCode = 0
try {
  Invoke-WebRequest -Uri 'http://127.0.0.1:3000/api/admin/permissions' -UseBasicParsing -TimeoutSec 5 | Out-Null
  $adminCode = 200
} catch {
  $adminCode = [int]$_.Exception.Response.StatusCode.value__
}
if ($adminCode -eq 404) {
  throw 'Admin module did not mount (/api/admin/permissions => 404). Check MODULES_PATH and the backend window.'
}
Write-Host "    Admin module is live (/api/admin/permissions => $adminCode)." -ForegroundColor DarkGray

Write-Host '==> Seeding dev login user (grants every synced permission)...' -ForegroundColor Cyan
pnpm --filter @panacea/shell exec tsx backend/dev-seed.ts

Write-Host '==> Starting core frontend (Vite on :5173)...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', 'pnpm --filter @panacea/shell-frontend dev'
) | Out-Null

Write-Host ''
Write-Host 'Panacea core + Admin module are up.' -ForegroundColor Green
Write-Host '  frontend : http://localhost:5173   (open the Admin tab)'
Write-Host '  backend  : http://localhost:3000/health'
Write-Host '  admin API: http://localhost:3000/api/admin/permissions'
Write-Host '  login    : admin@panacea.dev / password123'
Write-Host ''
Write-Host 'Backend and frontend run in their own windows — close them to stop.'
Write-Host 'Stop Postgres/Redis with:  docker compose stop postgres redis'
