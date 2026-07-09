# Atalho obrigatório antes de git push
# Uso: .\scripts\pre-push.ps1
#      .\scripts\pre-push.ps1 -Fix

param(
    [switch]$BackendOnly,
    [switch]$Fix,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$checkScript = Join-Path $PSScriptRoot "check-ci.ps1"

& $checkScript @PSBoundParameters
exit $LASTEXITCODE
