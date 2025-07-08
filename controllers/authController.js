const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Render register form
exports.renderRegisterForm = (req, res) => {
  res.render('auth/register', { 
    title: 'Register',
    messages: req.flash()
  });
};

// Handle registration
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      req.flash('error', 'User with this email or username already exists');
      return res.redirect('/auth/register');
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    req.session.userId = user._id;
    req.flash('success', 'Registration successful! Welcome to Spare Parts App.');
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
};

// Render login form
exports.renderLoginForm = (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    messages: req.flash()
  });
};

// Handle login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Set session
    req.session.userId = user._id;
    req.flash('success', 'Welcome back!');
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/auth/login');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login');
  });
};

// Render reset password form
exports.renderResetForm = (req, res) => {
  res.render('auth/reset-password/form', { 
    title: 'Reset Password',
    messages: req.flash()
  });
};

// Send reset password link
exports.sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'No account found with that email address');
      return res.redirect('/auth/reset-password');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset - Spare Parts App',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Spare Parts App account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.render('auth/reset-password/sent', { 
      title: 'Reset Link Sent',
      messages: req.flash()
    });
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'Error sending reset email. Please try again.');
    res.redirect('/auth/reset-password');
  }
};

// Render new password form
exports.renderNewPasswordForm = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/auth/reset-password');
    }

    res.render('auth/reset-password/new', { 
      title: 'Set New Password',
      token,
      userId: user._id,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Reset password form error:', error);
    req.flash('error', 'Error loading reset form');
    res.redirect('/auth/reset-password');
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, token, password } = req.body;

    const user = await User.findOne({
      _id: userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/auth/reset-password');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('success', 'Password has been reset successfully. You can now log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'Error resetting password. Please try again.');
    res.redirect('/auth/reset-password');
  }
};
