const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { isLoggedIn } = require('../middleware/authMiddleware');

// User profile routes
router.get('/profile', isLoggedIn, usersController.profile);
router.get('/profile/edit', isLoggedIn, usersController.renderEditForm);
router.put('/profile', isLoggedIn, usersController.update);

module.exports = router;
