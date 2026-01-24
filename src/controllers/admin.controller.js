const db = require('../db/mysql');

/**
 * GET PENDING ARTICLES
 */
exports.getPendingArticles = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM articles WHERE status='PENDING_APPROVAL'`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pending articles' });
  }
};

/**
 * APPROVE ARTICLE
 */
exports.approveArticle = async (req, res) => {
  try {
    await db.execute(
      `UPDATE articles
       SET status='PUBLISHED', published_at=NOW()
       WHERE id=? AND status='PENDING_APPROVAL'`,
      [req.params.id]
    );
    res.json({ message: 'Article approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to approve article' });
  }
};

/**
 * REJECT ARTICLE
 */
exports.rejectArticle = async (req, res) => {
  try {
    await db.execute(
      `UPDATE articles
       SET status='REJECTED', rejection_reason=?
       WHERE id=?`,
      [req.body.reason, req.params.id]
    );
    res.json({ message: 'Article rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reject article' });
  }
};

/**
 * DELIST ARTICLE
 */
exports.delistArticle = async (req, res) => {
  try {
    await db.execute(
      `UPDATE articles
       SET status='DELISTED', delisted_reason=?
       WHERE id=?`,
      [req.body.reason, req.params.id]
    );
    res.json({ message: 'Article delisted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delist article' });
  }
};
