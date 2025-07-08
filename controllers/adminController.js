const User = require('../models/User');
const SparePart = require('../models/SparePart');

// Admin dashboard
exports.dashboard = async (req, res) => {
  try {
    const [totalUsers, totalParts, users, parts] = await Promise.all([
      User.countDocuments(),
      SparePart.countDocuments(),
      User.find({}).sort({ createdAt: -1 }).limit(10),
      SparePart.find({}).populate('owner carType carModel').sort({ createdAt: -1 }).limit(10)
    ]);

    const stats = {
      totalUsers,
      totalParts
    };

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats,
      users,
      parts,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
};

// Manage parts
exports.manageParts = async (req, res) => {
  try {
    const parts = await SparePart.find({})
      .populate('owner carType carModel')
      .sort({ createdAt: -1 });

    res.render('admin/manageParts', {
      title: 'Manage Parts',
      parts,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading manage parts:', error);
    req.flash('error', 'Error loading parts');
    res.redirect('/admin/dashboard');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/dashboard');
    }

    if (user.role === 'admin') {
      req.flash('error', 'Cannot delete admin users');
      return res.redirect('/admin/dashboard');
    }

    // Delete user's spare parts
    await SparePart.deleteMany({ owner: userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.flash('error', 'Error deleting user');
    res.redirect('/admin/dashboard');
  }
};
