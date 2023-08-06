const Cart = require('../models/cart');
const Dish = require('../models/dish');
const CustomError = require('../utils/customError');

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user.id });

    if (!cart) {
      return next(new CustomError("You don't have a cart.", 404));
    }

    return res.json(cart);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndDelete({ customerId: req.user.id });

    if (!cart) {
      return next(new CustomError("You don't have a cart.", 404));
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

const postCartItemById = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user.id });

    if (!cart) {
      cart = await Cart.create({ customerId: req.user.id });
    }

    let cartItem = await Cart.findOne({
      customerId: req.user.id,
      'cartItems.dishId': req.body.dishId,
    });

    if (cartItem) {
      return next(new CustomError('Item already in cart.', 409));
    }

    const dish = await Dish.findOne({ _id: req.body.dishId });
    if (!dish) {
      return next(new CustomError('Dish not found.', 404));
    }

    cartItem = {
      dishId: req.body.dishId,
      quantity: req.body.quantity,
    };

    cart.cartItems.push(cartItem);
    await cart.save();

    return res.status(201).json(cart);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const putCartItemById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
      {
        customerId: req.user.id,
        'cartItems._id': id,
      },
      {
        $set: {
          'cartItems.$.quantity': quantity,
        },
      },
      { new: true }
    );

    if (!cart) {
      return next(new CustomError('Item not found.', 404));
    }

    return res.json(cart);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

const getCartItemById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const cart = await Cart.findOne(
      {
        customerId: req.user.id,
        'cartItems._id': id,
      },
      { 'cartItems.$': 1 }
    );

    // return first cartItem that matches the condition
    if (!cart) {
      return next(new CustomError('Item not found.', 404));
    }

    return res.json(cart.cartItems[0]);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

const deleteCartItemById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const cart = await Cart.findOneAndUpdate(
      {
        customerId: req.user.id,
        'cartItems._id': id,
      },
      { $pull: { cartItems: { _id: id } } }
    );

    if (!cart) {
      return next(new CustomError('Item not found.', 404));
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(new CustomError(err.message));
  }
};

module.exports = {
  getCart,
  deleteCart,
  postCartItemById,
  putCartItemById,
  getCartItemById,
  deleteCartItemById,
};
