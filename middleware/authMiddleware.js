const User = require('../models/User');

// Check if user is logged in
exports.isLoggedIn = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/auth/login');
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.flash('error', 'Authentication error');
    res.redirect('/auth/login');
  }
};

// Check if user is logged out
exports.isLoggedOut = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
};

// Check if user is admin
exports.isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      req.flash('error', 'Access denied. Admin privileges required.');
      return res.redirect('/');
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    req.flash('error', 'Authentication error');
    res.redirect('/auth/login');
  }
};
