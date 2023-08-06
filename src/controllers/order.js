const orderModel = require('../models/order');
const CustomError = require('../utils/customError');
const Cart = require('../models/cart');
const Dish = require('../models/dish');

const getAllOrdersForCustomer = async (req, res, next) => {
  try {
    const orders = await orderModel.find({ customerId: req.user.id });
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
    const orders = await orderModel.find({ chefId: req.user.id });
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
      const dish = await Dish.findOne({ id: dishId });

      const { chefId, price } = dish;

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
    orders = await orderModel.insertMany(orders);
    // Return a success response with the orders
    return res.status(201).json({ message: 'Orders created', orders });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const updateOrder = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await orderModel.findOneAndUpdate(
      { _id: id },
      { status },
      { returnOriginal: false }
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
    const order = await orderModel.findByIdAndDelete(id);
    if (!order) {
      return next(new CustomError("You don't have orders", 404));
    }
    return res.sendStatus(204).json({ message: 'Order deleted successfully' });
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
