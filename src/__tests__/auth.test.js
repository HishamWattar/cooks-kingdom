const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');

const req = supertest(app);

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
beforeAll(async () => {
  await db();
});

afterAll(async (drop = false) => {
  // eslint-disable-next-line no-unused-expressions
  drop && (await mongoose.connection.dropDatabase());
  await mongoose.disconnect();
  await mongoose.connection.close();
});

let redirectUri = null;

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
