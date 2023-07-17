const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

// eslint-disable-next-line consistent-return
const isAuthenticated = async (req, res, next) => {
  if (req.cookies) {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    try {
      const decoded = jwt.verify(token, process.env.APP_SECRET);
      req.user = await User.findById({ _id: decoded.userId });
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
};

const isChef = (req, res, next) => {
  if (req.user.role === 'chef') {
    return next();
  }
  return res.status(403).json({ message: 'This action is unauthorized' });
};

const isCustomer = (req, res, next) => {
  if (req.user.role === 'customer') {
    return next();
  }
  return res.status(403).json({ message: 'This action is unauthorized' });
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'This action is unauthorized' });
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isCustomer,
  isChef,
};
