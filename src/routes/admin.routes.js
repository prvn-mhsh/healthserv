const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const adminArticleController = require('../controllers/admin.controller');

/**
 * VIEW PENDING ARTICLES
 */
router.get(
  '/articles/pending',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.getPendingArticles
);

/**
 * APPROVE ARTICLE
 */
router.post(
  '/articles/:id/approve',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.approveArticle
);

/**
 * REJECT ARTICLE
 */
router.post(
  '/articles/:id/reject',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.rejectArticle
);

/**
 * DELIST ARTICLE
 */
router.post(
  '/articles/:id/delist',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.delistArticle
);

module.exports = router;
