const router = require('express').Router();
const patientController = require('../controllers/patient.controller');

const { authenticate, requireRole } = require('../middleware/auth');

router.get(
  '/articles',
  authenticate,
  requireRole(['USER']),
  patientController.getPublishedArticles
);

router.get(
  '/articles/search',
  authenticate,
  requireRole(['USER']),
  patientController.searchPublishedArticles
);

router.get(
  '/articles/:id',
  authenticate,
  requireRole(['USER']),
  patientController.getArticleDetails
);

router.post(
  '/articles/:id/report',
  authenticate,
  requireRole(['USER']),
  patientController.reportArticle
);

module.exports = router;
