const { User, Customer, Chef } = require('../models/user');
const CustomError = require('../utils/customError');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.json({ data: users });
  } catch (error) {
    return next(new CustomError('Unable to fetch users', 500));
  }
};

const filterUsers = async (req, res, next) => {
  try {
    const { role, firstName, lastName } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (firstName) filter.firstName = firstName;
    if (lastName) filter.lastName = lastName;

    const users = await User.find(filter);
    return res.json({ data: users });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    return res.json({ data: user });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const createUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return next(new CustomError('The email already exists', 409));
    }

    const user =
      role === 'customer'
        ? await Customer.create(req.body)
        : await Chef.create(req.body);
    return res.status(201).json({ data: user });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    return res.json({ data: user });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    return res.sendStatus(204);
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

module.exports = {
  getAllUsers,
  filterUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
