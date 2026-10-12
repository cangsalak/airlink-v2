-- ==============================================================
-- Airlink V2 - Database Schema
-- Compatible with FreeRADIUS 3.x and Modern MySQL 8 / MariaDB 10
-- ==============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- 1. FreeRADIUS Standard Schema
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `radcheck` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '==',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `radreply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '=',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `radgroupcheck` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '==',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `groupname` (`groupname`(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `radgroupreply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '=',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `groupname` (`groupname`(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `radusergroup` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `priority` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `radacct` (
  `radacctid` bigint(21) NOT NULL AUTO_INCREMENT,
  `acctsessionid` varchar(64) NOT NULL DEFAULT '',
  `acctuniqueid` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(64) NOT NULL DEFAULT '',
  `realm` varchar(64) DEFAULT '',
  `nasipaddress` varchar(15) NOT NULL DEFAULT '',
  `nasportid` varchar(32) DEFAULT NULL,
  `nasporttype` varchar(32) DEFAULT NULL,
  `acctstarttime` datetime DEFAULT NULL,
  `acctupdatetime` datetime DEFAULT NULL,
  `acctstoptime` datetime DEFAULT NULL,
  `acctinterval` int(12) DEFAULT NULL,
  `acctsessiontime` int(12) unsigned DEFAULT NULL,
  `acctauthentic` varchar(32) DEFAULT NULL,
  `connectinfo_start` varchar(50) DEFAULT NULL,
  `connectinfo_stop` varchar(50) DEFAULT NULL,
  `acctinputoctets` bigint(20) DEFAULT NULL,
  `acctoutputoctets` bigint(20) DEFAULT NULL,
  `calledstationid` varchar(50) NOT NULL DEFAULT '',
  `callingstationid` varchar(50) NOT NULL DEFAULT '',
  `acctterminatecause` varchar(32) NOT NULL DEFAULT '',
  `servicetype` varchar(32) DEFAULT NULL,
  `framedprotocol` varchar(32) DEFAULT NULL,
  `framedipaddress` varchar(15) NOT NULL DEFAULT '',
  PRIMARY KEY (`radacctid`),
  UNIQUE KEY `acctuniqueid` (`acctuniqueid`),
  KEY `username` (`username`),
  KEY `framedipaddress` (`framedipaddress`),
  KEY `acctstarttime` (`acctstarttime`),
  KEY `acctstoptime` (`acctstoptime`),
  KEY `nasipaddress` (`nasipaddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `radpostauth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `pass` varchar(64) NOT NULL DEFAULT '',
  `reply` varchar(32) NOT NULL DEFAULT '',
  `authdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `nas` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nasname` varchar(128) NOT NULL,
  `shortname` varchar(32) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'other',
  `ports` int(5) DEFAULT NULL,
  `secret` varchar(60) NOT NULL DEFAULT 'secret',
  `server` varchar(64) DEFAULT NULL,
  `community` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT 'RADIUS Client',
  PRIMARY KEY (`id`),
  KEY `nasname` (`nasname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default NAS entry (Mikrotik Client)
INSERT IGNORE INTO `nas` (`id`, `nasname`, `shortname`, `type`, `secret`, `description`) 
VALUES (1, '0.0.0.0/0', 'mikrotik-all', 'other', '00c1d0a5a49919afd243af8837adcde3', 'Default Mikrotik NAS');

-- -------------------------------------------------------------
-- 2. Airlink V2 Application Schema
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT 'Admin',
  `role` varchar(20) DEFAULT 'superadmin',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin User: admin / admin123
INSERT IGNORE INTO `admin_users` (`id`, `username`, `password_hash`, `name`, `role`)
VALUES (1, 'admin', '$2b$10$wT0lVl8mN0C9E9kE6jB9ye4HekrG6M.qCfZcWv758oI3a08K9K51i', 'Administrator', 'superadmin');

CREATE TABLE IF NOT EXISTS `billing_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL UNIQUE,
  `groupname` varchar(64) NOT NULL UNIQUE,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valid_hours` int(11) NOT NULL DEFAULT '24', -- ระยะเวลาที่ใช้งานได้ (ชั่วโมง)
  `bw_upload` int(11) NOT NULL DEFAULT '10',   -- Mbps Upload
  `bw_download` int(11) NOT NULL DEFAULT '20', -- Mbps Download
  `simultaneous` int(11) NOT NULL DEFAULT '1', -- ใช้งานพร้อมกันกี่เครื่อง
  `description` varchar(255) DEFAULT '',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default profiles
INSERT IGNORE INTO `billing_profiles` (`id`, `name`, `groupname`, `price`, `valid_hours`, `bw_upload`, `bw_download`, `simultaneous`, `description`)
VALUES 
(1, '1 วัน (20Mbps/10Mbps)', 'plan_1day', 30.00, 24, 10, 20, 1, 'คูปองรายวัน 24 ชม.'),
(2, '7 วัน (30Mbps/15Mbps)', 'plan_7days', 150.00, 168, 15, 30, 1, 'คูปองรายสัปดาห์ 7 วัน'),
(3, '30 วัน (50Mbps/20Mbps)', 'plan_30days', 450.00, 720, 20, 50, 1, 'คูปองรายเดือน 30 วัน');

-- Auto-seed radgroupreply for default profiles
INSERT IGNORE INTO `radgroupreply` (`groupname`, `attribute`, `op`, `value`) VALUES
('plan_1day', 'Mikrotik-Rate-Limit', '=', '10M/20M'),
('plan_1day', 'Session-Timeout', '=', '86400'),
('plan_1day', 'Port-Limit', '=', '1'),
('plan_7days', 'Mikrotik-Rate-Limit', '=', '15M/30M'),
('plan_7days', 'Session-Timeout', '=', '604800'),
('plan_7days', 'Port-Limit', '=', '1'),
('plan_30days', 'Mikrotik-Rate-Limit', '=', '20M/50M'),
('plan_30days', 'Session-Timeout', '=', '2592000'),
('plan_30days', 'Port-Limit', '=', '1');

CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL UNIQUE,
  `password` varchar(64) NOT NULL,
  `profile_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('unused', 'active', 'expired', 'disabled') NOT NULL DEFAULT 'unused',
  `batch_id` varchar(64) DEFAULT NULL,
  `is_printed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `activated_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `code` (`code`),
  KEY `profile_id` (`profile_id`),
  KEY `status` (`status`),
  CONSTRAINT `fk_vouchers_profile` FOREIGN KEY (`profile_id`) REFERENCES `billing_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `routers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `host` varchar(128) NOT NULL,
  `api_port` int(11) NOT NULL DEFAULT '8728',
  `username` varchar(64) NOT NULL DEFAULT 'admin',
  `password` varchar(128) NOT NULL DEFAULT '',
  `hotspot_dns` varchar(128) DEFAULT 'hotspot.local',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `key` varchar(64) NOT NULL PRIMARY KEY,
  `value` text NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `system_settings` (`key`, `value`) VALUES
('site_title', 'Airlink Mikrotik V2'),
('currency', 'THB'),
('timezone', 'Asia/Bangkok'),
('auto_sync_radcheck', '1');

SET FOREIGN_KEY_CHECKS = 1;
