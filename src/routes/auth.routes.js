const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const {
  registerValidation,
  loginValidation
} = require('../validations/auth.validation');

// REGISTER
router.post('/register', registerValidation, validate, authController.register);

// LOGIN
router.post('/login', loginValidation, validate, authController.login);

module.exports = router;