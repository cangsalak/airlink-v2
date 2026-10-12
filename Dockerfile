FROM ubuntu:22.04

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Bangkok

# Install base dependencies and add Ondrej PHP PPA
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    ca-certificates \
    curl \
    git \
    supervisor \
    tzdata \
    net-tools \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && add-apt-repository --yes ppa:ondrej/php \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    nginx \
    php5.6-fpm \
    php5.6-curl \
    php5.6-cli \
    php5.6-gd \
    php5.6-mcrypt \
    php5.6-mysql \
    php5.6-mbstring \
    php5.6-xml \
    php5.6-zip \
    php5.6-bcmath \
    mariadb-server \
    mariadb-client \
    freeradius \
    freeradius-mysql \
    freeradius-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ensure PHP-FPM binary symlink exists
RUN if [ ! -f /usr/sbin/php-fpm5.6 ] && [ -f /usr/sbin/php5.6-fpm ]; then \
        ln -sf /usr/sbin/php5.6-fpm /usr/sbin/php-fpm5.6; \
    fi

# Clone Airlink Web Management and create fallback default backup
RUN mkdir -p /opt/hotspot/admin /opt/hotspot_default \
    && git clone https://git.bn-solution.com/suwattana.popun/airlink-web-management.git /opt/hotspot/admin \
    && cp -r /opt/hotspot/admin/. /opt/hotspot_default/ \
    && chown -R www-data:www-data /opt/hotspot

# Copy system configurations from etc/
COPY etc/ /etc/

# Enable FreeRADIUS modules and sites
RUN ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql \
    && ln -sf /etc/freeradius/3.0/mods-available/sqlcounter /etc/freeradius/3.0/mods-enabled/sqlcounter \
    && ln -sf /etc/freeradius/3.0/sites-available/default /etc/freeradius/3.0/sites-enabled/default \
    && ln -sf /etc/freeradius/3.0/sites-available/inner-tunnel /etc/freeradius/3.0/sites-enabled/inner-tunnel \
    && chown -R root:freerad /etc/freeradius/3.0 \
    && chmod -R g+r /etc/freeradius/3.0

# Configure NGINX default site
RUN rm -f /etc/nginx/sites-enabled/default \
    && ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy Database schema, supervisor config, and entrypoint
COPY air_db.sql /docker-entrypoint-initdb.d/air_db.sql
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Web: 80, 443 | FreeRADIUS: 1812/udp, 1813/udp | MariaDB: 3306
EXPOSE 80 443 1812/udp 1813/udp 3306

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
