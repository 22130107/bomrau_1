const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
(async () => {
  const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: '12345', database: 'bomrautft' });
  await c.execute('SET FOREIGN_KEY_CHECKS = 0');
  await c.execute('DELETE FROM users WHERE username = ?', ['ADMIN']);
  await c.execute('DELETE FROM users WHERE username = ?', ['admin']);
  await c.execute('SET FOREIGN_KEY_CHECKS = 1');
  const hash = await bcrypt.hash('admin123', 10);
  await c.execute("INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, 'admin', 1)", ['admin', hash]);
  console.log('Created admin / admin123 with role = admin');
  c.end();
})();
