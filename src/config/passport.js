const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const { User } = require('../models/user');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GAPP_CLIENT_ID,
      clientSecret: process.env.GAPP_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const userProfile = {
        email: profile._json.email,
        username: profile._json.name,
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        avatar: profile._json.picture,
        providerId: profile._json.sub,
        provider: 'google',
      };
      try {
        let user = await User.findOne({ providerId: userProfile.providerId });
        if (!user) {
          user = await User.create(userProfile);
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'name', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      const userProfile = {
        email: profile._json.email,
        username: profile._json.name,
        firstName: profile._json.first_name,
        lastName: profile._json.last_name,
        avatar: profile._json.picture.data.url,
        providerId: profile._json.sub,
        provider: 'facebook',
      };
      try {
        let user = await User.findOne({ providerId: userProfile.providerId });
        if (!user) {
          user = await User.create(userProfile);
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
