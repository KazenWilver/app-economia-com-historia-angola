# Rebuild da imagem PHP (php-fpm + OPcache + Redis) e stack nginx.
# Corre isto uma vez após puxar estas alterações.

Write-Host "A reconstruir imagem PHP (php-fpm + OPcache + Redis)..." -ForegroundColor Cyan
docker compose build --no-cache backend

Write-Host "A reiniciar contentores (backend fpm + nginx + redis)..." -ForegroundColor Cyan
docker compose up -d --force-recreate backend nginx redis

Write-Host "A instalar dependências Composer no volume nativo..." -ForegroundColor Cyan
docker compose exec backend composer install --no-interaction --prefer-dist --optimize-autoloader

Write-Host "A limpar caches Laravel..." -ForegroundColor Cyan
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan storage:link --force

Write-Host ""
Write-Host "Pronto. API via nginx+php-fpm em http://localhost:8000" -ForegroundColor Green
Write-Host "Media estática: http://localhost:8000/storage/..." -ForegroundColor Green
Write-Host ""
Write-Host "Testa a latência da API:" -ForegroundColor Yellow
Write-Host '  Invoke-WebRequest http://localhost:8000/api/contents -UseBasicParsing | Select-Object StatusCode'
Write-Host ""
Write-Host "Esperado: < 200ms apos aquecimento (artisan serve era bem mais lento)." -ForegroundColor Yellow
