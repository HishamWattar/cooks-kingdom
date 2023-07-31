const mongoose = require('mongoose');

const { Schema } = mongoose;

// Order Items Schema
const orderItemsSchema = new Schema({
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

// Order schema
const orderSchema = new Schema(
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
    },
    status: {
      type: String,
      enum: ['pending', 'canceled', 'in_progress', 'delivered'],
      required: [true, 'Status is required'],
    },
    orderItems: [orderItemsSchema],
    quantity: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
orderSchema.pre('save', function (next) {
  const order = this;

  // Calculate the total price from the order items
  const totalPrice = order.orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Update the totalPrice field in the order
  order.totalPrice = totalPrice;

  return next();
});

// Order model
module.exports = mongoose.model('Order', orderSchema);
