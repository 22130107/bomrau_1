import pool from "../src/lib/db";

async function migrate() {
  console.log("Creating product_images table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      product_id INT UNSIGNED NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      sort_order INT UNSIGNED DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log("Migrating existing image_url data...");
  await pool.query(`
    INSERT IGNORE INTO product_images (product_id, image_url, sort_order)
    SELECT id, image_url, 0 FROM products WHERE image_url IS NOT NULL AND image_url != ''
  `);

  console.log("Done!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
