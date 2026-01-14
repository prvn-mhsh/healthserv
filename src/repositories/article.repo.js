const db = require('../db/mysql');

exports.createArticle = async data => {
  try {
    const [res] = await db.execute(
      `INSERT INTO articles
       (title, summary, content, tags, author_id, author_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.summary,
        data.content,
        JSON.stringify(data.tags || []),
        data.authorId,
        data.authorName
      ]
    );
    return res.insertId;
  } catch (err) {
    console.error('DB ERROR createArticle:', err);
    throw err; // Let route catch
  }
};


exports.updateArticle = (id, authorId, data) =>
  db.execute(
    `UPDATE articles
     SET title=?, summary=?, content=?, tags=?
     WHERE id=? AND author_id=? AND status='DRAFT'`,
    [data.title, data.summary, data.content, JSON.stringify(data.tags), id, authorId]
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
