const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }

    res.render('users/profile', {
      title: 'My Profile',
      user,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    req.flash('error', 'Error loading profile');
    res.redirect('/');
  }
};

// Render edit profile form
exports.renderEditForm = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }

    res.render('users/edit', {
      title: 'Edit Profile',
      user,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    req.flash('error', 'Error loading edit form');
    res.redirect('/users/profile');
  }
};

// Update user profile
exports.update = async (req, res) => {
  try {
    const { user: userData } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }

    // Update username and email
    user.username = userData.username;
    user.email = userData.email;

    // Update password if provided
    if (userData.password && userData.password.trim() !== '') {
      user.password = userData.password;
    }

    await user.save();
    req.flash('success', 'Profile updated successfully');
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'Error updating profile');
    res.redirect('/users/profile/edit');
  }
};
