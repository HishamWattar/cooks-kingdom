const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const Dish = require('../models/dish');
const Cart = require('../models/cart');
const Order = require('../models/order');
const CustomError = require('../utils/customError');

// eslint-disable-next-line consistent-return
const isAuthenticated = async (req, res, next) => {
  if (req.cookies) {
    const { token } = req.cookies;
    if (!token) {
      return next(new CustomError('Unauthenticated', 401));
    }
    try {
      const decoded = jwt.verify(token, process.env.APP_SECRET);
      req.user = await User.findById({ _id: decoded.userId });
      return next();
    } catch (error) {
      return next(new CustomError('Invalid token', 401));
    }
  }
};

const isChef = (req, res, next) => {
  if (
    (req.user.role === 'chef' && req.user.isApproved) ||
    req.user.role === 'admin'
  ) {
    return next();
  }
  return next(new CustomError('This action is unauthorized', 403));
};

const isCustomer = (req, res, next) => {
  if (req.user.role === 'customer' || req.user.role === 'admin') {
    return next();
  }
  return next(new CustomError('This action is unauthorized', 403));
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  return next(new CustomError('This action is unauthorized', 403));
};

function isOwner(path) {
  return async (req, res, next) => {
    const userId = req.user._id.toString();
    const { id } = req.params;
    try {
      let owner = false;
      if (path === 'dishes') {
        const dish = await Dish.findById(id);
        if (!dish) {
          return next(new CustomError("Item wasn't found", 404));
        }
        owner = dish && dish.chefId.toString() === userId;
      } else if (path === 'cart') {
        const cart = await Cart.findById(id);
        owner = cart && cart.customerId.toString() === userId;
      } else if (path === 'orders') {
        const order = await Order.findById(id);
        owner = order && order.customerId.toString() === userId;
      } else {
        // If the provided 'path' is invalid, you can handle it here
        return next(new CustomError('Invalid path', 400));
      }
      if (!owner) {
        return next(
          new CustomError(
            'Unauthorized: You are not the owner of this resource',
            403
          )
        );
      }
    } catch (err) {
      // Handle any potential errors
      return next(new CustomError(err.message, 500));
    }
    // If the user is the owner, continue to the next middleware or route handler
    return next();
  };
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isCustomer,
  isChef,
  isOwner,
};
