const db = require('../db/mysql');
const { logger } = require('@emedihub/observability-backend');
// Note: LIMIT values must be inlined (not parameterized) for mysql2

exports.createArticle = async data => {
  try {
    const [res] = await db.execute(
      `INSERT INTO articles
       (title, summary, content, main_image, images, tags, author_id, author_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.summary,
        data.content,
        data.mainImage || null,
        JSON.stringify(data.images || []),
        JSON.stringify(data.tags || []),
        data.authorId,
        data.authorName
      ]
    );
    return res.insertId;
  } catch (err) {
    logger.error('DB ERROR createArticle', err);
    throw err; // Let route catch
  }
};


exports.updateArticle = (id, authorId, data) =>
  db.execute(
    `UPDATE articles
     SET title=?, summary=?, content=?, main_image=?, images=?, tags=?
     WHERE id=? AND author_id=? AND status='DRAFT'`,
    [
      data.title,
      data.summary,
      data.content,
      data.mainImage || null,
      JSON.stringify(data.images || []),
      JSON.stringify(data.tags || []),
      id,
      authorId
    ]
  );

exports.submitForApproval = (id, authorId) =>
  db.execute(
    `UPDATE articles
     SET status='PENDING_APPROVAL'
     WHERE id=? AND author_id=? AND status='DRAFT'`,
    [id, authorId]
  );

exports.getPublishedArticles = filters => {
  let sql = `SELECT * FROM articles WHERE status='PUBLISHED'`;
  const params = [];

  if (filters.authorId) {
    sql += ` AND author_id=?`;
    params.push(filters.authorId);
  }

  if (filters.tag) {
    sql += ` AND JSON_CONTAINS(tags, JSON_QUOTE(?))`;
    params.push(filters.tag);
  }

  sql += ` ORDER BY published_at DESC`;
  return db.execute(sql, params);
};

exports.getArticleById = async id => {
  const [rows] = await db.execute(`SELECT * FROM articles WHERE id=?`, [id]);
  return rows[0] || null;
};

exports.getCommentsByArticle = async articleId => {
  const [rows] = await db.execute(`SELECT * FROM article_comments WHERE article_id=? ORDER BY created_at ASC`, [articleId]);
  return rows;
};

exports.getArticlesByAuthor = async (authorId, limit, offset) => {
  // force integers
  limit = Number(limit);
  offset = Number(offset);

  const sql = `
    SELECT *
    FROM articles
    WHERE author_id = ?
    LIMIT ${limit} OFFSET ${offset};
  `;

  const [rows] = await db.execute(sql, [authorId]);
  return rows;
};


exports.countArticlesByAuthor = async (authorId) => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM articles
    WHERE author_id = ?;
  `;

  const [rows] = await db.execute(sql, [authorId]);
  return rows[0].total;
};



exports.countArticlesByAuthorWithFilters = async (authorId, filters) => {
  let sql = `SELECT COUNT(*) as cnt FROM articles WHERE author_id=?`;
  const params = [authorId];

  if (filters.status) {
    sql += ` AND status=?`;
    params.push(filters.status);
  }

  if (filters.title) {
    sql += ` AND title LIKE ?`;
    params.push(`%${filters.title}%`);
  }

  if (filters.startDate) {
    sql += ` AND created_at>=?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ` AND created_at<=?`;
    params.push(filters.endDate);
  }

  const [rows] = await db.execute(sql, params);
  return rows[0] ? rows[0].cnt : 0;
};

exports.getArticlesByAuthorWithFilters = async (authorId, filters, limit, offset) => {
  let sql = `SELECT * FROM articles WHERE author_id=?`;
  const params = [authorId];

  if (filters.status) {
    sql += ` AND status=?`;
    params.push(filters.status);
  }

  if (filters.title) {
    sql += ` AND title LIKE ?`;
    params.push(`%${filters.title}%`);
  }

  if (filters.startDate) {
    sql += ` AND created_at>=?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ` AND created_at<=?`;
    params.push(filters.endDate);
  }

  sql += ` ORDER BY created_at DESC LIMIT ${Math.floor(offset)}, ${Math.floor(limit)}`;

  return db.execute(sql, params);
};

exports.getPublishedArticlesWithPagination = async (limit, offset) => {
  const sql = `SELECT * FROM articles WHERE status='PUBLISHED' ORDER BY published_at DESC LIMIT ${Math.floor(offset)}, ${Math.floor(limit)}`;
  return db.execute(sql, []);
};

exports.countPublishedArticles = async () => {
  const [rows] = await db.execute(`SELECT COUNT(*) as cnt FROM articles WHERE status='PUBLISHED'`);
  return rows[0] ? rows[0].cnt : 0;
};

exports.getArticleById = async id => {
  const [rows] = await db.execute(`SELECT * FROM articles WHERE id=?`, [id]);
  return rows[0] || null;
};

exports.searchPublishedArticles = async (filters, limit, offset) => {
  let sql = `SELECT * FROM articles WHERE status='PUBLISHED'`;
  const params = [];

  if (filters.title) {
    sql += ` AND title LIKE ?`;
    params.push(`%${filters.title}%`);
  }

  if (filters.publisherName) {
    sql += ` AND author_name LIKE ?`;
    params.push(`%${filters.publisherName}%`);
  }

  if (filters.startDate) {
    sql += ` AND published_at>=?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ` AND published_at<=?`;
    params.push(filters.endDate);
  }

  sql += ` ORDER BY published_at DESC LIMIT ${Math.floor(offset)}, ${Math.floor(limit)}`;

  return db.execute(sql, params);
};

exports.countPublishedArticlesWithFilters = async filters => {
  let sql = `SELECT COUNT(*) as cnt FROM articles WHERE status='PUBLISHED'`;
  const params = [];

  if (filters.title) {
    sql += ` AND title LIKE ?`;
    params.push(`%${filters.title}%`);
  }

  if (filters.publisherName) {
    sql += ` AND author_name LIKE ?`;
    params.push(`%${filters.publisherName}%`);
  }

  if (filters.startDate) {
    sql += ` AND published_at>=?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ` AND published_at<=?`;
    params.push(filters.endDate);
  }

  const [rows] = await db.execute(sql, params);
  return rows[0] ? rows[0].cnt : 0;
};

exports.getCommentsByArticle = async id => {
  const [rows] = await db.execute(
    `SELECT id, author_name, content, created_at FROM article_comments WHERE article_id=? ORDER BY created_at DESC`,
    [id]
  );
  return rows;
};

exports.getArticlesForAdmin = async (filters, limit, offset) => {
  let sql = `SELECT * FROM articles WHERE 1=1`;
  const params = [];

  if (filters.status) {
    sql += ` AND status=?`;
    params.push(filters.status);
  }

  if (filters.doctorName) {
    sql += ` AND author_name LIKE ?`;
    params.push(`%${filters.doctorName}%`);
  }

  if (filters.startDate) {
    sql += ` AND created_at>=?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ` AND created_at<=?`;
    params.push(filters.endDate);
  }

  sql += ` ORDER BY created_at DESC LIMIT ${Math.floor(offset)}, ${Math.floor(limit)}`;

  return db.execute(sql, params);
};

exports.countArticlesForAdmin = async filters => {
  let sql = `SELECT COUNT(*) as cnt FROM articles WHERE 1=1`;
  const params = [];

  if (filters.status) {
    sql += ` AND status=?`;
    params.push(filters.status);
  }

  if (filters.doctorName) {
    sql += ` AND author_name LIKE ?`;
    params.push(`%${filters.doctorName}%`);
  }

  if (filters.startDate) {
    sql += ` AND created_at>=?`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ` AND created_at<=?`;
    params.push(filters.endDate);
  }

  const [rows] = await db.execute(sql, params);
  return rows[0] ? rows[0].cnt : 0;
};

exports.getArticleReports = async articleId => {
  const [rows] = await db.execute(
    `SELECT id, article_id, reported_by, notes, status, created_at FROM article_reports WHERE article_id=? ORDER BY created_at DESC`,
    [articleId]
  );
  return rows;
};

exports.updateArticleReportStatus = async (reportId, status, adminNotes = null) => {
  return db.execute(
    `UPDATE article_reports SET status=?, admin_notes=?, reviewed_at=NOW() WHERE id=?`,
    [status, adminNotes, reportId]
  );
};

exports.updateArticleStatus = async (articleId, status, reason = null) => {
  const statusMap = {
    APPROVE: 'PUBLISHED',
    REJECT: 'REJECTED',
    DELIST: 'DELISTED'
  };

  const newStatus = statusMap[status];
  if (!newStatus) throw new Error('Invalid status action');

  const reasonColumn = status === 'REJECT' ? 'rejection_reason' : status === 'DELIST' ? 'delisted_reason' : null;

  let sql = `UPDATE articles SET status=?`;
  const params = [newStatus];

  if (reasonColumn) {
    sql += `, ${reasonColumn}=?`;
    params.push(reason);
  }

  if (status === 'APPROVE') {
    sql += `, published_at=NOW()`;
  }

  sql += ` WHERE id=?`;
  params.push(articleId);

  return db.execute(sql, params);
};
