const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// USERS
router.get('/users', auth, admin, adminController.getUsers);

// DELETE USER
router.delete('/users/:id', auth, admin, adminController.deleteUser);

// STATS
router.get('/stats', auth, admin, adminController.systemStats);

module.exports = router;