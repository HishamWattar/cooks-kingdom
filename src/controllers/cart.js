const Cart = require('../models/cart');

exports.postCart = async (req, res) => {
  try {
    let cart = Cart.findOne({ customerId: req.user.id });
    if (cart) res.status(300).json({ message: 'user already has a cart' });
    cart = new Cart({ customerId: req.user.id });
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create cart',
      error: err,
    });
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

exports.postCartItemByDishId = async (req, res) => {
  try {
    const cart = Cart.findOne({ customerId: req.user.id });
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
    const cart = Cart.findOne({ customerId: req.user.id });
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
    const cart = Cart.findOne({ customerId: req.user.id });
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
    const cart = Cart.findOne({ customerId: req.user.id });
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
