CREATE TABLE IF NOT EXISTS `mdt_reports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `author_cid` VARCHAR(50) NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `involved_cids` TEXT NULL,
  `involved_plates` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mdt_warrants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `issued_by_cid` VARCHAR(50) NOT NULL,
  `issued_by_name` VARCHAR(100) NOT NULL,
  `target_cid` VARCHAR(50) NOT NULL,
  `target_name` VARCHAR(100) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX (`target_cid`),
  INDEX (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mdt_bolos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_cid` VARCHAR(50) NOT NULL,
  `created_by_name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'PERSON', -- PERSON/VEHICLE
  `description` VARCHAR(255) NOT NULL,
  `last_seen` VARCHAR(255) NULL,
  `plate` VARCHAR(20) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX (`type`),
  INDEX (`active`),
  INDEX (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexerad "citizens"-tabell för snabb sökning (undviker JSON-scan i players)
CREATE TABLE IF NOT EXISTS `mdt_citizens` (
  `citizenid` VARCHAR(50) NOT NULL,
  `firstname` VARCHAR(50) NULL,
  `lastname` VARCHAR(50) NULL,
  `fullname` VARCHAR(120) NULL,
  `birthdate` VARCHAR(20) NULL,
  `phone` VARCHAR(30) NULL,
  `gender` VARCHAR(10) NULL,
  `nationality` VARCHAR(50) NULL,
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`citizenid`),
  INDEX `idx_firstname` (`firstname`),
  INDEX `idx_lastname` (`lastname`),
  INDEX `idx_fullname` (`fullname`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fordonsmarkeringar (t.ex. "efterlyst")
CREATE TABLE IF NOT EXISTS `mdt_vehicle_flags` (
  `plate` VARCHAR(20) NOT NULL,
  `wanted` TINYINT(1) NOT NULL DEFAULT 0,
  `reason` VARCHAR(255) NULL,
  `created_by_cid` VARCHAR(50) NULL,
  `created_by_name` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`plate`),
  INDEX `idx_wanted` (`wanted`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Register/anteckningar per medborgare (misstanke/dom/ärende)
CREATE TABLE IF NOT EXISTS `mdt_citizen_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `citizenid` VARCHAR(50) NOT NULL,
  `record_type` VARCHAR(20) NOT NULL DEFAULT 'ARANDE', -- ARANDE/MISSTANKE/DOM/ANMARKNING/RAPPORT
  `title` VARCHAR(150) NOT NULL,
  `details` LONGTEXT NULL,
  `officer_cid` VARCHAR(50) NULL,
  `officer_name` VARCHAR(100) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_citizenid` (`citizenid`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- License logs
CREATE TABLE IF NOT EXISTS `mdt_license_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `citizenid` VARCHAR(64) NOT NULL,
  `license_key` VARCHAR(32) NOT NULL,
  `new_status` TINYINT(1) NOT NULL DEFAULT 0,
  `action` VARCHAR(16) NOT NULL,
  `reason` VARCHAR(280) NULL,
  `officer_cid` VARCHAR(64) NULL,
  `officer_name` VARCHAR(128) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mdt_license_cid_time` (`citizenid`,`created_at`),
  KEY `idx_mdt_license_key_time` (`license_key`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Auditlogg (alla MDT-åtgärder)
CREATE TABLE IF NOT EXISTS `mdt_audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor_cid` VARCHAR(64) NULL,
  `actor_name` VARCHAR(128) NULL,
  `action` VARCHAR(32) NOT NULL,
  `entity` VARCHAR(32) NOT NULL,
  `entity_id` VARCHAR(64) NULL,
  `details` LONGTEXT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mdt_audit_time` (`created_at`),
  KEY `idx_mdt_audit_actor` (`actor_cid`,`created_at`),
  KEY `idx_mdt_audit_entity` (`entity`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
