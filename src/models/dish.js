const mongoose = require('mongoose');
const reviewSchema = require('./reviewSchema');

// Define the Dish schema
const dishSchema = new mongoose.Schema({
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

// Create the Dish model
const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
