-- Migration: Thêm bảng events cho tính năng sự kiện phát thưởng

CREATE TABLE IF NOT EXISTS `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'Tên sự kiện',
  `bonus_amount` decimal(15,0) NOT NULL COMMENT 'Số tiền thưởng (VNĐ)',
  `start_date` datetime NOT NULL COMMENT 'Thời gian bắt đầu',
  `end_date` datetime NOT NULL COMMENT 'Thời gian kết thúc',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_distributed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Đã phát thưởng chưa',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
