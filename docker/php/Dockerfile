FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    libzip-dev \
    unzip \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql bcmath zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY opcache.ini /usr/local/etc/php/conf.d/zz-opcache.ini
COPY uploads.ini /usr/local/etc/php/conf.d/zz-uploads.ini

WORKDIR /app
