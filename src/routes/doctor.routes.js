const router = require('express').Router();
const repo = require('../repositories/article.repo');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * CREATE ARTICLE (DRAFT)
 */
router.post(
  '/articles',
  authenticate,
  requireRole(['DOCTOR']),
  async (req, res) => {
    try {
      const id = await repo.createArticle({
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        tags: req.body.tags,

        authorId: req.user.userId,   // ✅ from token.id
        authorName: null             // ✅ token does NOT provide name
      });

      res.status(201).json({ articleId: id });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create article' });
    }
  }
);

/**
 * UPDATE ARTICLE (ONLY DRAFT)
 */
router.put(
  '/articles/:id',
  authenticate,
  requireRole(['DOCTOR']),
  async (req, res) => {
    const affected = await repo.updateArticle(
      req.params.id,
      req.user.userId,
      req.body
    );

    if (!affected) {
      return res.status(403).json({
        message: 'Cannot update article (not owner or not draft)'
      });
    }

    res.json({ message: 'Draft updated' });
  }
);

/**
 * SUBMIT FOR APPROVAL
 */
router.post(
  '/articles/:id/submit',
  authenticate,
  requireRole(['DOCTOR']),
  async (req, res) => {
    const affected = await repo.submitForApproval(
      req.params.id,
      req.user.userId
    );

    if (!affected) {
      return res.status(403).json({
        message: 'Cannot submit article (not owner or wrong status)'
      });
    }

    res.json({ message: 'Submitted for approval' });
  }
);

module.exports = router;
