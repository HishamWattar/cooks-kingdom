const { check, validationResult } = require('express-validator');

// Validation rules for signup
const signup = [
  check('firstName')
    .notEmpty()
    .withMessage('firstName should not be empty')
    .isLength({ min: 3 })
    .withMessage('firstName should be at least 5 characters long')
    .matches(/^\S+$/)
    .withMessage('firstName should not include spaces'),
  check('lastName')
    .notEmpty()
    .withMessage('lastName should not be empty')
    .isLength({ min: 3 })
    .withMessage('lastName should be at least 5 characters long')
    .matches(/^\S+$/)
    .withMessage('lastName should not include spaces'),
  check('name')
    .notEmpty()
    .withMessage('name should not be empty')
    .isLength({ min: 6 })
    .withMessage('name should be at least 8 characters long')
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

const signin = [
  check('email')
    .notEmpty()
    .withMessage('email should not be empty')
    .isEmail()
    .withMessage('Invalid Email'),
  check('password').notEmpty().withMessage('password should not be empty'),
];

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
  validationHandler,
};
