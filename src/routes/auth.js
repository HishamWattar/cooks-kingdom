const express = require('express');

const routes = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth');

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

module.exports = routes;
