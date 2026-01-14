const router = require('express').Router();
const repo = require('../repositories/article.repo');

router.get('/articles', async (req, res) => {
  const [rows] = await repo.getPublishedArticles(req.query);
  res.json(rows);
});

router.post(
  '/articles/:id/report',
  async (req, res) => {
    await require('../db').execute(
      `INSERT INTO article_reports (article_id, reported_by, notes)
       VALUES (?, ?, ?)`,
      [req.params.id, req.body.userId, req.body.notes]
    );
    res.status(201).json({ message: 'Reported' });
  }
);

module.exports = router;
