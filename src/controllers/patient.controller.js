const repo = require('../repositories/article.repo');
const db = require('../db/mysql');

/**
 * GET PUBLISHED ARTICLES
 * Optional query param: ?tag=...
 */
exports.getPublishedArticles = async (req, res) => {
  try {
    const [rows] = await repo.getPublishedArticles(req.query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch published articles' });
  }
};

/**
 * REPORT ARTICLE ABUSE
 */
exports.reportArticle = async (req, res) => {
  try {
    await db.execute(
      `INSERT INTO article_reports (article_id, reported_by, notes)
       VALUES (?, ?, ?)`,
      [req.params.id, req.body.userId, req.body.notes]
    );

    res.status(201).json({ message: 'Reported' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to report article' });
  }
};
