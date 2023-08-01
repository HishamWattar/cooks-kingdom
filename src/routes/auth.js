const express = require('express');

const routes = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth');
const { isAuthenticated } = require('../middlewares/auth');
const {
  signup,
  signin,
  validationHandler,
  updatePassword,
} = require('../middlewares/validation');

routes.post('/signup', signup, validationHandler, authController.signup);

routes.post('/signin', signin, validationHandler, authController.signin);

routes.post(
  '/update-password',
  isAuthenticated,
  updatePassword,
  validationHandler,
  authController.changePassword
);

routes.post('/signout', isAuthenticated, authController.signout);

routes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })
);

routes.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/google',
  }),
  authController.savePayloadToToken
);

routes.get('/facebook', passport.authenticate('facebook'));

routes.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/api/auth/facebook',
  }),
  authController.savePayloadToToken
);

module.exports = routes;
