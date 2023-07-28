const express = require('express');

const routes = express.Router();

const userController = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const {
  updateProfile,
  validationHandler,
  updateRole,
  updateAddress,
} = require('../middlewares/validation');
const upload = require('../middlewares/multer');

// Get authenticated user profile
routes.get('/me', isAuthenticated, userController.getUserProfile);

// Update an authenticated user role
routes.put(
  '/profile/role',
  isAuthenticated,
  updateRole,
  validationHandler,
  userController.updateUserRole
);

// Update an authenticated user address by id
routes.put(
  '/profile/address/:id',
  isAuthenticated,
  updateAddress,
  validationHandler,
  userController.updateUserAddress
);

// Update authenticated user profile
routes.put(
  '/profile',
  isAuthenticated,
  updateProfile,
  validationHandler,
  userController.updateUserProfile
);

// Upload a new profile picture for authenticated user profile
routes.post(
  '/profile/upload',
  isAuthenticated,
  upload.single('image'),
  userController.uploadUserImage
);

routes.delete('/profile', isAuthenticated, userController.deleteUserProfile);

module.exports = routes;
