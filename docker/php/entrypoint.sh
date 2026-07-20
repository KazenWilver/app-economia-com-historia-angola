#!/bin/sh
set -e

cd /app

if [ ! -f /app/vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

php artisan config:clear
php artisan storage:link --force >/dev/null 2>&1 || true

exec php-fpm -F -R
