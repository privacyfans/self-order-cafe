/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43)
 Source Host           : localhost:3306
 Source Schema         : cafe_pos_db

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43)
 File Encoding         : 65001

 Date: 24/09/2025 21:08:02
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_type` enum('STAFF','CUSTOMER','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int UNSIGNED NULL DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `entity_id` bigint UNSIGNED NULL DEFAULT NULL,
  `old_values` json NULL,
  `new_values` json NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_type` ASC, `user_id` ASC) USING BTREE,
  INDEX `idx_entity`(`entity_type` ASC, `entity_id` ASC) USING BTREE,
  INDEX `idx_action`(`action` ASC) USING BTREE,
  INDEX `idx_created`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `full_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_guest` tinyint(1) NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `last_visit_at` timestamp NULL DEFAULT NULL,
  `total_orders` int NULL DEFAULT 0,
  `total_spent` decimal(15, 2) NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `phone_number`(`phone_number` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_phone`(`phone_number` ASC) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customers
-- ----------------------------

-- ----------------------------
-- Table structure for daily_sales_summary
-- ----------------------------
DROP TABLE IF EXISTS `daily_sales_summary`;
CREATE TABLE `daily_sales_summary`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `summary_date` date NOT NULL,
  `total_orders` int NULL DEFAULT 0,
  `total_items_sold` int NULL DEFAULT 0,
  `gross_sales` decimal(15, 2) NULL DEFAULT 0.00,
  `total_discount` decimal(12, 2) NULL DEFAULT 0.00,
  `total_service_charge` decimal(12, 2) NULL DEFAULT 0.00,
  `total_tax` decimal(12, 2) NULL DEFAULT 0.00,
  `net_sales` decimal(15, 2) NULL DEFAULT 0.00,
  `cash_sales` decimal(15, 2) NULL DEFAULT 0.00,
  `qris_sales` decimal(15, 2) NULL DEFAULT 0.00,
  `card_sales` decimal(15, 2) NULL DEFAULT 0.00,
  `other_sales` decimal(15, 2) NULL DEFAULT 0.00,
  `outstanding_amount` decimal(15, 2) NULL DEFAULT 0.00,
  `cancelled_orders` int NULL DEFAULT 0,
  `average_order_value` decimal(10, 2) NULL DEFAULT 0.00,
  `peak_hour` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `summary_date`(`summary_date` ASC) USING BTREE,
  INDEX `idx_date`(`summary_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of daily_sales_summary
-- ----------------------------

-- ----------------------------
-- Table structure for error_logs
-- ----------------------------
DROP TABLE IF EXISTS `error_logs`;
CREATE TABLE `error_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `error_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `error_details` json NULL,
  `stack_trace` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `user_type` enum('STAFF','CUSTOMER','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_id` int UNSIGNED NULL DEFAULT NULL,
  `request_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_type`(`error_type` ASC) USING BTREE,
  INDEX `idx_created`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of error_logs
-- ----------------------------

-- ----------------------------
-- Table structure for hourly_sales
-- ----------------------------
DROP TABLE IF EXISTS `hourly_sales`;
CREATE TABLE `hourly_sales`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_date` date NOT NULL,
  `sale_hour` int NOT NULL COMMENT '0-23',
  `order_count` int NULL DEFAULT 0,
  `total_sales` decimal(12, 2) NULL DEFAULT 0.00,
  `average_preparation_time` int NULL DEFAULT NULL COMMENT 'in minutes',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_date_hour`(`sale_date` ASC, `sale_hour` ASC) USING BTREE,
  INDEX `idx_date`(`sale_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hourly_sales
-- ----------------------------

-- ----------------------------
-- Table structure for item_modifier_relations
-- ----------------------------
DROP TABLE IF EXISTS `item_modifier_relations`;
CREATE TABLE `item_modifier_relations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` int UNSIGNED NOT NULL,
  `modifier_id` int UNSIGNED NOT NULL,
  `is_required` tinyint(1) NULL DEFAULT 0,
  `max_quantity` int NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_item_modifier`(`item_id` ASC, `modifier_id` ASC) USING BTREE,
  INDEX `modifier_id`(`modifier_id` ASC) USING BTREE,
  CONSTRAINT `item_modifier_relations_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `item_modifier_relations_ibfk_2` FOREIGN KEY (`modifier_id`) REFERENCES `item_modifiers` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of item_modifier_relations
-- ----------------------------

-- ----------------------------
-- Table structure for item_modifiers
-- ----------------------------
DROP TABLE IF EXISTS `item_modifiers`;
CREATE TABLE `item_modifiers`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modifier_type` enum('ADD_ON','OPTION','REMOVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'OPTION',
  `price_adjustment` decimal(10, 2) NULL DEFAULT 0.00,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of item_modifiers
-- ----------------------------
INSERT INTO `item_modifiers` VALUES (1, 'Extra Shot', 'ADD_ON', 5000.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (2, 'No Sugar', 'OPTION', 0.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (3, 'Less Ice', 'OPTION', 0.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (4, 'Extra Ice', 'OPTION', 0.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (5, 'Soy Milk', 'OPTION', 3000.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (6, 'Oat Milk', 'OPTION', 5000.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (7, 'Extra Cheese', 'ADD_ON', 8000.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `item_modifiers` VALUES (8, 'No MSG', 'OPTION', 0.00, 1, '2025-09-19 15:15:36', '2025-09-19 15:15:36');

-- ----------------------------
-- Table structure for item_sizes
-- ----------------------------
DROP TABLE IF EXISTS `item_sizes`;
CREATE TABLE `item_sizes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` int UNSIGNED NOT NULL,
  `size_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_adjustment` decimal(10, 2) NULL DEFAULT 0.00 COMMENT 'Additional price for this size',
  `is_default` tinyint(1) NULL DEFAULT 0,
  `is_available` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_item_size`(`item_id` ASC, `size_name` ASC) USING BTREE,
  INDEX `idx_item_available`(`item_id` ASC, `is_available` ASC) USING BTREE,
  CONSTRAINT `item_sizes_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of item_sizes
-- ----------------------------

-- ----------------------------
-- Table structure for kitchen_queue
-- ----------------------------
DROP TABLE IF EXISTS `kitchen_queue`;
CREATE TABLE `kitchen_queue`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id` bigint UNSIGNED NOT NULL,
  `station_id` int UNSIGNED NOT NULL,
  `queue_status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `priority_level` int NULL DEFAULT 0 COMMENT 'Higher number = higher priority',
  `assigned_to` int UNSIGNED NULL DEFAULT NULL COMMENT 'Kitchen staff ID',
  `start_time` timestamp NULL DEFAULT NULL,
  `completion_time` timestamp NULL DEFAULT NULL,
  `preparation_duration` int NULL DEFAULT NULL COMMENT 'in seconds',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_item_id`(`order_item_id` ASC) USING BTREE,
  INDEX `assigned_to`(`assigned_to` ASC) USING BTREE,
  INDEX `idx_station_status`(`station_id` ASC, `queue_status` ASC) USING BTREE,
  INDEX `idx_priority`(`priority_level` ASC, `created_at` ASC) USING BTREE,
  CONSTRAINT `kitchen_queue_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `kitchen_queue_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `kitchen_stations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `kitchen_queue_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of kitchen_queue
-- ----------------------------

-- ----------------------------
-- Table structure for kitchen_stations
-- ----------------------------
DROP TABLE IF EXISTS `kitchen_stations`;
CREATE TABLE `kitchen_stations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `station_type` enum('FOOD','BEVERAGE','DESSERT','ALL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ALL',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of kitchen_stations
-- ----------------------------

-- ----------------------------
-- Table structure for menu_categories
-- ----------------------------
DROP TABLE IF EXISTS `menu_categories`;
CREATE TABLE `menu_categories`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `display_order` int NULL DEFAULT 0,
  `icon_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_active_order`(`is_active` ASC, `display_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_categories
-- ----------------------------
INSERT INTO `menu_categories` VALUES (1, 'Minuman', 'Berbagai pilihan minuman segar', 1, NULL, 1, '2025-09-19 16:17:21', '2025-09-19 16:17:21');
INSERT INTO `menu_categories` VALUES (2, 'Makanan Utama', 'Hidangan utama yang mengenyangkan', 2, NULL, 1, '2025-09-19 16:17:21', '2025-09-19 16:17:21');
INSERT INTO `menu_categories` VALUES (3, 'Snack', 'Camilan ringan dan appetizer', 3, NULL, 1, '2025-09-19 16:17:21', '2025-09-19 16:17:21');
INSERT INTO `menu_categories` VALUES (4, 'Dessert', 'Penutup manis', 4, NULL, 1, '2025-09-19 16:17:21', '2025-09-19 16:17:21');

-- ----------------------------
-- Table structure for menu_items
-- ----------------------------
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int UNSIGNED NOT NULL,
  `sku` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `base_price` decimal(12, 2) NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_available` tinyint(1) NULL DEFAULT 1,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `preparation_time` int NULL DEFAULT 10 COMMENT 'in minutes',
  `display_order` int NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `sku`(`sku` ASC) USING BTREE,
  INDEX `idx_category_active`(`category_id` ASC, `is_active` ASC, `is_available` ASC) USING BTREE,
  INDEX `idx_sku`(`sku` ASC) USING BTREE,
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_items
-- ----------------------------
INSERT INTO `menu_items` VALUES (1, 1, NULL, 'Kopi Americano', 'Kopi hitam klasik dengan rasa yang kuat', 15000.00, '/uploads/menu-images/menu-1758637475803.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:24:36');
INSERT INTO `menu_items` VALUES (2, 1, NULL, 'Cappuccino', 'Espresso dengan steamed milk dan foam', 18000.00, '/uploads/menu-images/menu-1758636627195.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:10:27');
INSERT INTO `menu_items` VALUES (3, 1, NULL, 'Latte', 'Espresso dengan steamed milk yang creamy', 20000.00, '/uploads/menu-images/menu-1758637508442.jpeg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:25:08');
INSERT INTO `menu_items` VALUES (4, 1, NULL, 'Es Teh Manis', 'Teh manis dingin yang menyegarkan', 8000.00, '/uploads/menu-images/menu-1758637376772.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:22:57');
INSERT INTO `menu_items` VALUES (5, 1, NULL, 'Jus Jeruk', 'Jus jeruk segar tanpa gula tambahan', 12000.00, '/uploads/menu-images/menu-1758637433135.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:23:53');
INSERT INTO `menu_items` VALUES (6, 1, NULL, 'Chocolate Milkshake', 'Milkshake cokelat dengan whipped cream', 25000.00, '/uploads/menu-images/menu-1758637349625.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:22:29');
INSERT INTO `menu_items` VALUES (7, 2, NULL, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 28000.00, '/uploads/menu-images/menu-1758637589511.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:26:29');
INSERT INTO `menu_items` VALUES (8, 2, NULL, 'Mie Ayam Bakso', 'Mie ayam dengan bakso dan pangsit', 22000.00, '/uploads/menu-images/menu-1758637565682.jpeg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:26:05');
INSERT INTO `menu_items` VALUES (9, 2, NULL, 'Ayam Bakar', 'Ayam bakar bumbu kecap dengan nasi', 35000.00, '/uploads/menu-images/menu-1758636912170.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:15:12');
INSERT INTO `menu_items` VALUES (10, 2, NULL, 'Gado-gado', 'Sayuran segar dengan bumbu kacang', 18000.00, '/uploads/menu-images/menu-1758637542212.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:25:42');
INSERT INTO `menu_items` VALUES (11, 2, NULL, 'Soto Ayam', 'Soto ayam kuning dengan nasi', 20000.00, '/uploads/menu-images/menu-1758637617471.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:26:57');
INSERT INTO `menu_items` VALUES (12, 3, NULL, 'Pisang Goreng', 'Pisang goreng crispy dengan madu', 12000.00, '/uploads/menu-images/menu-1758637731556.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:28:51');
INSERT INTO `menu_items` VALUES (13, 3, NULL, 'Tahu Isi', 'Tahu goreng isi sayuran (5 pcs)', 15000.00, '/uploads/menu-images/menu-1758637778080.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:29:38');
INSERT INTO `menu_items` VALUES (14, 3, NULL, 'French Fries', 'Kentang goreng dengan saus sambal', 18000.00, '/uploads/menu-images/menu-1758637642836.png', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:27:23');
INSERT INTO `menu_items` VALUES (15, 3, NULL, 'Lumpia Semarang', 'Lumpia basah isi rebung (3 pcs)', 20000.00, '/uploads/menu-images/menu-1758637667409.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:27:47');
INSERT INTO `menu_items` VALUES (16, 4, NULL, 'Es Krim Vanilla', 'Es krim vanilla dengan topping', 15000.00, '/uploads/menu-images/menu-1758637831128.jpeg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:30:31');
INSERT INTO `menu_items` VALUES (17, 4, NULL, 'Brownies Cokelat', 'Brownies hangat dengan es krim', 22000.00, '/uploads/menu-images/menu-1758637805914.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:30:06');
INSERT INTO `menu_items` VALUES (18, 4, NULL, 'Pudding Karamel', 'Pudding lembut dengan saus karamel', 12000.00, '/uploads/menu-images/menu-1758637925235.jpeg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:32:05');
INSERT INTO `menu_items` VALUES (19, 4, NULL, 'Fruit Salad', 'Salad buah segar dengan yogurt', 18000.00, '/uploads/menu-images/menu-1758637889256.jpg', 1, 1, 10, 0, '2025-09-19 16:17:21', '2025-09-23 21:31:29');

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipient_type` enum('CUSTOMER','STAFF','KITCHEN','CASHIER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` int UNSIGNED NULL DEFAULT NULL,
  `order_id` bigint UNSIGNED NULL DEFAULT NULL,
  `notification_type` enum('ORDER_CONFIRMED','ORDER_READY','PAYMENT_REMINDER','PAYMENT_OVERDUE','SYSTEM_ALERT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'MEDIUM',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_recipient`(`recipient_type` ASC, `recipient_id` ASC, `is_read` ASC) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_created`(`created_at` ASC) USING BTREE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------

-- ----------------------------
-- Table structure for order_item_modifiers
-- ----------------------------
DROP TABLE IF EXISTS `order_item_modifiers`;
CREATE TABLE `order_item_modifiers`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id` bigint UNSIGNED NOT NULL,
  `modifier_id` int UNSIGNED NOT NULL,
  `modifier_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Snapshot of modifier name',
  `quantity` int NULL DEFAULT 1,
  `price_adjustment` decimal(10, 2) NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `modifier_id`(`modifier_id` ASC) USING BTREE,
  INDEX `idx_order_item`(`order_item_id` ASC) USING BTREE,
  CONSTRAINT `order_item_modifiers_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `order_item_modifiers_ibfk_2` FOREIGN KEY (`modifier_id`) REFERENCES `item_modifiers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_item_modifiers
-- ----------------------------

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `item_id` int UNSIGNED NOT NULL,
  `item_size_id` int UNSIGNED NULL DEFAULT NULL,
  `item_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Snapshot of item name',
  `quantity` int NOT NULL DEFAULT 1,
  `unit_price` decimal(10, 2) NOT NULL,
  `subtotal` decimal(12, 2) NOT NULL,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` enum('PENDING','PREPARING','READY','SERVED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `prepared_at` timestamp NULL DEFAULT NULL,
  `served_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `item_id`(`item_id` ASC) USING BTREE,
  INDEX `item_size_id`(`item_size_id` ASC) USING BTREE,
  INDEX `idx_order_status`(`order_id` ASC, `status` ASC) USING BTREE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`item_size_id`) REFERENCES `item_sizes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 72 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 4, 1, NULL, 'Kopi Americano', 1, 15000.00, 15000.00, NULL, 'READY', '2025-09-19 21:52:35', '2025-09-19 21:52:37', '2025-09-19 17:00:31', '2025-09-19 21:52:37');
INSERT INTO `order_items` VALUES (2, 4, 7, NULL, 'Nasi Goreng Spesial', 1, 28000.00, 28000.00, NULL, 'READY', '2025-09-19 21:52:46', '2025-09-19 21:52:47', '2025-09-19 17:00:31', '2025-09-19 21:52:47');
INSERT INTO `order_items` VALUES (3, 4, 12, NULL, 'Pisang Goreng', 2, 12000.00, 24000.00, NULL, 'READY', '2025-09-19 21:52:48', '2025-09-19 21:52:50', '2025-09-19 17:00:31', '2025-09-19 21:52:50');
INSERT INTO `order_items` VALUES (4, 4, 16, NULL, 'Es Krim Vanilla', 2, 15000.00, 30000.00, NULL, 'READY', '2025-09-19 21:52:51', '2025-09-19 21:52:52', '2025-09-19 17:00:31', '2025-09-19 21:52:52');
INSERT INTO `order_items` VALUES (5, 5, 16, NULL, 'Es Krim Vanilla', 1, 15000.00, 15000.00, NULL, 'SERVED', '2025-09-19 22:07:03', '2025-09-19 22:18:55', '2025-09-19 21:53:48', '2025-09-19 22:18:55');
INSERT INTO `order_items` VALUES (6, 5, 17, NULL, 'Brownies Cokelat', 1, 22000.00, 22000.00, NULL, 'SERVED', '2025-09-19 22:07:07', '2025-09-19 22:18:57', '2025-09-19 21:53:48', '2025-09-19 22:18:57');
INSERT INTO `order_items` VALUES (7, 5, 18, NULL, 'Pudding Karamel', 1, 12000.00, 12000.00, NULL, 'SERVED', '2025-09-19 22:07:09', '2025-09-19 22:18:58', '2025-09-19 21:53:48', '2025-09-19 22:18:58');
INSERT INTO `order_items` VALUES (8, 5, 19, NULL, 'Fruit Salad', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-19 22:07:12', '2025-09-19 22:18:59', '2025-09-19 21:53:48', '2025-09-19 22:18:59');
INSERT INTO `order_items` VALUES (9, 5, 7, NULL, 'Nasi Goreng Spesial', 1, 28000.00, 28000.00, NULL, 'SERVED', '2025-09-19 22:07:20', '2025-09-19 22:19:00', '2025-09-19 21:53:48', '2025-09-19 22:19:00');
INSERT INTO `order_items` VALUES (10, 5, 8, NULL, 'Mie Ayam Bakso', 1, 22000.00, 22000.00, NULL, 'SERVED', '2025-09-19 22:07:22', '2025-09-19 22:19:01', '2025-09-19 21:53:48', '2025-09-19 22:19:01');
INSERT INTO `order_items` VALUES (11, 6, 1, NULL, 'Kopi Americano', 1, 15000.00, 15000.00, NULL, 'SERVED', '2025-09-19 22:07:38', '2025-09-19 22:10:17', '2025-09-19 21:54:21', '2025-09-19 22:10:17');
INSERT INTO `order_items` VALUES (12, 6, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-19 22:07:40', '2025-09-19 22:10:17', '2025-09-19 21:54:21', '2025-09-19 22:10:17');
INSERT INTO `order_items` VALUES (13, 6, 7, NULL, 'Nasi Goreng Spesial', 1, 28000.00, 28000.00, NULL, 'SERVED', '2025-09-19 22:07:43', '2025-09-19 22:10:17', '2025-09-19 21:54:21', '2025-09-19 22:10:17');
INSERT INTO `order_items` VALUES (14, 6, 8, NULL, 'Mie Ayam Bakso', 1, 22000.00, 22000.00, NULL, 'SERVED', '2025-09-19 22:07:44', '2025-09-19 22:10:17', '2025-09-19 21:54:21', '2025-09-19 22:10:17');
INSERT INTO `order_items` VALUES (15, 6, 15, NULL, 'Lumpia Semarang', 1, 20000.00, 20000.00, NULL, 'SERVED', '2025-09-19 22:07:48', '2025-09-19 22:10:17', '2025-09-19 21:54:21', '2025-09-19 22:10:17');
INSERT INTO `order_items` VALUES (16, 7, 1, NULL, 'Kopi Americano', 2, 15000.00, 30000.00, NULL, 'SERVED', '2025-09-19 22:44:15', '2025-09-19 22:44:37', '2025-09-19 22:43:56', '2025-09-19 22:44:37');
INSERT INTO `order_items` VALUES (17, 7, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-19 22:44:41', '2025-09-19 22:44:57', '2025-09-19 22:43:56', '2025-09-19 22:44:57');
INSERT INTO `order_items` VALUES (18, 7, 3, NULL, 'Latte', 1, 20000.00, 20000.00, NULL, 'SERVED', '2025-09-19 22:44:42', '2025-09-19 22:44:58', '2025-09-19 22:43:56', '2025-09-19 22:44:58');
INSERT INTO `order_items` VALUES (19, 7, 7, NULL, 'Nasi Goreng Spesial', 1, 28000.00, 28000.00, NULL, 'SERVED', '2025-09-19 22:44:44', '2025-09-19 22:47:55', '2025-09-19 22:43:56', '2025-09-19 22:47:55');
INSERT INTO `order_items` VALUES (20, 7, 8, NULL, 'Mie Ayam Bakso', 1, 22000.00, 22000.00, NULL, 'SERVED', '2025-09-19 22:45:04', '2025-09-19 22:48:05', '2025-09-19 22:43:56', '2025-09-19 22:48:05');
INSERT INTO `order_items` VALUES (21, 7, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'SERVED', '2025-09-19 22:45:05', '2025-09-19 22:48:12', '2025-09-19 22:43:56', '2025-09-19 22:48:12');
INSERT INTO `order_items` VALUES (22, 8, 16, NULL, 'Es Krim Vanilla', 2, 15000.00, 30000.00, NULL, 'SERVED', '2025-09-20 00:04:50', '2025-09-20 00:05:04', '2025-09-19 23:04:23', '2025-09-20 00:05:04');
INSERT INTO `order_items` VALUES (23, 8, 17, NULL, 'Brownies Cokelat', 2, 22000.00, 44000.00, NULL, 'SERVED', '2025-09-20 00:04:52', '2025-09-20 00:05:04', '2025-09-19 23:04:23', '2025-09-20 00:05:04');
INSERT INTO `order_items` VALUES (24, 8, 1, NULL, 'Kopi Americano', 2, 15000.00, 30000.00, NULL, 'SERVED', '2025-09-20 00:04:55', '2025-09-20 00:05:04', '2025-09-19 23:04:23', '2025-09-20 00:05:04');
INSERT INTO `order_items` VALUES (25, 8, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-19 23:04:23', '2025-09-19 23:04:23');
INSERT INTO `order_items` VALUES (26, 9, 17, NULL, 'Brownies Cokelat', 1, 22000.00, 22000.00, NULL, 'SERVED', '2025-09-19 23:18:48', '2025-09-19 23:19:14', '2025-09-19 23:13:05', '2025-09-19 23:19:14');
INSERT INTO `order_items` VALUES (27, 9, 14, NULL, 'French Fries', 3, 18000.00, 54000.00, NULL, 'SERVED', '2025-09-19 23:18:50', '2025-09-19 23:19:16', '2025-09-19 23:13:05', '2025-09-19 23:19:16');
INSERT INTO `order_items` VALUES (28, 9, 10, NULL, 'Gado-gado', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-19 23:18:52', '2025-09-19 23:19:16', '2025-09-19 23:13:05', '2025-09-19 23:19:16');
INSERT INTO `order_items` VALUES (29, 9, 7, NULL, 'Nasi Goreng Spesial', 1, 28000.00, 28000.00, NULL, 'SERVED', '2025-09-19 23:18:55', '2025-09-19 23:19:17', '2025-09-19 23:13:05', '2025-09-19 23:19:17');
INSERT INTO `order_items` VALUES (30, 10, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'SERVED', '2025-09-19 23:18:43', '2025-09-19 23:19:21', '2025-09-19 23:13:20', '2025-09-19 23:19:21');
INSERT INTO `order_items` VALUES (31, 10, 10, NULL, 'Gado-gado', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-19 23:18:46', '2025-09-19 23:19:22', '2025-09-19 23:13:20', '2025-09-19 23:19:22');
INSERT INTO `order_items` VALUES (32, 8, 2, NULL, 'Cappuccino', 2, 18000.00, 36000.00, NULL, 'PENDING', NULL, NULL, '2025-09-19 23:20:03', '2025-09-19 23:20:03');
INSERT INTO `order_items` VALUES (33, 8, 6, NULL, 'Chocolate Milkshake', 1, 25000.00, 25000.00, NULL, 'PENDING', NULL, NULL, '2025-09-19 23:20:03', '2025-09-19 23:20:03');
INSERT INTO `order_items` VALUES (34, 8, 6, NULL, 'Chocolate Milkshake', 1, 25000.00, 25000.00, NULL, 'PENDING', NULL, NULL, '2025-09-19 23:20:22', '2025-09-19 23:20:22');
INSERT INTO `order_items` VALUES (35, 8, 4, NULL, 'Es Teh Manis', 1, 8000.00, 8000.00, NULL, 'PENDING', NULL, NULL, '2025-09-19 23:20:22', '2025-09-19 23:20:22');
INSERT INTO `order_items` VALUES (36, 12, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-19 23:49:25', '2025-09-20 00:05:09', '2025-09-19 23:44:45', '2025-09-20 00:05:09');
INSERT INTO `order_items` VALUES (37, 12, 6, NULL, 'Chocolate Milkshake', 2, 25000.00, 50000.00, NULL, 'SERVED', '2025-09-19 23:49:27', '2025-09-20 00:05:09', '2025-09-19 23:44:45', '2025-09-20 00:05:09');
INSERT INTO `order_items` VALUES (38, 13, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-20 00:07:58', '2025-09-20 00:08:30', '2025-09-19 23:45:43', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (39, 13, 6, NULL, 'Chocolate Milkshake', 1, 25000.00, 25000.00, NULL, 'SERVED', '2025-09-20 00:08:00', '2025-09-20 00:08:30', '2025-09-19 23:45:43', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (40, 13, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'SERVED', '2025-09-20 00:08:04', '2025-09-20 00:08:30', '2025-09-19 23:45:43', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (41, 13, 7, NULL, 'Nasi Goreng Spesial', 1, 28000.00, 28000.00, NULL, 'SERVED', '2025-09-20 00:08:07', '2025-09-20 00:08:30', '2025-09-19 23:46:23', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (42, 13, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'SERVED', '2025-09-20 00:08:09', '2025-09-20 00:08:30', '2025-09-20 00:07:36', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (43, 13, 10, NULL, 'Gado-gado', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-20 00:08:12', '2025-09-20 00:08:30', '2025-09-20 00:07:36', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (44, 13, 8, NULL, 'Mie Ayam Bakso', 1, 22000.00, 22000.00, NULL, 'SERVED', '2025-09-20 00:08:14', '2025-09-20 00:08:30', '2025-09-20 00:07:36', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (45, 13, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-20 00:08:19', '2025-09-20 00:08:30', '2025-09-20 00:07:36', '2025-09-20 00:08:30');
INSERT INTO `order_items` VALUES (46, 14, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-20 00:11:13', '2025-09-20 00:11:13');
INSERT INTO `order_items` VALUES (47, 14, 6, NULL, 'Chocolate Milkshake', 1, 25000.00, 25000.00, NULL, 'PENDING', NULL, NULL, '2025-09-20 00:11:13', '2025-09-20 00:11:13');
INSERT INTO `order_items` VALUES (48, 14, 4, NULL, 'Es Teh Manis', 1, 8000.00, 8000.00, NULL, 'PENDING', NULL, NULL, '2025-09-20 00:11:13', '2025-09-20 00:11:13');
INSERT INTO `order_items` VALUES (49, 14, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'PENDING', NULL, NULL, '2025-09-20 00:11:13', '2025-09-20 00:11:13');
INSERT INTO `order_items` VALUES (50, 15, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'SERVED', '2025-09-23 22:01:48', '2025-09-23 22:07:27', '2025-09-23 21:54:33', '2025-09-23 22:07:27');
INSERT INTO `order_items` VALUES (51, 15, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-23 22:07:17', '2025-09-23 22:07:29', '2025-09-23 21:54:33', '2025-09-23 22:07:29');
INSERT INTO `order_items` VALUES (52, 16, 9, NULL, 'Ayam Bakar', 2, 35000.00, 70000.00, NULL, 'SERVED', '2025-09-23 22:31:36', '2025-09-23 22:32:18', '2025-09-23 22:31:06', '2025-09-23 22:32:18');
INSERT INTO `order_items` VALUES (53, 16, 10, NULL, 'Gado-gado', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-23 22:31:38', '2025-09-23 22:32:19', '2025-09-23 22:31:06', '2025-09-23 22:32:19');
INSERT INTO `order_items` VALUES (54, 16, 4, NULL, 'Es Teh Manis', 2, 8000.00, 16000.00, NULL, 'SERVED', '2025-09-23 22:31:39', '2025-09-23 22:32:21', '2025-09-23 22:31:21', '2025-09-23 22:32:21');
INSERT INTO `order_items` VALUES (55, 16, 5, NULL, 'Jus Jeruk', 1, 12000.00, 12000.00, NULL, 'SERVED', '2025-09-23 22:31:41', '2025-09-23 22:32:22', '2025-09-23 22:31:21', '2025-09-23 22:32:22');
INSERT INTO `order_items` VALUES (56, 16, 11, NULL, 'Soto Ayam', 1, 20000.00, 20000.00, NULL, 'SERVED', '2025-09-23 23:41:33', '2025-09-23 23:47:09', '2025-09-23 22:56:24', '2025-09-23 23:47:09');
INSERT INTO `order_items` VALUES (57, 16, 8, NULL, 'Mie Ayam Bakso', 2, 22000.00, 44000.00, NULL, 'SERVED', '2025-09-23 23:41:36', '2025-09-23 23:47:09', '2025-09-23 22:56:24', '2025-09-23 23:47:09');
INSERT INTO `order_items` VALUES (58, 16, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'SERVED', '2025-09-23 23:41:42', '2025-09-23 23:47:09', '2025-09-23 22:56:33', '2025-09-23 23:47:09');
INSERT INTO `order_items` VALUES (59, 16, 4, NULL, 'Es Teh Manis', 1, 8000.00, 8000.00, NULL, 'SERVED', '2025-09-23 23:41:43', '2025-09-23 23:47:09', '2025-09-23 22:56:33', '2025-09-23 23:47:09');
INSERT INTO `order_items` VALUES (60, 17, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:03:51', '2025-09-23 23:03:51');
INSERT INTO `order_items` VALUES (61, 17, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:03:51', '2025-09-23 23:03:51');
INSERT INTO `order_items` VALUES (62, 17, 16, NULL, 'Es Krim Vanilla', 1, 15000.00, 15000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:03:51', '2025-09-23 23:03:51');
INSERT INTO `order_items` VALUES (63, 17, 14, NULL, 'French Fries', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:05:48', '2025-09-23 23:05:48');
INSERT INTO `order_items` VALUES (64, 17, 15, NULL, 'Lumpia Semarang', 1, 20000.00, 20000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:05:48', '2025-09-23 23:05:48');
INSERT INTO `order_items` VALUES (65, 17, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:15:38', '2025-09-23 23:15:38');
INSERT INTO `order_items` VALUES (66, 17, 5, NULL, 'Jus Jeruk', 1, 12000.00, 12000.00, NULL, 'PENDING', NULL, NULL, '2025-09-23 23:32:33', '2025-09-23 23:32:33');
INSERT INTO `order_items` VALUES (67, 18, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-24 11:08:01', '2025-09-24 11:08:01');
INSERT INTO `order_items` VALUES (68, 18, 10, NULL, 'Gado-gado', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-24 11:08:01', '2025-09-24 11:08:01');
INSERT INTO `order_items` VALUES (69, 19, 2, NULL, 'Cappuccino', 1, 18000.00, 18000.00, NULL, 'PENDING', NULL, NULL, '2025-09-24 20:08:21', '2025-09-24 20:08:21');
INSERT INTO `order_items` VALUES (70, 19, 1, NULL, 'Kopi Americano', 1, 15000.00, 15000.00, NULL, 'PENDING', NULL, NULL, '2025-09-24 20:08:21', '2025-09-24 20:08:21');
INSERT INTO `order_items` VALUES (71, 19, 9, NULL, 'Ayam Bakar', 1, 35000.00, 35000.00, NULL, 'PENDING', NULL, NULL, '2025-09-24 20:08:21', '2025-09-24 20:08:21');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_id` int UNSIGNED NULL DEFAULT NULL,
  `customer_id` int UNSIGNED NULL DEFAULT NULL,
  `order_type` enum('DINE_IN','TAKEAWAY','DELIVERY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'DINE_IN',
  `order_status` enum('SUBMITTED','PREPARING','READY','SERVED','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'SUBMITTED',
  `payment_status` enum('OUTSTANDING','PAID','PARTIALLY_PAID','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'OUTSTANDING',
  `subtotal` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `service_charge` decimal(10, 2) NULL DEFAULT 0.00,
  `tax_amount` decimal(10, 2) NULL DEFAULT 0.00,
  `discount_amount` decimal(10, 2) NULL DEFAULT 0.00,
  `total_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `estimated_ready_time` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `preparing_at` timestamp NULL DEFAULT NULL,
  `ready_at` timestamp NULL DEFAULT NULL,
  `served_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` int UNSIGNED NULL DEFAULT NULL,
  `cancellation_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_number`(`order_number` ASC) USING BTREE,
  INDEX `customer_id`(`customer_id` ASC) USING BTREE,
  INDEX `cancelled_by`(`cancelled_by` ASC) USING BTREE,
  INDEX `idx_order_number`(`order_number` ASC) USING BTREE,
  INDEX `idx_status`(`order_status` ASC, `payment_status` ASC) USING BTREE,
  INDEX `idx_table_status`(`table_id` ASC, `order_status` ASC) USING BTREE,
  INDEX `idx_submitted_at`(`submitted_at` ASC) USING BTREE,
  INDEX `idx_payment_outstanding`(`payment_status` ASC, `submitted_at` ASC) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`cancelled_by`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (4, 'ORD-1758276030999', 1, NULL, 'DINE_IN', 'PREPARING', 'PAID', 97000.00, 0.00, 0.00, 0.00, 97000.00, NULL, NULL, '2025-09-19 17:00:31', '2025-09-19 21:52:52', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 17:00:31', '2025-09-19 21:52:52');
INSERT INTO `orders` VALUES (5, 'ORD-1758293628478', 1, NULL, 'DINE_IN', 'READY', 'PAID', 117000.00, 0.00, 0.00, 0.00, 117000.00, NULL, NULL, '2025-09-19 21:53:48', '2025-09-19 22:07:24', NULL, '2025-09-19 22:06:24', NULL, NULL, NULL, NULL, '2025-09-19 21:53:48', '2025-09-19 22:34:29');
INSERT INTO `orders` VALUES (6, 'ORD-1758293661001', 2, NULL, 'DINE_IN', 'SERVED', 'PAID', 103000.00, 0.00, 0.00, 0.00, 103000.00, NULL, NULL, '2025-09-19 21:54:21', '2025-09-19 22:07:49', NULL, '2025-09-19 22:10:17', NULL, NULL, NULL, NULL, '2025-09-19 21:54:21', '2025-09-19 22:35:35');
INSERT INTO `orders` VALUES (7, 'ORD-1758296636064', 2, NULL, 'DINE_IN', 'PREPARING', 'PAID', 153000.00, 0.00, 0.00, 0.00, 153000.00, NULL, NULL, '2025-09-19 22:43:56', '2025-09-19 22:47:38', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 22:43:56', '2025-09-19 22:48:20');
INSERT INTO `orders` VALUES (8, 'ORD-1758297863094', 1, NULL, 'DINE_IN', 'PREPARING', 'PAID', 216000.00, 0.00, 0.00, 0.00, 216000.00, NULL, NULL, '2025-09-19 23:04:23', '2025-09-20 00:04:56', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 23:04:23', '2025-09-20 00:07:06');
INSERT INTO `orders` VALUES (9, 'ORD-1758298385756', 4, NULL, 'DINE_IN', 'PREPARING', 'PAID', 122000.00, 0.00, 0.00, 0.00, 122000.00, NULL, NULL, '2025-09-19 23:13:05', '2025-09-19 23:18:56', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 23:13:05', '2025-09-19 23:19:31');
INSERT INTO `orders` VALUES (10, 'ORD-1758298400964', 4, NULL, 'DINE_IN', 'PREPARING', 'PAID', 53000.00, 0.00, 0.00, 0.00, 53000.00, NULL, NULL, '2025-09-19 23:13:20', '2025-09-19 23:18:46', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 23:13:20', '2025-09-19 23:19:25');
INSERT INTO `orders` VALUES (12, 'ORD-1758300285536', 7, NULL, 'TAKEAWAY', 'PREPARING', 'PAID', 68000.00, 0.00, 0.00, 0.00, 68000.00, NULL, NULL, '2025-09-19 23:44:45', '2025-09-19 23:49:28', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 23:44:45', '2025-09-20 00:05:17');
INSERT INTO `orders` VALUES (13, 'ORD-1758300343564', 6, NULL, 'DINE_IN', 'PREPARING', 'PAID', 199000.00, 0.00, 0.00, 0.00, 199000.00, NULL, NULL, '2025-09-19 23:45:43', '2025-09-20 00:08:20', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-19 23:45:43', '2025-09-20 00:08:34');
INSERT INTO `orders` VALUES (14, 'ORD-1758301873275', 6, NULL, 'DINE_IN', 'SUBMITTED', 'PAID', 86000.00, 0.00, 0.00, 0.00, 86000.00, NULL, NULL, '2025-09-20 00:11:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-20 00:11:13', '2025-09-20 00:11:34');
INSERT INTO `orders` VALUES (15, 'ORD-1758639273259', 1, NULL, 'DINE_IN', 'PREPARING', 'PAID', 53000.00, 0.00, 0.00, 0.00, 53000.00, NULL, NULL, '2025-09-23 21:54:33', '2025-09-23 22:07:19', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-23 21:54:33', '2025-09-23 22:11:35');
INSERT INTO `orders` VALUES (16, 'ORD-1758641466033', 1, NULL, 'DINE_IN', 'PREPARING', 'PAID', 206000.00, 0.00, 0.00, 0.00, 206000.00, NULL, NULL, '2025-09-23 22:31:06', '2025-09-23 23:42:16', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-23 22:31:06', '2025-09-23 23:47:32');
INSERT INTO `orders` VALUES (17, 'ORD-1758643431092', 2, NULL, 'DINE_IN', 'SUBMITTED', 'PAID', 136000.00, 0.00, 0.00, 0.00, 136000.00, NULL, NULL, '2025-09-23 23:03:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-23 23:03:51', '2025-09-23 23:34:33');
INSERT INTO `orders` VALUES (18, 'ORD-1758686881944', 1, NULL, 'DINE_IN', 'SUBMITTED', 'PAID', 36000.00, 0.00, 0.00, 0.00, 36000.00, NULL, NULL, '2025-09-24 11:08:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-24 11:08:01', '2025-09-24 15:51:39');
INSERT INTO `orders` VALUES (19, 'ORD-1758719301874', 1, NULL, 'DINE_IN', 'SUBMITTED', 'OUTSTANDING', 68000.00, 0.00, 0.00, 0.00, 68000.00, NULL, NULL, '2025-09-24 20:08:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-24 20:08:21', '2025-09-24 20:08:21');

-- ----------------------------
-- Table structure for payment_alerts
-- ----------------------------
DROP TABLE IF EXISTS `payment_alerts`;
CREATE TABLE `payment_alerts`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `alert_level` int NULL DEFAULT 1 COMMENT '1=first reminder, 2=second, etc',
  `alert_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `acknowledged_by` int UNSIGNED NULL DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `acknowledged_by`(`acknowledged_by` ASC) USING BTREE,
  INDEX `idx_order_level`(`order_id` ASC, `alert_level` ASC) USING BTREE,
  INDEX `idx_unacknowledged`(`acknowledged_at` ASC) USING BTREE,
  CONSTRAINT `payment_alerts_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `payment_alerts_ibfk_2` FOREIGN KEY (`acknowledged_by`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payment_alerts
-- ----------------------------

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` enum('CASH','QRIS','DEBIT_CARD','CREDIT_CARD','E_WALLET','BANK_TRANSFER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12, 2) NOT NULL,
  `amount_tendered` decimal(12, 2) NULL DEFAULT NULL COMMENT 'For cash payments',
  `change_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT 'For cash payments',
  `payment_status` enum('PENDING','COMPLETED','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `reference_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'External payment reference',
  `processed_by` int UNSIGNED NOT NULL,
  `payment_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `payment_number`(`payment_number` ASC) USING BTREE,
  INDEX `processed_by`(`processed_by` ASC) USING BTREE,
  INDEX `idx_order`(`order_id` ASC) USING BTREE,
  INDEX `idx_payment_number`(`payment_number` ASC) USING BTREE,
  INDEX `idx_method_status`(`payment_method` ASC, `payment_status` ASC) USING BTREE,
  INDEX `idx_timestamp`(`payment_timestamp` ASC) USING BTREE,
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payments
-- ----------------------------
INSERT INTO `payments` VALUES (1, 4, 'PAY-1758276173336', 'QRIS', 97000.00, 97000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-19 17:02:53', NULL, '2025-09-19 17:02:53', '2025-09-19 17:02:53');
INSERT INTO `payments` VALUES (2, 5, 'PAY-1758296069825', 'CASH', 117000.00, 200000.00, 83000.00, 'COMPLETED', NULL, 1, '2025-09-19 22:34:29', NULL, '2025-09-19 22:34:29', '2025-09-19 22:34:29');
INSERT INTO `payments` VALUES (3, 6, 'PAY-1758296135365', 'CASH', 103000.00, 150000.00, 47000.00, 'COMPLETED', NULL, 1, '2025-09-19 22:35:35', NULL, '2025-09-19 22:35:35', '2025-09-19 22:35:35');
INSERT INTO `payments` VALUES (4, 7, 'PAY-1758296900115', 'QRIS', 153000.00, 153000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-19 22:48:20', NULL, '2025-09-19 22:48:20', '2025-09-19 22:48:20');
INSERT INTO `payments` VALUES (5, 10, 'PAY-1758298765820', 'QRIS', 53000.00, 53000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-19 23:19:25', NULL, '2025-09-19 23:19:25', '2025-09-19 23:19:25');
INSERT INTO `payments` VALUES (6, 9, 'PAY-1758298771947', 'QRIS', 122000.00, 122000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-19 23:19:31', NULL, '2025-09-19 23:19:31', '2025-09-19 23:19:31');
INSERT INTO `payments` VALUES (7, 12, 'PAY-1758301517741', 'CASH', 68000.00, 68000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-20 00:05:17', NULL, '2025-09-20 00:05:17', '2025-09-20 00:05:17');
INSERT INTO `payments` VALUES (8, 8, 'PAY-1758301626709', 'QRIS', 216000.00, 216000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-20 00:07:06', NULL, '2025-09-20 00:07:06', '2025-09-20 00:07:06');
INSERT INTO `payments` VALUES (9, 13, 'PAY-1758301714771', 'CASH', 199000.00, 199000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-20 00:08:34', NULL, '2025-09-20 00:08:34', '2025-09-20 00:08:34');
INSERT INTO `payments` VALUES (10, 14, 'PAY-1758301894808', 'CASH', 86000.00, 86000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-20 00:11:34', NULL, '2025-09-20 00:11:34', '2025-09-20 00:11:34');
INSERT INTO `payments` VALUES (11, 15, 'PAY-1758640295431', 'QRIS', 53000.00, 53000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-23 22:11:35', NULL, '2025-09-23 22:11:35', '2025-09-23 22:11:35');
INSERT INTO `payments` VALUES (12, 17, 'PAY-1758645273700', 'CASH', 136000.00, 136000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-23 23:34:33', NULL, '2025-09-23 23:34:33', '2025-09-23 23:34:33');
INSERT INTO `payments` VALUES (13, 16, 'PAY-1758646053313', 'QRIS', 206000.00, 206000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-23 23:47:32', NULL, '2025-09-23 23:47:32', '2025-09-23 23:47:32');
INSERT INTO `payments` VALUES (14, 18, 'PAY-1758703899699', 'CASH', 36000.00, 36000.00, 0.00, 'COMPLETED', NULL, 1, '2025-09-24 15:51:39', NULL, '2025-09-24 15:51:39', '2025-09-24 15:51:39');

-- ----------------------------
-- Table structure for popular_items_daily
-- ----------------------------
DROP TABLE IF EXISTS `popular_items_daily`;
CREATE TABLE `popular_items_daily`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_date` date NOT NULL,
  `item_id` int UNSIGNED NOT NULL,
  `quantity_sold` int NULL DEFAULT 0,
  `total_revenue` decimal(12, 2) NULL DEFAULT 0.00,
  `rank_position` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_date_item`(`report_date` ASC, `item_id` ASC) USING BTREE,
  INDEX `item_id`(`item_id` ASC) USING BTREE,
  INDEX `idx_date_rank`(`report_date` ASC, `rank_position` ASC) USING BTREE,
  CONSTRAINT `popular_items_daily_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of popular_items_daily
-- ----------------------------

-- ----------------------------
-- Table structure for promo_codes
-- ----------------------------
DROP TABLE IF EXISTS `promo_codes`;
CREATE TABLE `promo_codes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10, 2) NOT NULL,
  `min_order_amount` decimal(10, 2) NULL DEFAULT 0.00,
  `max_discount_amount` decimal(10, 2) NULL DEFAULT NULL,
  `usage_limit` int NULL DEFAULT NULL,
  `used_count` int NULL DEFAULT 0,
  `valid_from` timestamp NOT NULL,
  `valid_until` timestamp NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_code_active`(`code` ASC, `is_active` ASC) USING BTREE,
  INDEX `idx_validity`(`valid_from` ASC, `valid_until` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of promo_codes
-- ----------------------------

-- ----------------------------
-- Table structure for promo_usage
-- ----------------------------
DROP TABLE IF EXISTS `promo_usage`;
CREATE TABLE `promo_usage`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `promo_id` int UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `customer_id` int UNSIGNED NULL DEFAULT NULL,
  `discount_amount` decimal(10, 2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_order_promo`(`order_id` ASC, `promo_id` ASC) USING BTREE,
  INDEX `idx_promo`(`promo_id` ASC) USING BTREE,
  INDEX `idx_customer`(`customer_id` ASC) USING BTREE,
  CONSTRAINT `promo_usage_ibfk_1` FOREIGN KEY (`promo_id`) REFERENCES `promo_codes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `promo_usage_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `promo_usage_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of promo_usage
-- ----------------------------

-- ----------------------------
-- Table structure for qr_scan_logs
-- ----------------------------
DROP TABLE IF EXISTS `qr_scan_logs`;
CREATE TABLE `qr_scan_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_id` int UNSIGNED NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `scan_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_table_time`(`table_id` ASC, `scan_timestamp` ASC) USING BTREE,
  CONSTRAINT `qr_scan_logs_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of qr_scan_logs
-- ----------------------------

-- ----------------------------
-- Table structure for shifts
-- ----------------------------
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `staff_id` int UNSIGNED NOT NULL,
  `shift_date` date NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `opening_cash` decimal(10, 2) NULL DEFAULT 0.00,
  `closing_cash` decimal(10, 2) NULL DEFAULT NULL,
  `total_cash_sales` decimal(12, 2) NULL DEFAULT 0.00,
  `total_digital_sales` decimal(12, 2) NULL DEFAULT 0.00,
  `cash_difference` decimal(10, 2) NULL DEFAULT NULL COMMENT 'Difference between expected and actual',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` enum('ACTIVE','CLOSED','RECONCILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_staff_date`(`staff_id` ASC, `shift_date` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shifts
-- ----------------------------

-- ----------------------------
-- Table structure for staff
-- ----------------------------
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','MANAGER','CASHIER','KITCHEN','WAITER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `employee_id`(`employee_id` ASC) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_role_active`(`role` ASC, `is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of staff
-- ----------------------------
INSERT INTO `staff` VALUES (1, 'EMP001', 'Admin User', 'admin@cafe.com', '081234567890', 'admin', '$2b$10$tj8hXw.299Kp7vG47tz60u3ef5yXzAwWEUcSy0e9o8jC74n9yrdxe', 'ADMIN', 1, '2025-09-24 15:08:10', '2025-09-24 15:07:38', '2025-09-24 15:08:10');
INSERT INTO `staff` VALUES (2, 'EMP002', 'John Cashier', 'cashier1@cafe.com', '081234567891', 'cashier1', '$2b$10$MIBJt19rhipehAF1d2rpaeI.nWVzHqyiArHUuhvCKV2xse8nsoyHy', 'CASHIER', 1, '2025-09-24 15:07:51', '2025-09-24 15:07:38', '2025-09-24 15:07:51');
INSERT INTO `staff` VALUES (3, 'EMP003', 'Jane Kitchen', 'kitchen1@cafe.com', '081234567892', 'kitchen1', '$2b$10$K4SBEK8rXhhemGIGZCrAJOwFflcPICOU34uhuuwHKgStDLcLbvKPq', 'KITCHEN', 1, '2025-09-24 15:07:57', '2025-09-24 15:07:38', '2025-09-24 15:07:57');
INSERT INTO `staff` VALUES (4, 'EMP004', 'Bob Manager', 'manager@cafe.com', '081234567893', 'manager', '$2b$10$u.MLHcXuugL5CCgpVTZ4lOm2TaDj/AzaCFNXBLoDWa/1m2wBElci.', 'MANAGER', 1, '2025-09-24 15:26:32', '2025-09-24 15:07:38', '2025-09-24 15:26:32');
INSERT INTO `staff` VALUES (5, 'EMP005', 'Alice Waiter', 'waiter1@cafe.com', '081234567894', 'waiter1', '$2b$10$u.MLHcXuugL5CCgpVTZ4lOm2TaDj/AzaCFNXBLoDWa/1m2wBElci.', 'WAITER', 1, '2025-09-24 15:12:38', '2025-09-24 15:07:38', '2025-09-24 15:12:38');

-- ----------------------------
-- Table structure for system_settings
-- ----------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `setting_type` enum('STRING','NUMBER','BOOLEAN','JSON') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'STRING',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_editable` tinyint(1) NULL DEFAULT 1,
  `updated_by` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `setting_key`(`setting_key` ASC) USING BTREE,
  INDEX `updated_by`(`updated_by` ASC) USING BTREE,
  INDEX `idx_key`(`setting_key` ASC) USING BTREE,
  CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_settings
-- ----------------------------
INSERT INTO `system_settings` VALUES (1, 'service_charge_percentage', '10', 'NUMBER', 'Service charge percentage for dine-in', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (2, 'tax_percentage', '11', 'NUMBER', 'Tax percentage (PPN)', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (3, 'min_order_amount', '25000', 'NUMBER', 'Minimum order amount for table service', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (4, 'order_timeout_minutes', '15', 'NUMBER', 'Order timeout if no payment', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (5, 'payment_alert_hours', '2', 'NUMBER', 'Hours before payment alert', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (6, 'max_unpaid_orders_per_table', '5', 'NUMBER', 'Maximum unpaid orders per table', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (7, 'business_hours_start', '08:00', 'STRING', 'Business hours start time', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');
INSERT INTO `system_settings` VALUES (8, 'business_hours_end', '22:00', 'STRING', 'Business hours end time', 1, NULL, '2025-09-19 15:15:36', '2025-09-19 15:15:36');

-- ----------------------------
-- Table structure for tables
-- ----------------------------
DROP TABLE IF EXISTS `tables`;
CREATE TABLE `tables`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `capacity` int NULL DEFAULT 4,
  `location_zone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Indoor, Outdoor, VIP, etc',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `is_occupied` tinyint(1) NULL DEFAULT 0,
  `last_occupied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `table_number`(`table_number` ASC) USING BTREE,
  UNIQUE INDEX `qr_code`(`qr_code` ASC) USING BTREE,
  INDEX `idx_qr`(`qr_code` ASC) USING BTREE,
  INDEX `idx_active_occupied`(`is_active` ASC, `is_occupied` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tables
-- ----------------------------
INSERT INTO `tables` VALUES (1, '1', 'http://localhost:3000/menu/1', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 17:00:18', '2025-09-23 21:45:31');
INSERT INTO `tables` VALUES (2, '2', 'http://localhost:3000/menu/2', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 17:00:18', '2025-09-23 21:45:55');
INSERT INTO `tables` VALUES (3, '3', 'http://localhost:3000/menu/3', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 17:00:18', '2025-09-23 21:46:01');
INSERT INTO `tables` VALUES (4, '4', 'QR004', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 17:00:18', '2025-09-19 17:00:18');
INSERT INTO `tables` VALUES (5, '5', 'QR005', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 17:00:18', '2025-09-19 17:00:18');
INSERT INTO `tables` VALUES (6, '6', 'QR006', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 17:00:18', '2025-09-19 17:00:18');
INSERT INTO `tables` VALUES (7, 'TAKEAWAY', 'TAKEAWAY-QR', NULL, 1, NULL, 1, 0, NULL, '2025-09-19 23:43:28', '2025-09-19 23:43:28');
INSERT INTO `tables` VALUES (8, '8', 'TABLE-8-QR', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 23:43:28', '2025-09-19 23:43:28');
INSERT INTO `tables` VALUES (9, '9', 'TABLE-9-QR', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 23:43:28', '2025-09-19 23:43:28');
INSERT INTO `tables` VALUES (10, '10', 'TABLE-10-QR', NULL, 4, NULL, 1, 0, NULL, '2025-09-19 23:43:28', '2025-09-19 23:43:28');
INSERT INTO `tables` VALUES (11, 'VIP-1', 'http://localhost:3000/menu/VIP-1', NULL, 8, 'VIP Area', 1, 0, NULL, '2025-09-23 21:41:41', '2025-09-23 21:41:41');

-- ----------------------------
-- View structure for v_outstanding_payments
-- ----------------------------
DROP VIEW IF EXISTS `v_outstanding_payments`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_outstanding_payments` AS select `o`.`id` AS `id`,`o`.`order_number` AS `order_number`,`o`.`table_id` AS `table_id`,`t`.`table_number` AS `table_number`,`o`.`customer_id` AS `customer_id`,`c`.`full_name` AS `customer_name`,`c`.`phone_number` AS `phone_number`,`o`.`total_amount` AS `total_amount`,`o`.`submitted_at` AS `submitted_at`,timestampdiff(HOUR,`o`.`submitted_at`,now()) AS `hours_outstanding`,`o`.`order_status` AS `order_status`,`o`.`payment_status` AS `payment_status` from ((`orders` `o` left join `tables` `t` on((`o`.`table_id` = `t`.`id`))) left join `customers` `c` on((`o`.`customer_id` = `c`.`id`))) where ((`o`.`payment_status` = 'OUTSTANDING') and (`o`.`order_status` not in ('CANCELLED','COMPLETED')));

-- ----------------------------
-- View structure for v_popular_items_today
-- ----------------------------
DROP VIEW IF EXISTS `v_popular_items_today`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_popular_items_today` AS select `mi`.`id` AS `id`,`mi`.`name` AS `name`,`mi`.`category_id` AS `category_id`,`mc`.`name` AS `category_name`,sum(`oi`.`quantity`) AS `quantity_sold`,sum(`oi`.`subtotal`) AS `total_revenue`,count(distinct `oi`.`order_id`) AS `order_count` from (((`order_items` `oi` join `menu_items` `mi` on((`oi`.`item_id` = `mi`.`id`))) join `menu_categories` `mc` on((`mi`.`category_id` = `mc`.`id`))) join `orders` `o` on((`oi`.`order_id` = `o`.`id`))) where ((cast(`o`.`submitted_at` as date) = curdate()) and (`o`.`order_status` <> 'CANCELLED')) group by `mi`.`id`,`mi`.`name`,`mi`.`category_id`,`mc`.`name` order by `quantity_sold` desc;

-- ----------------------------
-- View structure for v_todays_sales
-- ----------------------------
DROP VIEW IF EXISTS `v_todays_sales`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_todays_sales` AS select count(distinct `o`.`id`) AS `total_orders`,sum(`o`.`total_amount`) AS `total_sales`,sum((case when (`p`.`payment_method` = 'CASH') then `p`.`amount` else 0 end)) AS `cash_sales`,sum((case when (`p`.`payment_method` = 'QRIS') then `p`.`amount` else 0 end)) AS `qris_sales`,sum((case when (`p`.`payment_method` in ('DEBIT_CARD','CREDIT_CARD')) then `p`.`amount` else 0 end)) AS `card_sales`,avg(`o`.`total_amount`) AS `average_order_value`,count(distinct (case when (`o`.`order_status` = 'CANCELLED') then `o`.`id` end)) AS `cancelled_orders` from (`orders` `o` left join `payments` `p` on(((`o`.`id` = `p`.`order_id`) and (`p`.`payment_status` = 'COMPLETED')))) where (cast(`o`.`submitted_at` as date) = curdate());

-- ----------------------------
-- Procedure structure for sp_calculate_order_totals
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_calculate_order_totals`;
delimiter ;;
CREATE PROCEDURE `sp_calculate_order_totals`(IN order_id BIGINT)
BEGIN
    DECLARE subtotal_amount DECIMAL(12,2);
    DECLARE service_charge_pct DECIMAL(5,2);
    DECLARE tax_pct DECIMAL(5,2);
    
    -- Get system settings
    SELECT CAST(setting_value AS DECIMAL(5,2)) INTO service_charge_pct
    FROM system_settings WHERE setting_key = 'service_charge_percentage';
    
    SELECT CAST(setting_value AS DECIMAL(5,2)) INTO tax_pct
    FROM system_settings WHERE setting_key = 'tax_percentage';
    
    -- Calculate subtotal from order items
    SELECT SUM(oi.subtotal) INTO subtotal_amount
    FROM order_items oi
    WHERE oi.order_id = order_id
    AND oi.status != 'CANCELLED';
    
    -- Update order totals
    UPDATE orders o
    SET 
        o.subtotal = subtotal_amount,
        o.service_charge = CASE 
            WHEN o.order_type = 'DINE_IN' 
            THEN subtotal_amount * (service_charge_pct / 100) 
            ELSE 0 
        END,
        o.tax_amount = subtotal_amount * (tax_pct / 100),
        o.total_amount = subtotal_amount + 
            CASE WHEN o.order_type = 'DINE_IN' THEN subtotal_amount * (service_charge_pct / 100) ELSE 0 END +
            (subtotal_amount * (tax_pct / 100)) - 
            IFNULL(o.discount_amount, 0)
    WHERE o.id = order_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_check_outstanding_payments
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_check_outstanding_payments`;
delimiter ;;
CREATE PROCEDURE `sp_check_outstanding_payments`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE order_id BIGINT;
    DECLARE hours_outstanding INT;
    DECLARE alert_threshold INT;
    
    DECLARE cur CURSOR FOR 
        SELECT o.id, TIMESTAMPDIFF(HOUR, o.submitted_at, NOW())
        FROM orders o
        WHERE o.payment_status = 'OUTSTANDING'
        AND o.order_status NOT IN ('CANCELLED');
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Get alert threshold from settings
    SELECT CAST(setting_value AS UNSIGNED) INTO alert_threshold
    FROM system_settings WHERE setting_key = 'payment_alert_hours';
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO order_id, hours_outstanding;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Create alert if threshold exceeded and no recent alert exists
        IF hours_outstanding >= alert_threshold THEN
            INSERT IGNORE INTO payment_alerts (order_id, alert_level)
            SELECT order_id, 1
            WHERE NOT EXISTS (
                SELECT 1 FROM payment_alerts pa 
                WHERE pa.order_id = order_id 
                AND pa.acknowledged_at IS NULL
            );
        END IF;
    END LOOP;
    
    CLOSE cur;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_generate_order_number
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_generate_order_number`;
delimiter ;;
CREATE PROCEDURE `sp_generate_order_number`(OUT order_num VARCHAR(20))
BEGIN
    DECLARE today_date VARCHAR(8);
    DECLARE sequence_num INT;
    
    SET today_date = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM orders
    WHERE DATE(submitted_at) = CURDATE();
    
    SET order_num = CONCAT('ORD-', today_date, '-', LPAD(sequence_num, 4, '0'));
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
