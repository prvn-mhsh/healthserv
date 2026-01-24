const router = require('express').Router();
const patientController = require('../controllers/patient.controller');

const { authenticate, requireRole } = require('../middleware/auth');

router.get(
  '/articles',
  authenticate,
  requireRole(['USER']),
  patientController.getPublishedArticles
);

router.post(
  '/articles/:id/report',
  authenticate,
  requireRole(['USER']),
  patientController.reportArticle
);

module.exports = router;
