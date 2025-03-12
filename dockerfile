FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

# Install dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-interaction --no-plugins --no-scripts

# Copy Laravel application
COPY . /var/www/html

# Run composer scripts now that the app is copied
RUN composer dump-autoload --optimize

RUN cp -n .env.example .env
RUN php artisan key:generate

# Configure Nginx
RUN echo 'server { \
    listen 8000; \
    root /var/www/html/public; \
    index index.php; \
    location / { \
        try_files $uri $uri/ /index.php?$query_string; \
    } \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_index index.php; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
    } \
}' > /etc/nginx/sites-available/default

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Create startup script
RUN echo '#!/bin/bash \n\
php-fpm -D \n\
nginx -g "daemon off;"' > /start.sh \
    && chmod +x /start.sh

# Expose port
EXPOSE 8000

# Start Nginx and PHP-FPM
CMD ["sh", "-c", "php artisan migrate --force && /start.sh"]
