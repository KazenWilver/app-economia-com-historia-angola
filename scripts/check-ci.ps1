# Verificações locais antes de commit/push (espelha o CI do GitHub)
# Uso: .\scripts\check-ci.ps1
#      .\scripts\check-ci.ps1 -BackendOnly
#      .\scripts\check-ci.ps1 -Fix

param(
    [switch]$BackendOnly,
    [switch]$Fix
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot "backend"
$frontendRoot = Join-Path $projectRoot "frontend"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-BackendPint {
    $pintArgs = if ($Fix) { @() } else { @("--test") }
    $localPint = Join-Path $backendRoot "vendor\bin\pint"

    if (Test-Path $localPint) {
        Push-Location $backendRoot
        try {
            & $localPint @pintArgs
            if (-not $?) {
                throw "Laravel Pint falhou."
            }
        } finally {
            Pop-Location
        }
        return
    }

    Push-Location $projectRoot
    try {
        docker compose run --rm backend vendor/bin/pint @pintArgs
        if (-not $?) {
            throw "Laravel Pint falhou (Docker)."
        }
    } finally {
        Pop-Location
    }
}

function Invoke-FrontendLint {
    if (-not (Test-Path (Join-Path $frontendRoot "package.json"))) {
        Write-Host "Frontend ignorado (package.json não encontrado)." -ForegroundColor Yellow
        return
    }

    Push-Location $frontendRoot
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "A instalar dependências do frontend..." -ForegroundColor Yellow
            npm ci
            if ($LASTEXITCODE -ne 0) {
                throw "npm ci falhou."
            }
        }

        npm run lint
        if ($LASTEXITCODE -ne 0) {
            throw "ESLint falhou."
        }
    } finally {
        Pop-Location
    }
}

Write-Step "Backend - Laravel Pint"
Invoke-BackendPint

if (-not $BackendOnly) {
    Write-Step "Frontend - ESLint"
    Invoke-FrontendLint
}

Write-Host ""
Write-Host "Verificações concluídas com sucesso." -ForegroundColor Green
