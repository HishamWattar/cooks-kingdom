const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

// Address schema
const addressSchema = new Schema({
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
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

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
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
    },
    providerId: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'local'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['customer', 'chef', 'admin'],
    },
    addresses: [addressSchema], // User addresses
    isActive: Boolean,
  },
  {
    timestamps: true,
    discriminatorKey: 'type',
  }
);
userSchema.pre('save', async function (next) {
  // Only hash the password if it's being modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt to add to the password hash
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the generated salt
    // Replace the plaintext password with the hashed password
    this.password = await bcrypt.hash(this.password, salt);

    return next();
  } catch (error) {
    return next(error);
  }
});

// Hide "__v" and "password" fields from query results
userSchema.set('toJSON', {
  transform(doc, ret) {
    // eslint-disable-next-line no-param-reassign
    delete ret.__v;
    // eslint-disable-next-line no-param-reassign
    delete ret.password;
  },
});

// Base user model
const userModel = mongoose.model('User', userSchema);

// Chef model
const chefSchema = new Schema({
  experienceYears: Number,
  bio: String,
  isApproved: Boolean,
  specialty: {
    type: String,
  },
});
const chefModel = userModel.discriminator('Chef', chefSchema, 'chef');

// Customer model
const customerModel = userModel.discriminator(
  'Customer',
  new Schema({
    preferences: {
      type: [String],
    },
    allergies: {
      type: [String],
    },
  }),
  'customer'
);
chefSchema.virtual('rating', {
  ref: 'Dish',
  localField: '_id',
  foreignField: 'chefId',
  justOne: false,
  aggregate: [
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$reviews.rate' },
      },
    },
    {
      $project: {
        _id: 0,
        avgRating: 1,
      },
    },
  ],
});

chefSchema.set('toJSON', {
  virtuals: true,
});

module.exports = {
  User: userModel,
  Customer: customerModel,
  Chef: chefModel,
};
