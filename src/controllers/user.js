const { User, Chef, Customer } = require('../models/user');
const CustomError = require('../utils/customError');
const uploadImage = require('../services/gcs');
const { sendApprovalEmail } = require('../utils/email');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json(user);
  } catch (error) {
    return next(new CustomError('Internal server error', 500));
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.user.id);

    // Check if user already has a role
    if (user.role) {
      return next(new CustomError("You can't change your role", 422));
    }

    // Email admin in case a user wants to be a chef
    if (role === 'chef') {
      const admin = await User.findOne({ role: 'admin' });
      sendApprovalEmail(admin.email, user._id);
    }

    // Update a user role and type
    await User.findByIdAndUpdate(
      req.user.id,
      {
        role,
        type: role,
      },
      {
        new: true,
        overwriteDiscriminatorKey: true,
      }
    );
    return res.json({ message: 'Your role has been updated successfully' });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const updateUserAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { address } = req.body;

    const updatedUserAddress = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'addresses._id': id,
      },
      {
        $set: {
          'addresses.$.city': address.city,
          'addresses.$.country': address.country,
          'addresses.$.street': address.street,
          'addresses.$.block': address.block,
          'addresses.$.postalCode': address.postalCode,
          'addresses.$.apartment': address.apartment,
          'addresses.$.isDefault': address.isDefault,
        },
      },
      { new: true }
    );

    if (!updatedUserAddress) {
      return next(new CustomError('Address is not found', 404));
    }

    return res.json({ message: 'Address updated successfully' });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const deleteUserAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateResult = await User.findByIdAndUpdate(
      {
        _id: req.user.id,
      },
      {
        $pull: { addresses: { _id: id } },
      },
      { new: true }
    );

    // TODO THIS CONDITION NEEDS TO FIXED LATER
    if (!updateResult) {
      return next(new CustomError('Address is not found', 404));
    }

    return res.sendStatus(204);
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const {
      name,
      addresses,
      firstName,
      lastName,
      email,
      avatar,
      experienceYears,
      bio,
      specialty,
      preferences,
      allergies,
    } = req.body;

    const options = { new: true };
    let updatedUser;
    const updateData = {
      name,
      $push: { addresses },
      firstName,
      lastName,
      email,
      avatar,
      experienceYears,
      bio,
      specialty,
      preferences,
      allergies,
    };

    const user = await User.findById(req.user.id);

    // Check if user didn't specify his role yet
    if (!user.role) {
      return next(new CustomError('You should update your role first', 400));
    }

    // Update the user based on their role
    if (user.role === 'chef') {
      updatedUser = await Chef.findByIdAndUpdate(
        req.user.id,
        updateData,
        options
      );
    } else if (user.role === 'customer') {
      updatedUser = await Customer.findByIdAndUpdate(
        req.user.id,
        updateData,
        options
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        options
      );
    }

    return res.json(updatedUser);
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const uploadUserImage = async (req, res, next) => {
  try {
    if (req.file) {
      const imgUrl = await uploadImage(req.file);
      await User.findByIdAndUpdate(
        req.user.id,
        {
          avatar: imgUrl,
        },
        {
          new: true,
        }
      );
      return res.json({ message: 'Profile image uploaded successfully' });
    }
    return next(new CustomError('Please provide a profile image', 422));
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

const deleteUserProfile = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.clearCookie('token');
    return res.sendStatus(204);
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

module.exports = {
  getUserProfile,
  updateUserRole,
  updateUserAddress,
  deleteUserAddress,
  updateUserProfile,
  uploadUserImage,
  deleteUserProfile,
};
