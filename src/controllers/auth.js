const { compare } = require('bcrypt');
const { User } = require('../models/user');
const CustomError = require('../utils/customError');

// This a function will create token and assign it to cookie
const { saveTokenToCookie } = require('../utils/token');

const { sendSignUpWelcomeEmail } = require('../utils/email');

const savePayloadToToken = (req, res) => {
  saveTokenToCookie(req.user, res);
  return res.status(200).json({ message: 'You have logged in successfully' });
};

const signup = async (req, res, next) => {
  try {
    // Check if email is already been token.
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return next(new CustomError('The email is already exists', 409));
    }

    user = await User.create(req.body);

    saveTokenToCookie(user, res);

    return res.status(201).json({ data: user });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new CustomError('Invalid credentials', 401));
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return next(new CustomError('Invalid credentials', 401));
    }

    saveTokenToCookie(user, res);

    return res.json({ message: 'You have logged in successfully' });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const signout = async (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'You logged out successfully' });
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, passwordConfirmation } = req.body;

    if (newPassword !== passwordConfirmation) {
      return next(
        new CustomError(
          'New password and password confirmation do not match.',
          400
        )
      );
    }

    const user = await User.findById(req.user.id);

    const isValidPassword = await compare(currentPassword, user.password);
    if (!isValidPassword) {
      return next(new CustomError('Current password in incorrect.', 400));
    }

    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      return next(
        new CustomError(
          'New password should be different from the current password.',
          400
        )
      );
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

module.exports = {
  savePayloadToToken,
  signup,
  signin,
  signout,
  changePassword,
};
