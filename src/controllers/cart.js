const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');

function getUserID(req) {
  let bearerToken = req.header('Authorization');
  bearerToken = bearerToken.split(' ');
  const token = bearerToken[1];
  const decoded = jwt.verify(token, process.env.APP_SECRET);
  return decoded.userId;
}

exports.postCart = async (req, res) => {
  try {
    const userId = getUserID(req);
    const cart = new Cart({ customerId: userId });
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create cart',
      error: req.header('Authorization'),
    });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const userId = getUserID(req);
    Cart.deleteOne({ customerId: userId });
    res.status(204).json({
      message: 'the cart was deleted',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete cart', error: err });
  }
};

exports.postCartItemByDishId = async (req, res) => {
  try {
    const userId = getUserID(req);
    const cart = Cart.findOne({ customerId: userId });
    const cartItem = {
      dishId: req.params.id,
      quantity: 1,
    };
    cart.cartItems.push(cartItem);
    cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add item to cart', error: err });
  }
};

exports.putCartItemByDishId = async (req, res) => {
  try {
    const userId = getUserID(req);
    const cart = Cart.findOne({ customerId: userId });
    const cartItem = cart.cartItems.find(
      (item) => item.dishId === req.params.id
    );
    if (cartItem) {
      cartItem.quantity += 1;
      cart.save();
    } else {
      res.status(404).json({ message: 'item not found' });
    }
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item', error: err });
  }
};

exports.getCartItemByDishId = async (req, res) => {
  try {
    const userId = getUserID(req);
    const cart = Cart.findOne({ customerId: userId });
    const cartItem = cart.cartItems.find(
      (item) => item.dishId === req.params.id
    );
    if (cartItem) {
      res.status(201).json(cartItem);
    } else {
      res.status(404).json({ message: 'item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get item', error: err });
  }
};

exports.deleteCartItemByDishId = async (req, res) => {
  try {
    const userId = getUserID(req);
    const cart = Cart.findOne({ customerId: userId });
    const cartItemIndex = cart.cartItems.findIndex(
      (item) => item.dishId === req.params.id
    );

    if (cartItemIndex !== -1) {
      cart.cartItems.splice(cartItemIndex, 1);
      cart.save();
    } else {
      res.status(404).json({ message: 'item not found' });
    }
    res.status(204).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item', error: err });
  }
};
