#!/bin/bash
set -e

MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD_DEFAULT:-123456789000}

# 1. Prepare runtime directories
mkdir -p /run/mysqld /run/php /run/freeradius /var/log/supervisor
chown -R mysql:mysql /run/mysqld
chown -R freerad:freerad /run/freeradius

# 2. Initialize MariaDB data directory if needed
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "[Entrypoint] Initializing MariaDB system tables..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql > /dev/null 2>&1

    echo "[Entrypoint] Starting temporary MariaDB to setup root user and import air_db..."
    mysqld --user=mysql --skip-networking --socket=/run/mysqld/mysqld.sock &
    pid="$!"

    for i in {30..0}; do
        if mysqladmin --socket=/run/mysqld/mysqld.sock ping > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    if [ "$i" -le 0 ]; then
        echo "[Entrypoint] MariaDB temporary start failed!"
        exit 1
    fi

    echo "[Entrypoint] Configuring MariaDB users and database..."
    mysql --socket=/run/mysqld/mysqld.sock <<-EOSQL
        ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
        CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
        GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
        CREATE DATABASE IF NOT EXISTS \`air_db\` DEFAULT CHARACTER SET utf8;
        FLUSH PRIVILEGES;
EOSQL

    if [ -f "/docker-entrypoint-initdb.d/air_db.sql" ]; then
        echo "[Entrypoint] Importing air_db.sql..."
        mysql --socket=/run/mysqld/mysqld.sock -uroot -p"${MYSQL_ROOT_PASSWORD}" air_db < /docker-entrypoint-initdb.d/air_db.sql
        echo "[Entrypoint] Database import completed successfully."
    fi

    echo "[Entrypoint] Shutting down temporary MariaDB..."
    mysqladmin --socket=/run/mysqld/mysqld.sock -uroot -p"${MYSQL_ROOT_PASSWORD}" shutdown
    wait "$pid"
fi

# 3. Ensure Web Management files exist in /opt/hotspot/admin
if [ ! -f "/opt/hotspot/admin/index.php" ]; then
    echo "[Entrypoint] Populating web files into /opt/hotspot/admin..."
    mkdir -p /opt/hotspot/admin
    if [ -d "/opt/hotspot_default" ]; then
        cp -rn /opt/hotspot_default/. /opt/hotspot/admin/
    fi
fi
chown -R www-data:www-data /opt/hotspot/

# 4. Ensure FreeRADIUS permissions
chown -R root:freerad /etc/freeradius/3.0
chmod -R g+r /etc/freeradius/3.0

echo "[Entrypoint] Starting all services via Supervisord..."
exec "$@"
