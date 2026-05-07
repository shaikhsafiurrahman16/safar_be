const express = require('express');
const router = express.Router();

const fuelController = require('../controllers/fuel.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, fuelController.addFuel);
router.get('/', auth, fuelController.getFuelLogs);

module.exports = router;