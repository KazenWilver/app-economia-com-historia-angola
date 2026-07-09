# Testes backend seguros (não apagam a BD de desenvolvimento jindungo)
# Uso: .\scripts\test-backend.ps1
#      .\scripts\test-backend.ps1 tests/Feature/Quiz/QuizAttemptTest.php

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$TestArgs
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot
try {
    $composeArgs = @(
        "compose", "exec", "-T",
        "-e", "DB_CONNECTION=sqlite",
        "-e", "DB_DATABASE=:memory:",
        "-e", "DB_URL=",
        "backend", "php", "artisan", "test"
    ) + $TestArgs

    & docker @composeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "PHPUnit falhou (exit $LASTEXITCODE)."
    }
} finally {
    Pop-Location
}
