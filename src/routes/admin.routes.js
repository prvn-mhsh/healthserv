const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const adminArticleController = require('../controllers/admin.controller');

/**
 * GET ARTICLES (FILTERED + PAGINATED)
 */
router.get(
  '/articles',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.getArticles
);

/**
 * GET ARTICLE REPORTS
 */
router.get(
  '/articles/:id/reports',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.getArticleReports
);

/**
 * PATCH ARTICLE - Consolidated endpoint for approve, reject, delist, handle reports
 */
router.patch(
  '/articles/:id',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.patchArticle
);

/**
 * LEGACY ENDPOINTS (kept for backward compatibility)
 */
router.get(
  '/articles/pending',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.getPendingArticles
);

router.post(
  '/articles/:id/approve',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.approveArticle
);

router.post(
  '/articles/:id/reject',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.rejectArticle
);

router.post(
  '/articles/:id/delist',
  authenticate,
  requireRole(['ADMIN']),
  adminArticleController.delistArticle
);

module.exports = router;
