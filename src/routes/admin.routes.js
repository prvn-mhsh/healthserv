const router = require('express').Router();
const db = require('../db/mysql');
const { authenticate, requireRole } = require('../middleware/auth');

router.get(
  '/articles/pending',
  authenticate,
  requireRole(['ADMIN']),
  async (_, res) => {
    const [rows] = await db.execute(
      `SELECT * FROM articles WHERE status='PENDING_APPROVAL'`
    );
    res.json(rows);
  }
);

router.post(
  '/articles/:id/approve',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res) => {
    await db.execute(
      `UPDATE articles
       SET status='PUBLISHED', published_at=NOW()
       WHERE id=? AND status='PENDING_APPROVAL'`,
      [req.params.id]
    );
    res.json({ message: 'Article approved' });
  }
);

router.post(
  '/articles/:id/reject',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res) => {
    await db.execute(
      `UPDATE articles
       SET status='REJECTED', rejection_reason=?
       WHERE id=?`,
      [req.body.reason, req.params.id]
    );
    res.json({ message: 'Article rejected' });
  }
);

router.post(
  '/articles/:id/delist',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res) => {
    await db.execute(
      `UPDATE articles
       SET status='DELISTED', delisted_reason=?
       WHERE id=?`,
      [req.body.reason, req.params.id]
    );
    res.json({ message: 'Article delisted' });
  }
);

module.exports = router;
