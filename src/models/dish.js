const mongoose = require('mongoose');

const { Schema } = mongoose;

// Review schema
const reviewSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  rate: {
    type: Number,
    maximum: 5,
    require: true,
  },
  description: {
    type: String,
  },
});

// Dish schema
const dishSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
  },
  description: String,
  image: String,
  ingredients: [String],
  price: {
    type: Number,
    required: true,
  },
  reviews: [reviewSchema],
});

// Hide "__v" field from query results
dishSchema.set('toJSON', {
  transform(doc, ret) {
    // eslint-disable-next-line no-param-reassign
    delete ret.__v;
  },
});

// Dish model
module.exports = mongoose.model('Dish', dishSchema);
