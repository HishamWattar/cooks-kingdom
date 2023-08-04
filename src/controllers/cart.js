const Cart = require('../models/cart');
const dishModel = require('../models/dish');
const CustomError = require('../utils/customError');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user.id });
    if (!cart) return next(new CustomError('cart not found', 404));
    return res.status(200).json(cart);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

exports.postCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user.id });
    if (cart) return next(new CustomError('cart already exist', 300));
    cart = new Cart({ customerId: req.user.id });
    await cart.save();
    return res.status(201).json(cart);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

exports.deleteCart = async (req, res, next) => {
  try {
    Cart.deleteOne({ customerId: req.user.id });
    return res.status(204).json({
      message: 'the cart was deleted',
    });
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

exports.postCartItemByDishId = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user.id });
    if (!cart) return next(new CustomError('cart not found', 404));

    let cartItem = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.body.id,
    });
    if (cartItem) return next(new CustomError('item already in cart', 300));

    const dish = await dishModel.findById(req.body.id);
    // if (!dish) return next(new CustomError('error dish is not found', 404));
    cartItem = {
      dishId: req.body.id,
      quantity: req.body.quantity,
    };
    cart.cartItems.push(cartItem);
    cart.save();
    return res.status(201).json(cart);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

exports.putCartItemByDishId = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      customerId: req.user.id,
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

exports.getCartItemByDishId = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.params.id,
    });
    if (cart.cartItems[0]) {
      return res.status(200).json(cart.cartItems[0]);
    }
    return res.status(404).json({ message: 'item not found' });
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

exports.deleteCartItemByDishId = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.params.id,
    });
    if (cart) {
      cart.cartItems.splice(0, 1);
      cart.save();
      return res.status(204).json(cart);
    }
    return res.status(404).json({ message: 'item not found' });
  } catch (err) {
    return next(new CustomError(err.message));
  }
};
