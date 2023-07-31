const mongoose = require('mongoose');
// const { Customer } = require('../models/user');
const Dish = require('../models/dish');
const Order = require('../models/order');

const {
  Types: { ObjectId },
} = mongoose;
// customer controller
const getAllOrders = async (req, res) => {
  const { customerId } = req.params;
  try {
    const allCustomerOrder = await Order.find({ customer: customerId });
    // Check if any orders were found
    if (allCustomerOrder === undefined) {
      return res
        .status(404)
        .json({ message: 'No orders found for this customerId' });
    }
    return res.status(200).json(allCustomerOrder);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};
const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const validateObjectId = (id) =>
      ObjectId.isValid(id) && new ObjectId(id).toString() === id;
    if (!validateObjectId(orderId)) {
      return res.status(403).json({ message: 'Order not found' });
    }
    const orderById = await Order.findById(orderId);
    if (!orderById) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json({ data: orderById });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};
const createOrder = async (req, res) => {
  const { customerId, dishId, quantity, orderQuantity } = req.body;

  try {
    // const customer = await Customer.findById(customerId);
    const dish = await Dish.findById(dishId);

    if (!dish) {
      return res.status(404).json({ message: 'Customer or Dish not found' });
    }
    const { chefId, price } = dish;
    const totalPrice = price * quantity;
    const status = 'pending';
    // Create the new order item for the dish
    const newOrderItem = {
      dishId,
      quantity,
      price: totalPrice,
    };
    const orderData = {
      customerId,
      chefId,
      totalPrice,
      status,
      orderItems: [newOrderItem],
      quantity: orderQuantity,
    };

    const newOrder = await Order.create(orderData);
    return res.status(201).json({ data: newOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    return res.status(204).json(order);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};
const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { dishId, quantity, customerId } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const dish = await Dish.findById(dishId);

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    // Calculate the total price for this particular dish in the order
    const { chefId, price } = dish;
    const totalPrice = price * quantity;
    const status = 'pending';
    // Create the new order item for the dish
    const newOrderItem = {
      dishId,
      quantity,
      price: totalPrice,
    };
    const orderData = {
      customerId,
      chefId,
      status,
      orderItems: [newOrderItem],
      quantity: 1,
    };

    const newOrder = await Order.create(orderData);

    return res.status(201).json({ data: newOrder });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// chef controller

const orderUpdate = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const validateObjectId = (id) =>
      ObjectId.isValid(id) && new ObjectId(id).toString() === id;
    if (!validateObjectId(orderId)) {
      return res.status(403).json({ message: 'Order not found' });
    }
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status },
      { returnOriginal: false }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  addOrderItem,
  deleteOrder,
  orderUpdate,
};
