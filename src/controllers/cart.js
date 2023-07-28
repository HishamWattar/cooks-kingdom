const Cart = require('../models/cart');
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
    return next(new CustomError(err.message, 500));
  }
};

exports.deleteCart = async (req, res) => {
  try {
    Cart.deleteOne({ customerId: req.user.id });
    res.status(204).json({
      message: 'the cart was deleted',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete cart', error: err });
  }
};

exports.postCartItemByDishId = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user.id });
    if (!cart) return next(new CustomError('cart not found', 404));

    let cartItem = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.params.id,
    });
    if (cartItem) return next(new CustomError('item already in cart', 300));

    cartItem = { dishId: req.params.id, quantity: 1 };
    cart.cartItems.push(cartItem);
    cart.save();
    return res.status(201).json(cart);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Failed to add item to cart', error: err });
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
    return next(new CustomError(err.message, 500));
  }
};

exports.getCartItemByDishId = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.params.id,
    });
    if (cart.cartItems[0]) {
      res.status(200).json(cart.cartItems[0]);
    } else {
      res.status(404).json({ message: 'item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get item', error: err });
  }
};

exports.deleteCartItemByDishId = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.params.id,
    });

    if (cart.cartItems[0]) {
      cart.cartItems.splice(0, 1);
      cart.save();
    } else {
      res.status(404).json({ message: 'item not found' });
    }
    res.status(204).json({ message: 'the item was deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err });
  }
};
