const express = require('express');

const routes = express.Router();
const adminController = require('../controllers/admin');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const {
  createUser,
  updateUser,
  validationHandler,
} = require('../middlewares/validation');

routes.get('/', isAuthenticated, isAdmin, adminController.getAllUsers);

routes.get('/filter', isAuthenticated, isAdmin, adminController.filterUsers);

routes.get('/:id', isAuthenticated, isAdmin, adminController.getUser);

routes.post(
  '/',
  isAuthenticated,
  isAdmin,
  createUser,
  validationHandler,
  adminController.createUser
);

routes.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  updateUser,
  validationHandler,
  adminController.updateUser
);

routes.delete('/:id', isAuthenticated, isAdmin, adminController.deleteUser);

routes.put(
  '/approve-chef/:id',
  isAuthenticated,
  isAdmin,
  adminController.approveChef
);

module.exports = routes;
