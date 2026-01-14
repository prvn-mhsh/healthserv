const express = require('express');
const { getBMIByUser } = require('../controllers/bmi.controller');

const router = express.Router();

router.get('/bmi/:userId', getBMIByUser);

module.exports = router;  // ✅ must export the router
