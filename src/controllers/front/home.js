const jwt = require('jsonwebtoken');
const Cart = require('../../models/cart');
const dishModel = require('../../models/dish');
const { User } = require('../../models/user');
const CustomError = require('../../utils/customError');

const getAllDishes = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const dishes = await dishModel.find();
    let user = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.APP_SECRET);
      user = await User.findById({ _id: decoded.userId });
    }
    return res.render('index', { dishes, user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const getCart = async (req, res, next) => {
  try {
    let cartItems = null;
    const { user } = req;
    const [cart] = await Cart.find({ customerId: user.id })
      .populate('cartItems.dishId')
      .exec();

    if (cart) {
      cartItems = cart.cartItems;
    }
    return res.render('cart', { cartItems, user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const profile = async (req, res) => {
  const { user } = req;
  return res.render('profile', { user });
};

const login = async (req, res) => {
  res.render('login');
};

const signup = async (req, res) => {
  res.render('signup');
};

const role = async (req, res) => {
  res.render('role');
};

const putCartItemByDishId = async (req, res, next) => {
  try {
    const { user } = req;
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

const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, 'addresses');

    if (!user) {
      return next(new CustomError('User not found', 404));
    }
    const { addresses } = user;
    return res.render('addresses', { addresses, user });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving user addresses' });
  }
  // const user = await User.findById(req.user.id, 'addresses');
};

const editAddress = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const address = user.addresses.find((addr) => addr._id.toString() === id);

    if (!address) {
      return next(new CustomError('Address is not found', 404));
    }

    return res.render('address', { address, user });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

module.exports = {
  getAllDishes,
  login,
  signup,
  getCart,
  profile,
  role,
  putCartItemByDishId,
  getAddresses,
  editAddress,
};
