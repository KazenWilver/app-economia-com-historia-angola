# Verificações locais antes de commit/push (espelha o CI do GitHub)
# Uso: .\scripts\check-ci.ps1
#      .\scripts\check-ci.ps1 -BackendOnly
#      .\scripts\check-ci.ps1 -Fix
#      .\scripts\check-ci.ps1 -SkipTests
#
# Antes de push: corre SEMPRE este script ou usa Push-Git (git-profile.ps1).
# Inclui Pint, PHPUnit (backend) e ESLint (frontend).
#
# Nota Windows: vendor/bin/pint é um script PHP — sem `php` no PATH ou Docker,
# o Pint não corre de verdade e o CI local pode passar sem formatar nada.

param(
    [switch]$BackendOnly,
    [switch]$Fix,
    [switch]$SkipTests
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

function Test-CommandAvailable {
    param([string]$Name)

    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-DockerCompose {
    param(
        [Parameter(Mandatory)][string[]]$ComposeArgs
    )

    # Em scripts .ps1 não-interactivos, `docker compose exec` pode bloquear à espera
    # de stdin. Fechar stdin com `< nul` espelha um terminal real (como no CI Linux).
    $quotedArgs = ($ComposeArgs | ForEach-Object {
        if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
    }) -join ' '

    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        cmd /c "docker compose $quotedArgs < nul" 2>&1 | Out-Host
        return $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorAction
    }
}

function Invoke-BackendPint {
    $pintArgs = if ($Fix) { @() } else { @("--test") }
    $localPint = Join-Path $backendRoot "vendor\bin\pint"

    if (-not (Test-Path $localPint)) {
        throw "Laravel Pint não encontrado. Corre `composer install` em backend/ ou levanta o Docker."
    }

    # Preferir Docker — igual ao ambiente Linux do GitHub Actions.
    if (Test-CommandAvailable "docker") {
        Push-Location $projectRoot
        try {
            $backendRunning = docker compose ps --status running --services backend 2>$null
            $pintCommand = @("vendor/bin/pint") + $pintArgs

            if ($backendRunning -match "backend") {
                $exitCode = Invoke-DockerCompose -ComposeArgs (@("exec", "-T", "backend") + $pintCommand)
            } else {
                $exitCode = Invoke-DockerCompose -ComposeArgs (@("run", "--rm", "--no-deps", "backend") + $pintCommand)
            }

            if ($exitCode -ne 0) {
                throw "Laravel Pint falhou (Docker). Usa -Fix para corrigir automaticamente."
            }
        } finally {
            Pop-Location
        }

        return
    }

    # Fallback local: exige PHP explícito (Windows não executa vendor/bin/pint sozinho).
    if (Test-CommandAvailable "php") {
        Push-Location $backendRoot
        try {
            & php vendor/bin/pint @pintArgs
            if ($LASTEXITCODE -ne 0) {
                throw "Laravel Pint falhou. Usa -Fix para corrigir automaticamente."
            }
        } finally {
            Pop-Location
        }

        return
    }

    throw @"
Laravel Pint não pode correr nesta máquina.
- Instala Docker Desktop e corre novamente, ou
- Adiciona PHP ao PATH e corre: php backend/vendor/bin/pint --test
"@
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

function Invoke-BackendTests {
    $testScript = Join-Path $PSScriptRoot "test-backend.ps1"

    if (-not (Test-Path $testScript)) {
        throw "scripts/test-backend.ps1 não encontrado."
    }

    if (-not (Test-CommandAvailable "docker")) {
        throw @"
PHPUnit local não está configurado neste script.
- Instala Docker Desktop e corre novamente, ou
- Corre manualmente: .\scripts\test-backend.ps1
"@
    }

    & $testScript
    if ($LASTEXITCODE -ne 0) {
        throw "PHPUnit falhou. Corrige os testes antes do push."
    }
}

Write-Step "Backend - Laravel Pint"
Invoke-BackendPint

if (-not $SkipTests) {
    Write-Step "Backend - PHPUnit"
    Invoke-BackendTests
}

if (-not $BackendOnly) {
    Write-Step "Frontend - ESLint"
    Invoke-FrontendLint
}

Write-Host ""
Write-Host "Verificações concluídas com sucesso." -ForegroundColor Green
