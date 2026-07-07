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

if ($Args[0] -eq 'test') {
    docker compose run --rm `
        -e DB_CONNECTION=sqlite `
        -e DB_DATABASE=:memory: `
        -e DB_URL= `
        backend php artisan @Args
    exit $LASTEXITCODE
}

docker compose run --rm backend php artisan @Args
exit $LASTEXITCODE
