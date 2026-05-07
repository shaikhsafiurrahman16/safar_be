const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const auth = require('../middleware/auth.middleware');

router.get('/fuel', auth, reportController.getFuelReport);

module.exports = router;