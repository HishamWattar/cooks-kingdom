const mongoose = require('mongoose');

const { Schema } = mongoose;

// Address schema
const addressSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
    },
    apartment: {
      type: Number,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Base user schema
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    addresses: [addressSchema], // User addresses
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
  }
);
// Base user model
const userModel = mongoose.model('User', userSchema);

// Chef model
const chefModel = userModel.discriminator(
  'Chef',
  new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    experienceYears: Number,
    bio: String,
    rating: Number,
    specialty: {
      type: String,
      required: true,
    },
  }),
  'chef'
);

// Customer model
const customerModel = userModel.discriminator(
  'Customer',
  new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    preferences: {
      type: [String],
    },
    allergies: {
      type: [String],
    },
  }),
  'customer'
);

// Admin model
const adminModel = userModel.discriminator(
  'Admin',
  new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
  }),
  'admin'
);

module.exports = {
  Customer: customerModel,
  Chef: chefModel,
  Admin: adminModel,
};
