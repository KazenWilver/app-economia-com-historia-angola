# Rebuild da imagem PHP com OPcache + Redis e volumes nativos.
# Corre isto uma vez após puxar estas alterações.

Write-Host "A reconstruir imagem PHP (OPcache + Redis)..." -ForegroundColor Cyan
docker compose build --no-cache backend

Write-Host "A reiniciar contentores com volumes nativos (vendor)..." -ForegroundColor Cyan
docker compose up -d --force-recreate backend redis

Write-Host "A instalar dependências Composer no volume nativo..." -ForegroundColor Cyan
docker compose exec backend composer install --no-interaction --prefer-dist --optimize-autoloader

Write-Host "A limpar caches Laravel..." -ForegroundColor Cyan
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear

Write-Host ""
Write-Host "Pronto. Testa a latência:" -ForegroundColor Green
Write-Host '  Invoke-WebRequest http://localhost:8000/api/contents -UseBasicParsing | Select-Object StatusCode'
Write-Host ""
Write-Host "Esperado: < 200ms apos aquecimento (antes: 3000-8000ms)." -ForegroundColor Yellow
