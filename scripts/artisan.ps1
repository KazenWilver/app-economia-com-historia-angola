param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if ($Args.Count -eq 0) {
    docker compose run --rm backend php artisan
    exit $LASTEXITCODE
}

docker compose run --rm backend php artisan @Args
exit $LASTEXITCODE
