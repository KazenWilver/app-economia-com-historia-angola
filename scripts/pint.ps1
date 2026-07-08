param(
    [switch]$Fix
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$checkScript = Join-Path $PSScriptRoot "check-ci.ps1"

if ($Fix) {
    & $checkScript -BackendOnly -Fix
} else {
    & $checkScript -BackendOnly
}

exit $LASTEXITCODE
