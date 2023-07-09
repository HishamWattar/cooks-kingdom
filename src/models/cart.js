const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});
const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cartItems: [cartItemSchema],
});

module.exports = mongoose.model('Cart', cartSchema);
