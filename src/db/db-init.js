const mysql = require('mysql2/promise');

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'healthserv_db',
  });

  // Articles table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary VARCHAR(500) DEFAULT NULL,
      content LONGTEXT NOT NULL,
      main_image VARCHAR(500) DEFAULT NULL,
      images JSON DEFAULT NULL,
      tags JSON DEFAULT NULL,
      author_id  VARCHAR(36) NOT NULL,
      author_name VARCHAR(150) DEFAULT NULL,
      status ENUM('DRAFT','PENDING_APPROVAL','PUBLISHED','REJECTED','DELISTED') DEFAULT 'DRAFT',
      rejection_reason VARCHAR(500) DEFAULT NULL,
      delisted_reason VARCHAR(500) DEFAULT NULL,
      published_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Article comments table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS article_comments (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      article_id BIGINT NOT NULL,
      author_id BIGINT DEFAULT NULL,
      author_name VARCHAR(150) DEFAULT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Article reports table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS article_reports (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      article_id BIGINT NOT NULL,
      reported_by BIGINT NOT NULL,
      notes VARCHAR(500) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.end();
  logger.info('DB Initialized: tables ready');
}

module.exports = initDB;
