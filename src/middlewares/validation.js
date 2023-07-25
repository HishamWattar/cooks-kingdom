const { check, validationResult } = require('express-validator');
require('../utils/customError');
const { User } = require('../models/user');

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
  // special code :D
  check('addresses.*.isDefault')
    .isBoolean()
    .withMessage('isDefault should be either true or false')
    .custom((value, { req }) => {
      const { addresses } = req.body;
      const isDefaultCount = addresses.filter(
        (address) => address.isDefault
      ).length;
      return isDefaultCount <= 1;
    })
    .withMessage('Only one address can be set as a default'),
  check('email').isEmail().withMessage('Invalid Email').optional(),
];

// This middleware to handle the validation rules that are defined above
const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
  updateProfile,
  validationHandler,
};
