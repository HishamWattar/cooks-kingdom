const Order = require('../models/order');
const CustomError = require('../utils/customError');
const Cart = require('../models/cart');
const Dish = require('../models/dish');

const getAllOrdersForCustomer = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user.id });
    if (!orders) {
      return next(new CustomError("You don't have orders", 404));
    }
    return res.json({ data: orders });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const getAllOrdersForChef = async (req, res, next) => {
  try {
    const orders = await Order.find({ chefId: req.user.id });
    if (!orders) {
      return next(new CustomError("You don't have orders", 404));
    }
    return res.json({ data: orders });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const createOrder = async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const cart = await Cart.findOne({ customerId });

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return next(new CustomError('Cart is empty', 400));
    }

    const { cartItems } = cart;

    let orders = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const item of cartItems) {
      const { dishId, quantity } = item;

      // eslint-disable-next-line no-await-in-loop
      const dish = await Dish.findById(dishId);

      const { chefId, price } = dish;

      // eslint-disable-next-line no-await-in-loop
      let order = orders.find((o) => o.chefId.equals(chefId));

      // If there is no existing order, create a new one and push it to the orders array
      if (!order) {
        order = {
          customerId,
          chefId,
          totalPrice: 0,
          status: 'pending',
          orderItems: [],
          quantity: 0,
        };
        orders.push(order);
      }

      // Add the item to the order items array
      order.orderItems.push({
        price,
        dishId,
        quantity,
      });

      // Update the total price and quantity of the order
      order.totalPrice += price * quantity;
      order.quantity += quantity;
    }

    // Save all the orders to the database
    orders = await Order.insertMany(orders);

    // Delete user cart when order is created
    await Cart.deleteOne({ customerId });

    // Return a success response with the orders
    return res.status(201).json({ data: orders });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};
const updateOrder = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        chefId: req.user.id,
        status: { $in: ['pending', 'in_progress'] },
      },
      { status },
      { returnOriginal: false, strict: true }
    );
    if (!order) {
      return next(new CustomError('Order not Found', 404));
    }
    return res.json({ data: order });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const deleteOrder = async (req, res, next) => {
  const { id } = req.params;
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        customerId: req.user.id,
        status: { $in: ['pending', 'in_progress'] },
      },
      {
        status: 'canceled',
      }
    );

    if (!order) {
      return next(new CustomError("You don't have orders", 404));
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

module.exports = {
  getAllOrdersForCustomer,
  getAllOrdersForChef,
  createOrder,
  updateOrder,
  deleteOrder,
};
