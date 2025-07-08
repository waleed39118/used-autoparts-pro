const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

// Admin dashboard
router.get('/dashboard', isAdmin, adminController.dashboard);

// Manage parts
router.get('/parts', isAdmin, adminController.manageParts);

// Delete user
router.delete('/users/:id', isAdmin, adminController.deleteUser);

module.exports = router;
