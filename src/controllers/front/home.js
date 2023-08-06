const jwt = require('jsonwebtoken');
const Cart = require('../../models/cart');
const dishModel = require('../../models/dish');
const { User } = require('../../models/user');
const CustomError = require('../../utils/customError');

const getAllDishes = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const dishes = await dishModel.find();

    const decoded = jwt.verify(token, process.env.APP_SECRET);
    const user = await User.findById({ _id: decoded.userId });
    return res.render('index', { dishes, user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const getCart = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    const user = await User.findById({ _id: decoded.userId });

    const [cart] = await Cart.find({ customerId: user.id })
      .populate('cartItems.dishId')
      .exec();
    const { cartItems } = cart.cartItems;
    return res.render('cart', { cartItems, user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const login = async (req, res) => {
  res.render('login');
};

const signup = async (req, res) => {
  res.render('signup');
};

module.exports = {
  getAllDishes,
  login,
  signup,
  getCart,
};
