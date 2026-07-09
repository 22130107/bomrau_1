import pool from "../src/lib/db";
import bcrypt from "bcryptjs";

async function reset() {
  console.log("Disabling foreign key checks...");
  await pool.query("SET FOREIGN_KEY_CHECKS = 0");

  const tables = [
    "product_images",
    "accounts",
    "orders",
    "product_attribute_options",
    "notifications",
    "products",
    "categories",
    "sessions",
    "deposits",
    "npp_logs",
    "users",
  ];

  for (const table of tables) {
    try {
      await pool.query(`TRUNCATE TABLE \`${table}\``);
      console.log(`  ✓ ${table}`);
    } catch (err: any) {
      console.log(`  × ${table}: ${err.message}`);
    }
  }

  await pool.query("SET FOREIGN_KEY_CHECKS = 1");

  // Create default admin account
  const hash = await bcrypt.hash("admin123", 10);
  await pool.query(
    "INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, 'admin', 1)",
    ["admin", hash]
  );
  console.log("  ✓ Created admin user (admin / admin123)");

  console.log("Done. All tables cleared.");
  process.exit(0);
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
