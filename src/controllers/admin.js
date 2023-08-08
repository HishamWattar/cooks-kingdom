const { User, Customer, Chef } = require('../models/user');
const CustomError = require('../utils/customError');
const { sendChefWelcomeEmail } = require('../utils/email');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.json({ data: users });
  } catch (err) {
    return next(new CustomError(err.message, 500));
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
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const getUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    return res.json({ data: user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const createUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return next(new CustomError('The email already exists.', 409));
    }

    const user =
      role === 'customer'
        ? await Customer.create(req.body)
        : await Chef.create(req.body);
    return res.status(201).json({ data: user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    return res.json({ data: user });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const approveChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chef = await Chef.findById(id);

    if (!chef) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (chef.isApproved) {
      return res
        .status(400)
        .json({ message: 'User is already approved as a chef.' });
    }

    chef.isApproved = true;
    await chef.save();

    sendChefWelcomeEmail(chef.email);

    return res.json({ message: 'Chef approval successful.' });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

module.exports = {
  getAllUsers,
  filterUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  approveChef,
};
