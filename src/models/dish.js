const mongoose = require('mongoose');

// Define the Dish schema
const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cookerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooker',
  },
  description: String,
  image: String,
  ingredients: [String],
  price: {
    type: Number,
    required: true,
  },
  reviews: [
    {
      rating: {
        type: Number,
        required: true,
      },
      comment: String,
    },
  ],
});

// Create the Dish model
const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
