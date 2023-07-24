const { User } = require('../models/user');
const CustomError = require('../utils/customError');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json(user);
  } catch (error) {
    return next(new CustomError('Internal server error', 500));
  }
};

module.exports = {
  getUserProfile,
};
