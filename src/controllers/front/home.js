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
    const { cartItems } = cart;
    return res.render('cart', { cartItems, user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const profile = async (req, res) => {
  const { token } = req.cookies;
  const decoded = jwt.verify(token, process.env.APP_SECRET);
  const user = await User.findById({ _id: decoded.userId });
  return res.render('profile', { user });
};

const login = async (req, res) => {
  res.render('login');
};

const signup = async (req, res) => {
  res.render('signup');
};

const putCartItemByDishId = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    const user = await User.findById({ _id: decoded.userId });
    const cart = await Cart.findOne({
      customerId: user.id,
      'cartItems.dishId': req.params.id,
    });

    if (cart.cartItems[0]) {
      cart.cartItems[0].quantity = req.body.quantity;
      cart.save();
    } else {
      return next(new CustomError('item not found', 404));
    }
    return res.status(201).json(cart);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

module.exports = {
  getAllDishes,
  login,
  signup,
  getCart,
  profile,
  putCartItemByDishId,
};
