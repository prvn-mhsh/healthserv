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
