#!/bin/sh
#
#
PATH_EXTR=$(pwd)
AIR_PACKS=/usr/airlink_packages
FILE="/tmp/out.$$"
GREP="/bin/grep"
CLSLOG=/usr/psql.pl
VERSION=1.3
UBUNTU_VERSION=22.04
MYSQL_PASSWORD_DEFAULT=123456789000

clear
echo -e "###############################################################################"
echo -e "# Starting Installation Airlink Mikrotik Version $VERSION"
echo -e "# Ubuntu $UBUNTU_VERSION LTS SERVER AMD64"
echo -e "# Developer Script & Software : https://www.facebook.com/sartonice"
echo -e "# Developer Refactoring       : https://www.facebook.com/suwattana.popun"
echo -e "# Have a question & Support   : https://www.facebook.com/groups/airlink.hotspot"
echo -e "###############################################################################"
sleep 9

if [ "$(id -u)" != "0" ]; then
        echo -e "########"
        echo -e "######## Airlink Mikrotik Installation Script detected a problem ########"
        echo -e "########"			'\033[32mThis script must be run as root user'"########"
        echo -e "########"    'Please Login as root and run install script again' "########"
        echo -e "########"
        exit 1
else
        echo -e "You are login as root user" '\033[0;32mOk\033[0m'
	sleep 2
fi

clear
echo "##################################################"
echo "# Disabled POP UP Daemons using outdated libraries"
echo "##################################################"
sleep 2
sed "/#\$nrconf{restart} = 'i';/s/.*/\$nrconf{restart} = 'a';/" /etc/needrestart/needrestart.conf

clear
echo "############################################"
echo "# Installing PHP 5.6 Repository             "
echo "############################################"
sleep 2
add-apt-repository --yes ppa:ondrej/php

clear
echo "############################################"
echo "# Installing Software and update your system"
echo "############################################"
sleep 2
apt update && apt upgrade -y
apt install -y net-tools expect squid vnstat git
vnstat -u -i ens33

clear
echo "############################################"
echo "# Installing NGINX Server && PHP 5.6        "
echo "############################################"
sleep 2
apt install -y nginx php5.6-fpm php5.6-curl php5.6-cli php5.6-gd php5.6-mcrypt php5.6-mysql

clear
echo "############################################"
echo "# Installing MariaDB Server                 "
echo "############################################"
sleep 2
apt install -y mariadb-server mariadb-client

clear
echo "############################################"
echo "# Config MariaBD Security in your system    "
echo "############################################"
sleep 2
SECURE_MYSQL=$(expect -c "
set timeout 10
spawn mysql_secure_installation
expect \"Enter current password for root (enter for none):\"
send \"\r\"
expect \"Switch to unix_socket authentication\"
send \"y\r\"
expect \"Change the root password?\"
send \"y\r\"
expect \"New password:\"
send \"$MYSQL_PASSWORD_DEFAULT\r\"
expect \"Re-enter new password:\"
send \"$MYSQL_PASSWORD_DEFAULT\r\"
expect \"Remove anonymous users?\"
send \"y\r\"
expect \"Disallow root login remotely?\"
send \"y\r\"
expect \"Remove test database and access to it?\"
send \"y\r\"
expect \"Reload privilege tables now?\"
send \"y\r\"
expect eof
")
echo "$SECURE_MYSQL"

clear
echo "############################################"
echo "# Import Airlink Database                   "
echo "############################################"
sleep 2
echo "CREATE USER 'root'@'%' IDENTIFIED BY '$MYSQL_PASSWORD_DEFAULT'" | mysql -uroot -p$MYSQL_PASSWORD_DEFAULT
echo "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION" | mysql -uroot -p$MYSQL_PASSWORD_DEFAULT
echo "FLUSH PRIVILEGES" | mysql -uroot -p$MYSQL_PASSWORD_DEFAULT
echo 'CREATE DATABASE air_db DEFAULT CHARACTER SET utf8' | mysql -uroot -p$MYSQL_PASSWORD_DEFAULT
mysql -uroot -p$MYSQL_PASSWORD_DEFAULT air_db < air_db.sql

clear
echo "############################################"
echo "# Installing Freeradius NTP For Server                 "
echo "############################################"
sleep 2
apt install -y ntp freeradius freeradius-mysql freeradius-utils
timedatectl set-timezone Asia/Bangkok

clear
echo "############################################"
echo "# Setting Config                  "
echo "############################################"
sleep 2
cd /root
tar -C / -zxvf airlink_packages.tgz

# Allowed Module
ln -s /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/
ln -s /etc/freeradius/3.0/mods-available/sqlcounter /etc/freeradius/3.0/mods-enabled/

# Get Web Management From GIT
mkdir -p /opt/hotspot/admin
cd /opt/hotspot/admin
git clone https://git.bn-solution.com/suwattana.popun/airlink-web-management.git .

chown -R www-data:www-data /opt/hotspot/

clear
echo "############################################"
echo "# Restart Services                    "
echo "############################################"
sleep 2
systemctl restart nginx
systemctl restart php5.6-fpm
systemctl restart freeradius
systemctl restart mysql

clear
echo "############################################"
echo "# Setting Crontab                    "
echo "############################################"
sleep 2
echo "@daily perl $CLSLOG" >> /var/spool/cron/crontabs/root
echo "* */3 * * * /bin/echo 3 > /proc/sys/vm/drop_caches" >> /var/spool/cron/crontabs/root

clear
echo -e "###############################################################################"
echo -e "# Finish Installation Airlink Mikrotik Version $VERSION"
echo -e "# Ubuntu $UBUNTU_VERSION LTS SERVER AMD64"
echo -e "# Developer Script & Software : https://www.facebook.com/sartonice"
echo -e "# Developer Refactoring       : https://www.facebook.com/suwattana.popun"
echo -e "# Have a question & Support   : https://www.facebook.com/groups/airlink.hotspot"
echo -e "###############################################################################"
sleep 5

reboot
#Ending script
