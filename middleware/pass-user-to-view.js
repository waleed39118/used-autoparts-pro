const User = require('../models/User');

module.exports = async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.messages = req.flash();

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      res.locals.currentUser = user;
    } catch (error) {
      console.error('Error fetching user for views:', error);
      req.session.destroy();
    }
  }

  next();
};
