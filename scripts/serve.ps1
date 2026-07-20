$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# API em modo produção local: nginx + php-fpm (porta 8000)
docker compose up backend nginx
