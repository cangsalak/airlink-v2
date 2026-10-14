FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Bangkok

RUN apt-get update && apt-get install -y --no-install-recommends \
    freeradius \
    freeradius-mysql \
    freeradius-utils \
    tzdata \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Configure SQL module to point to db container and disable TLS cert check
RUN sed -i 's/driver = "rlm_sql_null"/driver = "rlm_sql_${dialect}"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/dialect = "sqlite"/dialect = "mysql"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/^#[[:blank:]]*server = .*/\tserver = "db"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/^#[[:blank:]]*port = .*/\tport = 3306/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/^#[[:blank:]]*login = .*/\tlogin = "root"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/^#[[:blank:]]*password = .*/\tpassword = "123456789000"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/radius_db = ".*"/radius_db = "air_db"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i '/ca_file = /s/^/#/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i '/ca_path = /s/^/#/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i '/certificate_file = /s/^/#/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i '/private_key_file = /s/^/#/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i '/cipher = /s/^/#/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i '/tls_required = /s/^/#/' /etc/freeradius/3.0/mods-available/sql \
    && ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql \
    && ln -sf /etc/freeradius/3.0/mods-available/sqlcounter /etc/freeradius/3.0/mods-enabled/sqlcounter \
    && sed -i '/-sql/s/^-sql/sql/' /etc/freeradius/3.0/sites-available/default \
    && sed -i '/#\tsql$/s/#\tsql/\tsql/' /etc/freeradius/3.0/sites-available/default \
    && sed -i '/sqlippool/s/^\([[:blank:]]*\)sqlippool/\1#sqlippool/' /etc/freeradius/3.0/sites-available/default


# Allow all clients with default secret (FreeRADIUS requires newline-separated directives, no semicolons)
RUN printf "\nclient all {\n    ipaddr = 0.0.0.0/0\n    secret = 00c1d0a5a49919afd243af8837adcde3\n    shortname = mikrotik\n}\n" >> /etc/freeradius/3.0/clients.conf

RUN chown -R freerad:freerad /etc/freeradius/3.0

EXPOSE 1812/udp 1813/udp

CMD ["freeradius", "-f", "-X"]
