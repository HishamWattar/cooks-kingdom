const express = require('express');

const routes = express.Router();
const userController = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const {
  updateProfile,
  validationHandler,
} = require('../middlewares/validation');

// Get authenticated user profile
routes.get('/me', isAuthenticated, userController.getUserProfile);

// Update authenticated user profile
routes.put(
  '/profile',
  isAuthenticated,
  updateProfile,
  validationHandler,
  userController.updateUserProfile
);

module.exports = routes;
