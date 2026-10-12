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

# Configure SQL module to point to db container
RUN sed -i 's/driver = "rlm_sql_null"/driver = "rlm_sql_${dialect}"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/dialect = "sqlite"/dialect = "mysql"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/server = "localhost"/server = "db"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/login = "radius"/login = "root"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/password = "radpass"/password = "123456789000"/' /etc/freeradius/3.0/mods-available/sql \
    && sed -i 's/radius_db = "radius"/radius_db = "air_db"/' /etc/freeradius/3.0/mods-available/sql \
    && ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql \
    && ln -sf /etc/freeradius/3.0/mods-available/sqlcounter /etc/freeradius/3.0/mods-enabled/sqlcounter \
    && sed -i '/-sql/s/^-sql/sql/' /etc/freeradius/3.0/sites-available/default \
    && sed -i '/#\tsql/s/#\tsql/\tsql/' /etc/freeradius/3.0/sites-available/default

# Allow all clients with default secret
RUN echo "client all { ipaddr = 0.0.0.0/0; secret = 00c1d0a5a49919afd243af8837adcde3; shortname = mikrotik; }" >> /etc/freeradius/3.0/clients.conf

RUN chown -R freerad:freerad /etc/freeradius/3.0

EXPOSE 1812/udp 1813/udp

CMD ["freeradius", "-f", "-X"]
