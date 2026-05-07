const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, vehicleController.addVehicle);
router.get('/', auth, vehicleController.getVehicles);

module.exports = router;