/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80046 (8.0.46)
 Source Host           : localhost:3306
 Source Schema         : bomrautft

 Target Server Type    : MySQL
 Target Server Version : 80046 (8.0.46)
 File Encoding         : 65001

 Date: 09/07/2026 21:52:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for accounts
-- ----------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` int UNSIGNED NULL DEFAULT NULL,
  `distributor_id` int UNSIGNED NULL DEFAULT NULL COMMENT 'NPP cung c???p (n???u c??)',
  `login_username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T??i kho???n ????ng nh???p game',
  `login_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M???t kh???u ????ng nh???p game',
  `cost_price` decimal(15, 0) NOT NULL DEFAULT 0 COMMENT 'Gi?? v???n nh???p h??ng',
  `status` enum('available','sold','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Ghi ch?? th??m',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_accounts_product`(`product_id` ASC) USING BTREE,
  INDEX `idx_accounts_status`(`status` ASC) USING BTREE,
  INDEX `fk_accounts_distributor`(`distributor_id` ASC) USING BTREE,
  CONSTRAINT `fk_accounts_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_accounts_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 408 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of accounts
-- ----------------------------

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `fake_remaining_count` int NOT NULL DEFAULT 0,
  `fake_sold_count` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_spin_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `spin_price` int NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of categories
-- ----------------------------

-- ----------------------------
-- Table structure for distributors
-- ----------------------------
DROP TABLE IF EXISTS `distributors`;
CREATE TABLE `distributors`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL COMMENT 'Li??n k???t t???i user c?? role=npp',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T??n mi???n ri??ng c???a NPP',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `contact_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Th??ng tin li??n h??? b??? sung',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_fee_percent` decimal(5, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  UNIQUE INDEX `domain`(`domain` ASC) USING BTREE,
  INDEX `idx_distributors_domain`(`domain` ASC) USING BTREE,
  CONSTRAINT `fk_distributors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of distributors
-- ----------------------------
INSERT INTO `distributors` VALUES (2, 7, 'bomrau1', 'bomrau1.com', NULL, NULL, NULL, NULL, 0, '2026-05-26 16:51:07', '2026-05-28 17:32:15', 0.00);
INSERT INTO `distributors` VALUES (3, 10, 'hyun', 'hyun.id.vn', NULL, NULL, NULL, NULL, 1, '2026-05-28 17:31:07', '2026-05-29 19:21:23', 55.00);

-- ----------------------------
-- Table structure for events
-- ----------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bonus_amount` decimal(15, 0) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_distributed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of events
-- ----------------------------

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???????ng d???n ???nh th??ng b??o',
  `type` enum('news','promotion','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'news',
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_notifications_type`(`type` ASC) USING BTREE,
  INDEX `idx_notifications_pinned`(`is_pinned` ASC, `created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of notifications
-- ----------------------------

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL COMMENT 'Ng?????i mua',
  `product_id` int UNSIGNED NULL DEFAULT NULL,
  `account_id` int UNSIGNED NULL DEFAULT NULL COMMENT 'T??i kho???n game t????ng ???ng',
  `distributor_id` int UNSIGNED NULL DEFAULT NULL,
  `amount` decimal(15, 0) NOT NULL COMMENT 'S??? ti???n thanh to??n (VND)',
  `status` enum('pending','completed','cancelled','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `domain_purchased` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_orders_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_orders_product`(`product_id` ASC) USING BTREE,
  INDEX `idx_orders_status`(`status` ASC) USING BTREE,
  INDEX `fk_orders_account`(`account_id` ASC) USING BTREE,
  INDEX `fk_orders_distributor`(`distributor_id` ASC) USING BTREE,
  CONSTRAINT `fk_orders_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------

-- ----------------------------
-- Table structure for product_attribute_options
-- ----------------------------
DROP TABLE IF EXISTS `product_attribute_options`;
CREATE TABLE `product_attribute_options`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'pet_tim | san_tim | chuong',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_sort`(`type` ASC, `sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 773 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_attribute_options
-- ----------------------------

-- ----------------------------
-- Table structure for product_images
-- ----------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` int UNSIGNED NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 260 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_images
-- ----------------------------

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int UNSIGNED NOT NULL,
  `extra_categories` json NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` decimal(15, 0) NOT NULL COMMENT 'Gi?? b??n (VND)',
  `original_price` decimal(15, 0) NOT NULL COMMENT 'Gi?? g???c ch??a gi???m (VND)',
  `discount_percent` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Ph???n tr??m gi???m gi?? (0-100)',
  `fake_remaining_count` int UNSIGNED NOT NULL DEFAULT 0 COMMENT 'S??? l?????ng ???o c??n l???i',
  `fake_sold_count` int UNSIGNED NOT NULL DEFAULT 0 COMMENT 'S??? l?????ng ???o ???? b??n',
  `pet_tim` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `san_tim` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'S??? s??n t??m / th??ng tin s??n',
  `chuong` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'S??? ch?????ng / th??ng tin ch?????ng',
  `extra_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Th??ng tin b??? sung',
  `status` enum('available','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_products_category`(`category_id` ASC) USING BTREE,
  INDEX `idx_products_status`(`status` ASC) USING BTREE,
  INDEX `idx_products_price`(`price` ASC) USING BTREE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1199 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of products
-- ----------------------------

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES ('spin_cost', '20000', '2026-06-11 09:32:00');

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL,
  `type` enum('deposit','purchase','refund') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15, 0) NOT NULL COMMENT 'S??? ti???n (VND)',
  `method` enum('bank_transfer','momo','card') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Ph????ng th???c n???p ti???n',
  `status` enum('pending','completed','failed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reference_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'M?? giao d???ch b??n ngo??i',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_transactions_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_transactions_type`(`type` ASC) USING BTREE,
  INDEX `idx_transactions_status`(`status` ASC) USING BTREE,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 65 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of transactions
-- ----------------------------
INSERT INTO `transactions` VALUES (33, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 538', 'ORDER_23', '2026-05-31 15:31:28', '2026-05-31 15:31:28');
INSERT INTO `transactions` VALUES (34, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: Annietiemtrangotngao', 'ORDER_24', '2026-05-31 15:31:39', '2026-05-31 15:31:39');
INSERT INTO `transactions` VALUES (35, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 351', 'ORDER_25', '2026-05-31 15:32:00', '2026-05-31 15:32:00');
INSERT INTO `transactions` VALUES (36, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: Lucicaoboivip1', 'ORDER_26', '2026-05-31 15:32:06', '2026-05-31 15:32:06');
INSERT INTO `transactions` VALUES (37, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 563', 'ORDER_27', '2026-05-31 15:32:12', '2026-05-31 15:32:12');
INSERT INTO `transactions` VALUES (38, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: t1yone', 'ORDER_28', '2026-05-31 15:47:13', '2026-05-31 15:47:13');
INSERT INTO `transactions` VALUES (39, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: LucianCaoBồiĐộtPhá', 'ORDER_29', '2026-05-31 15:47:28', '2026-05-31 15:47:28');
INSERT INTO `transactions` VALUES (40, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 669', 'ORDER_30', '2026-05-31 15:47:46', '2026-05-31 15:47:46');
INSERT INTO `transactions` VALUES (41, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 525', 'ORDER_31', '2026-06-05 16:00:24', '2026-06-05 16:00:24');
INSERT INTO `transactions` VALUES (42, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 456', 'ORDER_32', '2026-06-05 16:00:44', '2026-06-05 16:00:44');
INSERT INTO `transactions` VALUES (43, 24, 'purchase', 50000, NULL, 'completed', 'Quay random: 166', 'ORDER_33', '2026-06-05 16:01:04', '2026-06-05 16:01:04');
INSERT INTO `transactions` VALUES (44, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 401', 'ORDER_34', '2026-06-05 16:05:32', '2026-06-05 16:05:32');
INSERT INTO `transactions` VALUES (45, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 663', 'ORDER_35', '2026-06-05 16:05:49', '2026-06-05 16:05:49');
INSERT INTO `transactions` VALUES (46, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 459', 'ORDER_36', '2026-06-05 16:06:13', '2026-06-05 16:06:13');
INSERT INTO `transactions` VALUES (47, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 642', 'ORDER_37', '2026-06-05 16:06:24', '2026-06-05 16:06:24');
INSERT INTO `transactions` VALUES (48, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 655', 'ORDER_38', '2026-06-05 16:07:39', '2026-06-05 16:07:39');
INSERT INTO `transactions` VALUES (49, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 606', 'ORDER_39', '2026-06-05 16:07:49', '2026-06-05 16:07:49');
INSERT INTO `transactions` VALUES (50, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 587', 'ORDER_40', '2026-06-05 16:08:02', '2026-06-05 16:08:02');
INSERT INTO `transactions` VALUES (51, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 48', 'ORDER_41', '2026-06-05 16:08:16', '2026-06-05 16:08:16');
INSERT INTO `transactions` VALUES (52, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 435', 'ORDER_42', '2026-06-05 16:10:29', '2026-06-05 16:10:29');
INSERT INTO `transactions` VALUES (53, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 656', 'ORDER_43', '2026-06-05 16:10:34', '2026-06-05 16:10:34');
INSERT INTO `transactions` VALUES (54, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: 385', 'ORDER_44', '2026-06-05 16:11:06', '2026-06-05 16:11:06');
INSERT INTO `transactions` VALUES (55, 24, 'purchase', 50000, NULL, 'completed', 'Quay random: 212', 'ORDER_45', '2026-06-05 16:11:56', '2026-06-05 16:11:56');
INSERT INTO `transactions` VALUES (56, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: 133', 'ORDER_46', '2026-06-05 16:12:07', '2026-06-05 16:12:07');
INSERT INTO `transactions` VALUES (57, 24, 'purchase', 500000, NULL, 'completed', 'Quay random: Annietiemtrangotngaovip1', 'ORDER_47', '2026-06-05 16:45:12', '2026-06-05 16:45:12');
INSERT INTO `transactions` VALUES (58, 24, 'purchase', 30000, NULL, 'completed', 'Quay random: Quánlebunnybonbon', 'ORDER_48', '2026-06-05 16:45:39', '2026-06-05 16:45:39');
INSERT INTO `transactions` VALUES (59, 24, 'purchase', 189000, NULL, 'completed', 'Mua nick game: LucianCaoBồiĐộtPhá', 'ORDER_49', '2026-06-22 18:28:41', '2026-06-22 18:28:41');
INSERT INTO `transactions` VALUES (60, 24, 'purchase', 389000, NULL, 'completed', 'Mua nick game: Lucicaoboivip1', 'ORDER_50', '2026-06-22 18:29:31', '2026-06-22 18:29:31');
INSERT INTO `transactions` VALUES (61, 24, 'purchase', 389000, NULL, 'completed', 'Mua nick game: Lucicaoboivip1', 'ORDER_51', '2026-06-22 18:31:47', '2026-06-22 18:31:47');
INSERT INTO `transactions` VALUES (62, 24, 'purchase', 389000, NULL, 'completed', 'Mua nick game: Lucicaoboivip1', 'ORDER_52', '2026-06-22 18:32:18', '2026-06-22 18:32:18');
INSERT INTO `transactions` VALUES (63, 24, 'purchase', 389000, NULL, 'completed', 'Mua nick game: Lucicaoboivip1', 'ORDER_53', '2026-06-22 18:33:14', '2026-06-22 18:33:14');
INSERT INTO `transactions` VALUES (64, 24, 'purchase', 389000, NULL, 'completed', 'Mua nick game: Lucicaoboivip1', 'ORDER_54', '2026-06-22 18:41:29', '2026-06-22 18:41:29');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','npp','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `balance` decimal(15, 0) NOT NULL DEFAULT 0 COMMENT 'S??? d?? t??i kho???n (VND)',
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Google OAuth ID',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `idx_users_role`(`role` ASC) USING BTREE,
  INDEX `idx_users_google_id`(`google_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', NULL, NULL, '$2b$10$Cu/yYaJEmAYZH9/xyXBkhuRQS8Qqxd.4/9yVbXi8pCCcm8yLVdUdu', 'admin', 0, NULL, NULL, 1, '2026-07-09 21:38:13', '2026-07-09 21:38:13');

SET FOREIGN_KEY_CHECKS = 1;
