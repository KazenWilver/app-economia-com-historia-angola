#!/bin/sh
set -e

php artisan config:clear || true
php artisan storage:link || true
php artisan migrate --force --no-interaction
php artisan db:sync-pgsql-sequences --no-interaction || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
