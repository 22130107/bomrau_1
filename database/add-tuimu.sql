-- Migration: Tính năng Túi Mù (Mystery Bag / Random Spin)
-- Thêm cột spin_price để cho phép mỗi category có giá quay riêng

ALTER TABLE categories
  ADD COLUMN `spin_price` int DEFAULT NULL COMMENT 'Giá quay riêng (VNĐ), NULL = dùng spin_cost global';
