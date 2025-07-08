const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isLoggedIn, isLoggedOut } = require('../middleware/authMiddleware');

// Registration routes
router.get('/register', isLoggedOut, authController.renderRegisterForm);
router.post('/register', isLoggedOut, authController.register);

// Login routes
router.get('/login', isLoggedOut, authController.renderLoginForm);
router.post('/login', isLoggedOut, authController.login);

// Logout route
router.post('/logout', isLoggedIn, authController.logout);

// Password reset routes
router.get('/reset-password', authController.renderResetForm);
router.post('/reset-password', authController.sendResetLink);
router.get('/reset-password/:token', authController.renderNewPasswordForm);
router.post('/reset-password/new', authController.resetPassword);

module.exports = router;
