FROM php:8.4-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    libzip-dev \
    unzip \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql bcmath zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

# Em bind mount Windows, www-data muitas vezes não consegue escrever em storage/.
# Para ambiente local/académico corremos o pool FPM como root (não usar assim em cloud pública).
RUN sed -i 's/^user = www-data/user = root/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^group = www-data/group = root/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^;listen.owner.*/listen.owner = root/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^;listen.group.*/listen.group = root/' /usr/local/etc/php-fpm.d/www.conf \
    && echo 'security.limit_extensions =' >> /usr/local/etc/php-fpm.d/www.conf

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY opcache.ini /usr/local/etc/php/conf.d/zz-opcache.ini
COPY uploads.ini /usr/local/etc/php/conf.d/zz-uploads.ini
COPY entrypoint.sh /usr/local/bin/jindungo-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/jindungo-entrypoint.sh \
    && chmod +x /usr/local/bin/jindungo-entrypoint.sh

WORKDIR /app

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/jindungo-entrypoint.sh"]
