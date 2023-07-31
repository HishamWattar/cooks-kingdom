const { check, validationResult } = require('express-validator');
require('../utils/customError');
const { User } = require('../models/user');
const logger = require('../utils/logger');

// Validation rules for signup
const signup = [
  check('firstName')
    .notEmpty()
    .withMessage('firstName should not be empty')
    .isLength({ min: 3 })
    .withMessage('firstName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces'),
  check('lastName')
    .notEmpty()
    .withMessage('lastName should not be empty')
    .isLength({ min: 3 })
    .withMessage('firstName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('lastName should not include spaces'),
  check('name')
    .notEmpty()
    .withMessage('name should not be empty')
    .isLength({ min: 6 })
    .withMessage('name should be at least 6 characters long')
    .matches(/^\S+$/)
    .withMessage('name should not include spaces'),
  check('email')
    .notEmpty()
    .withMessage('email should not be empty')
    .isEmail()
    .withMessage('Invalid Email'),
  check('password')
    .notEmpty()
    .withMessage('password should not be empty')
    .isLength({ min: 8 })
    .withMessage('password should be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    ),
];

// Validation rules for signin
const signin = [
  check('email')
    .notEmpty()
    .withMessage('email should not be empty')
    .isEmail()
    .withMessage('Invalid Email'),
  check('password').notEmpty().withMessage('password should not be empty'),
];

// Validation rules when admin create a new user
const createUser = [
  check('firstName')
    .notEmpty()
    .withMessage('firstName should not be empty')
    .isLength({ min: 3 })
    .withMessage('firstName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces and special charters'),
  check('lastName')
    .notEmpty()
    .withMessage('lastName should not be empty')
    .isLength({ min: 3 })
    .withMessage('lastName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces and special charters'),
  check('name')
    .notEmpty()
    .withMessage('name should not be empty')
    .isLength({ min: 6 })
    .withMessage('name should be at least 6 characters long')
    .matches(/^\S+$/)
    .withMessage('firstName should not include spaces and special charters'),
  check('email')
    .notEmpty()
    .withMessage('email should not be empty')
    .isEmail()
    .withMessage('Invalid Email'),
  check('password')
    .notEmpty()
    .withMessage('password should not be empty')
    .isLength({ min: 8 })
    .withMessage('password should be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    ),
  check('role')
    .notEmpty()
    .withMessage('you should specify user role')
    .isIn(['customer', 'chef'])
    .withMessage('role should be chef or customer'),
];

// Validation rules when admin update an existed user
const updateUser = [
  check('firstName')
    .isLength({ min: 3 })
    .withMessage('firstName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces and special charters')
    .optional(),
  check('lastName')
    .isLength({ min: 3 })
    .withMessage('lastName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces and special charters')
    .optional(),
  check('name')
    .isLength({ min: 6 })
    .withMessage('name should be at least 6 characters long')
    .matches(/^\S+$/)
    .withMessage('name should not include spaces and special charters')
    .optional(),
  check('email').isEmail().withMessage('Invalid Email').optional(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('password should be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    )
    .optional(),
];

const updateRole = [
  check('role')
    .notEmpty() // Allow the role field to be optional
    .withMessage('role should not be empty')
    .isIn(['customer', 'chef'])
    .withMessage('role should be chef or customer'),
];

// Validation rules when user update his address
const updateAddress = [
  check('address.city')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('City can only contain letters and spaces')
    .optional(),
  check('address.country')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces')
    .optional(),
  check('address.street')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Street can only contain letters, numbers, and spaces')
    .optional(),
  check('address.block')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Block can only contain letters, numbers, and spaces')
    .optional(),
  check('address.postalCode')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Postal code can only contain letters and numbers')
    .optional(),
  check('address.apartment')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Apartment can only contain letters, numbers, and spaces')
    .optional(),
  // special code
  check('address.isDefault')
    .isBoolean()
    .withMessage('isDefault should be either true or false')
    .custom(async (value, { req }) => {
      const hasDefaultAddress = req.body.address.isDefault;
      const user = await User.findById(req.user.id);
      if (user.addresses.length > 0) {
        const isDefaultCount = user.addresses.filter(
          (address) => address.isDefault
        ).length;
        if (isDefaultCount > 0 && hasDefaultAddress) {
          throw new Error('Only one address can be set as a default');
        }
      }
    })
    .optional(),
];

// Validation rules when user update his profile
const updateProfile = [
  check('firstName')
    .isLength({ min: 3 })
    .withMessage('firstName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces and special charters')
    .optional(),
  check('lastName')
    .isLength({ min: 3 })
    .withMessage('lastName should be at least 3 characters long')
    .matches(/^[A-Za-z]+$/)
    .withMessage('firstName should not include spaces and special charters')
    .optional(),
  check('name')
    .isLength({ min: 6 })
    .withMessage('name should be at least 6 characters long')
    .matches(/^\S+$/)
    .withMessage('name should not include spaces and special charters')
    .optional(),
  check('addresses').optional({ checkFalsy: true }),
  check('addresses.*.city')
    .notEmpty()
    .withMessage('City should not be empty')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('City can only contain letters and spaces'),
  check('addresses.*.country')
    .notEmpty()
    .withMessage('Country should not be empty')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces'),
  check('addresses.*.street')
    .notEmpty()
    .withMessage('Street should not be empty')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Street can only contain letters, numbers, and spaces'),
  check('addresses.*.block')
    .notEmpty()
    .withMessage('Block should not be empty')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Block can only contain letters, numbers, and spaces'),
  check('addresses.*.postalCode')
    .notEmpty()
    .withMessage('Postal code should not be empty')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Postal code can only contain letters and numbers'),
  check('addresses.*.apartment')
    .notEmpty()
    .withMessage('Apartment should not be empty')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Apartment can only contain letters, numbers, and spaces'),
  // special code :D
  check('addresses.*.isDefault')
    .isBoolean()
    .withMessage('isDefault should be either true or false')
    .custom(async (value, { req }) => {
      const { addresses } = req.body;
      const hasDefaultAddress = addresses.some((address) => address.isDefault);
      const user = await User.findById(req.user.id);
      if (user.addresses.length > 0) {
        const isDefaultCount = user.addresses.filter(
          (address) => address.isDefault
        ).length;
        if (isDefaultCount > 0 && hasDefaultAddress) {
          throw new Error('Only one address can be set as a default');
        }
      }
      const isDefaultCount = addresses.filter(
        (address) => address.isDefault
      ).length;
      if (isDefaultCount > 1) {
        throw new Error('Only one address can be set as a default');
      }
    }),
  check('email').isEmail().withMessage('Invalid Email').optional(),
];

// This middleware to handle the validation rules that are defined above
const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors.array());
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
};

module.exports = {
  signup,
  signin,
  createUser,
  updateUser,
  updateRole,
  updateAddress,
  updateProfile,
  validationHandler,
};
