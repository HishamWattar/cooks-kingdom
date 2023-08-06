const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartItemSchema = new Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    // required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  cartItems: [cartItemSchema],
});

cartSchema.set('toJSON', {
  transform(doc, ret) {
    // eslint-disable-next-line no-param-reassign
    delete ret.__v;
  },
});
// Cart model
module.exports = mongoose.model('Cart', cartSchema);
