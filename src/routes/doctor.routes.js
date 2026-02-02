const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const doctorController = require('../controllers/doctor.controller');

/**
 * CREATE ARTICLE (DRAFT)
 */
router.post(
  '/articles',
  authenticate,
  requireRole(['DOCTOR']),
  doctorController.createArticle
);

/**
 * LIST ARTICLES (PAGINATED)
 */
router.get(
  '/articles',
  authenticate,
  requireRole(['DOCTOR']),
  doctorController.getArticles
);

/**
 * SEARCH ARTICLES (FILTERS + PAGINATION)
 */
router.get(
  '/articles/search',
  authenticate,
  requireRole(['DOCTOR']),
  doctorController.searchArticles
);

/**
 * UPDATE ARTICLE (ONLY DRAFT)
 */
router.put(
  '/articles/:id',
  authenticate,
  requireRole(['DOCTOR']),
  doctorController.updateArticle
);

/**
 * SUBMIT FOR APPROVAL
 */
router.post(
  '/articles/:id/submit',
  authenticate,
  requireRole(['DOCTOR']),
  doctorController.submitForApproval
);

module.exports = router;
console.log(typeof authenticate);
console.log(typeof requireRole);
console.log(typeof requireRole(['DOCTOR']));
console.log(typeof doctorController.getArticles);
