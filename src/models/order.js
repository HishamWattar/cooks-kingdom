/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
// Define Order Items Schema
const orderItemsSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },

  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
});

// Define Order schema
const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chef',
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total Price is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'canceled', 'in_progress', 'delivered'],
      required: [true, 'Status is required'],
    },
    orderItems: [orderItemsSchema],
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
