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

module.exports = mongoose.model('Review', reviewSchema);
