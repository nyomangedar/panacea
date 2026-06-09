# dev-up.ps1 — start the full Panacea dev stack in one action.
# Run from anywhere in PowerShell:  .\scripts\dev-up.ps1
# (if blocked by execution policy:  powershell -ExecutionPolicy Bypass -File .\scripts\dev-up.ps1)
#
# Order matters: Postgres must accept connections, then the backend boots and
# runs migrations (creating the users table), then we can seed the login user,
# then the frontend. Backend + frontend open in their own windows and keep running.

$ErrorActionPreference = 'Stop'

# --- dev config: env for the backend + seed (the backend has no dotenv loader) ---
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/panacea'
$env:REDIS_URL    = 'redis://localhost:6379'
$env:JWT_SECRET   = 'dev-secret'
$env:PORT         = '3000'
$env:NODE_ENV     = 'development'

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

Write-Host '==> Starting backend (runs migrations, then Fastify on :3000)...' -ForegroundColor Cyan
# new window; inherits the env vars set above
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', 'pnpm --filter @panacea/shell dev'
) | Out-Null

Write-Host '==> Waiting for backend /health to report ok...' -ForegroundColor Cyan
$healthy = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $res = Invoke-RestMethod -Uri 'http://localhost:3000/health' -TimeoutSec 2
    if ($res.status -eq 'ok' -and $res.db -eq 'ok') { $healthy = $true; break }
  } catch { }
  Start-Sleep -Seconds 1
}
if (-not $healthy) { throw 'Backend /health did not return ok within 60s (check the backend window).' }

Write-Host '==> Seeding dev login user...' -ForegroundColor Cyan
pnpm --filter @panacea/shell exec tsx backend/dev-seed.ts

Write-Host '==> Starting frontend (Vite on :5173)...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', 'pnpm --filter @panacea/shell-frontend dev'
) | Out-Null

Write-Host ''
Write-Host 'Panacea dev stack is up.' -ForegroundColor Green
Write-Host '  frontend : http://localhost:5173'
Write-Host '  backend  : http://localhost:3000/health'
Write-Host '  login    : admin@panacea.dev / password123'
Write-Host ''
Write-Host 'Backend and frontend run in their own windows — close them to stop.'
Write-Host 'Stop Postgres/Redis with:  docker compose stop postgres redis'
