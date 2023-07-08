const mongoose = require('mongoose');
// Define Order Items Schema
const orderItemsSchema = new mongoose.Schema({
  Price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  Created_At: {
    type: Date,
    default: Date.now,
  },
  Updated_At: {
    type: Date,
    default: Date.now,
  },
  DishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
  },
  Quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
});

// Define Order schema
const orderSchema = new mongoose.Schema({
  CustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  CookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
  },
  Total_Price: {
    type: Number,
    required: [true, 'Total Price is required'],
  },
  Status: {
    type: String,
    enum: ['pending', 'canceled', 'in_progress', 'delivered'],
    required: [true, 'Status is required'],
  },
  OrderItems: [orderItemsSchema],
  Quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
});
// The pre method is a function provided by Mongoose to define middleware functions that are executed before  saving a document (save).
orderItemsSchema.pre('save', function (next) {
  const currentDate = new Date();
  this.updated_at = currentDate;

  // Set created_at only if it's not already defined
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  next();
});

module.exports = mongoose.model('orderSchema', orderSchema);
