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

orderSchema.set('toJSON', {
  transform(doc, ret) {
    // eslint-disable-next-line no-param-reassign
    delete ret.__v;
  },
});

// Order model
module.exports = mongoose.model('Order', orderSchema);
