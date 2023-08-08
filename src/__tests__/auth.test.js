const supertest = require('supertest');
require('jsonwebtoken');
const app = require('../app');
const db = require('../db/connection');
const { User } = require('../models/user');
const { sendSignUpWelcomeEmail } = require('../utils/email');

const req = supertest(app);

jest.mock('../utils/email');

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const newUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'ahmadalashtar@gmail.com',
  username: 'JohnDoe',
  password: 'Correct$123',
  avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
};

const correctUser = {
  email: 'john.doe@example.com',
  password: 'Correct$123',
};

const invalidUser = {
  email: 'invalid@example.com',
  password: 'Invalid$123',
};

let token;

beforeAll(async () => {
  await db.connectToMongo();
});

afterAll(async () => {
  await User.deleteMany({
    email: newUser.email,
  });
  await db.closeDatabase();
});

let redirectUri = null;

describe('Local Auth Endpoints', () => {
  describe('Post /api/auth/signup', () => {
    it('Returns a new user', async () => {
      const res = await req.post('/api/auth/signup').send(newUser);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(201);

      // Check if the response contains the user data
      expect(res.body.data.firstName).toBe(newUser.firstName);
      expect(res.body.data.lastName).toBe(newUser.lastName);
      expect(res.body.data.email).toBe(newUser.email);
      expect(res.body.data.username).toBe(newUser.username);

      // Check if the response contains a jwt
      const tokenCookie = res.headers['set-cookie'][0];
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie.includes('token=')).toBe(true);
    });

    it('Returns validation errors for invalid data', async () => {
      // Missing three required fields 'firstName' and 'lastName' and 'username'
      const res = await req.post('/api/auth/signup').send(invalidUser);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(422);

      // Check if the response contains the user data
      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Post /api/auth/signin', () => {
    it('Returns a success message when valid credentials are provided', async () => {
      const res = await req.post('/api/auth/signin').send(correctUser);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      // Check if the response message is correct
      expect(res.body.message).toBe('You have logged in successfully');

      // Check if the response contains a jwt
      const tokenCookie = res.headers['set-cookie'][0];
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie.includes('token=')).toBe(true);

      [token] = res.headers['set-cookie'][0].split(';');
    });

    it('Returns an error message when invalid credentials are provided', async () => {
      const res = await req.post('/api/auth/signin').send(invalidUser);

      expect(res.statusCode).toBe(401);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/update-password', () => {
    it('should update authenticated user password', async () => {
      const res = await req
        .post('/api/auth/update-password')
        .set('Cookie', token)
        .send({
          currentPassword: correctUser.password,
          newPassword: 'NewPassword!12243',
          passwordConfirmation: 'NewPassword!12243',
        });

      expect(res.statusCode).toBe(200);

      expect(res.body.message).toBe('Password updated successfully.');
    });

    it('should return an error message when new password and confirmation password do not match', async () => {
      const res = await req
        .post('/api/auth/update-password')
        .set('Cookie', token)
        .send({
          currentPassword: correctUser.password,
          newPassword: 'NewPassword!12243',
          passwordConfirmation: 'NewPassword$12243',
        });

      expect(res.statusCode).toBe(400);

      expect(res.body.message).toBe(
        'New password and password confirmation do not match.'
      );
    });

    it('should return an error message when current password in incorrect', async () => {
      const res = await req
        .post('/api/auth/update-password')
        .set('Cookie', token)
        .send({
          currentPassword: 'incorrectpassword',
          newPassword: 'NewPassword!12243',
          passwordConfirmation: 'NewPassword!12243',
        });

      expect(res.statusCode).toBe(400);

      expect(res.body.message).toBe('Current password in incorrect.');
    });

    it('should return an error message when new password is similar to current password', async () => {
      const res = await req
        .post('/api/auth/update-password')
        .set('Cookie', token)
        .send({
          currentPassword: correctUser.password,
          newPassword: correctUser.password,
          passwordConfirmation: correctUser.password,
        });

      expect(res.statusCode).toBe(400);

      expect(res.body.message).toBe('Current password in incorrect.');
    });
  });

  describe('Post /api/auth/signout', () => {
    it('Returns a success message when a user is authenticated', async () => {
      const res = await req.post('/api/auth/signout').set('Cookie', token);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      // Check if the response message is correct
      expect(res.body.message).toBe('You logged out successfully');

      // Check if the response contains the 'set-cookie' header with a token cookie that expires immediately
      const tokenCookie = res.headers['set-cookie'][0];
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie.includes('token=;')).toBe(true); // The token cookie should be cleared (empty value) with an immediate expiration
    });

    it('Returns an error message when a user is not authenticated', async () => {
      const res = await req.post('/api/auth/signout');

      // Check if the response status code is correct
      expect(res.statusCode).toBe(401);

      // Check if the response message is correct
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});

describe('Google Auth Endpoints', () => {
  describe('GET /api/auth/google', () => {
    it('Redirects to google authorization page', (done) => {
      req
        .get('/api/auth/google')
        .expect(302)
        .expect('location', /google\.com/)
        .end(done);
    });

    it('Redirects with correct scope and credentials', async () => {
      const res = await req.get('/api/auth/google');
      const { location } = res.header;

      expect(location).not.toBeNull();

      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      const uri = new URL(location);
      const scope = uri.searchParams.get('scope')?.split(' ') ?? [];
      const redirectTo = uri.searchParams.get('redirect_uri') ?? '';
      // eslint-disable-next-line camelcase
      const client_id = uri.searchParams.get('client_id') ?? '';

      expect(scope).toEqual(
        expect.arrayContaining(['openid', 'email', 'profile'])
      );
      expect(redirectTo).toMatch(URL_REGEX);
      // eslint-disable-next-line camelcase
      expect(client_id.length).toBeGreaterThan(10);

      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      if (redirectTo) redirectUri = new URL(redirectTo);
    });
  });

  describe(`GET REDIRECT_URI`, () => {
    it('Redirects to google sign in page without cookie for incorrect credentials', async () => {
      expect(redirectUri).not.toBeNull();
      const res = await req.get(redirectUri.pathname);
      expect(res.status).toBe(302);
      expect(res.header['set-cookie']).not.toBeDefined();
    });
  });
});

describe('Facebook Auth Endpoints', () => {
  describe('GET /api/auth/facebook', () => {
    it('Redirects to facebook authorization page', (done) => {
      req
        .get('/api/auth/facebook')
        .expect(302)
        .expect('location', /facebook\.com/)
        .end(done);
    });

    it('Redirects with correct scope and credentials', async () => {
      const res = await req.get('/api/auth/facebook');
      const { location } = res.header;

      expect(location).not.toBeNull();

      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      const uri = new URL(location);
      const redirectTo = uri.searchParams.get('redirect_uri') ?? '';
      // eslint-disable-next-line camelcase
      const client_id = uri.searchParams.get('client_id') ?? '';

      expect(redirectTo).toMatch(URL_REGEX);
      // eslint-disable-next-line camelcase
      expect(client_id.length).toBeGreaterThan(10);

      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      if (redirectTo) redirectUri = new URL(redirectTo);
    });
  });

  describe(`GET REDIRECT_URI`, () => {
    it('Redirects to facebook sign in page without cookie for incorrect credentials', async () => {
      expect(redirectUri).not.toBeNull();
      const res = await req.get(redirectUri.pathname);
      expect(res.status).toBe(302);
      expect(res.header['set-cookie']).not.toBeDefined();
    });
  });
});
