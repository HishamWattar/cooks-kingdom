const { User, Chef, Customer } = require('../models/user');
const CustomError = require('../utils/customError');
const sendEmail = require('../utils/email');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json(user);
  } catch (error) {
    return next(new CustomError('Internal server error', 500));
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    // Solution 1 for addresses and does not change the address id
    // And require user to send address id he wants to update besides the updated address fields
    // if (addresses && addresses.length > 0) {
    //   // eslint-disable-next-line no-restricted-syntax
    //   for (const address of addresses) {
    //     const addressIdToUpdate = address._id; // Assuming you have a unique identifier for the address, like _id
    //     // eslint-disable-next-line no-await-in-loop
    //     await User.updateMany(
    //       { _id: req.user.id, 'addresses._id': addressIdToUpdate },
    //       { $set: { 'addresses.$': address } }
    //     );
    //   }
    // }

    // if (addresses && addresses.length > 0) {
    //   // eslint-disable-next-line no-restricted-syntax
    //   for (const address of addresses) {
    //     const addressIdToUpdate = address.id; // Use the custom id field
    //     // eslint-disable-next-line no-await-in-loop
    //     await User.updateOne(
    //       { _id: req.user.id },
    //       { $set: { 'addresses.$[elem]': address } },
    //       { arrayFilters: [{ 'elem.id': addressIdToUpdate }] }
    //     );
    //   }
    // }
    const {
      name,
      addresses,
      firstName,
      lastName,
      email,
      avatar,
      role,
      experienceYears,
      bio,
      rating,
      specialty,
      preferences,
      allergies,
    } = req.body;

    const options = { new: true };
    let updatedUser;
    const updateData = {
      name,
      $set: { addresses },
      firstName,
      lastName,
      email,
      avatar,
      role,
      experienceYears,
      bio,
      rating,
      specialty,
      preferences,
      allergies,
    };

    const user = await User.findById(req.user.id);
    // If the user role is not specified yet
    if (!user.role) {
      if (role) {
        updateData.type = role;
        options.overwriteDiscriminatorKey = true;
      }

      // Check if the user wants to be a chef
      if (role === 'chef') {
        // Email admin in case user wants to an admin
        const admin = await User.findOne({ role: 'admin' });
        sendEmail(admin.email, user._id);
      }

      // solution 2 for addresses and changes the address id
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        options
      );
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
    }

    return res.json(updatedUser);
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
