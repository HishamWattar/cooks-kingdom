const supertest = require('supertest');
const app = require('../app');

// Mock the getUserID function
const req = supertest(app);
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGJlN2M4ZDljMjcxMjRiNWI2ZmU0MzciLCJpYXQiOjE2OTAyMDUzMjUsImV4cCI6MTY5MTUwMTMyNX0.9GPQYXtWvI5OFYVowYrqOR8oidzkiaPesxdpiU8IsFo';

describe('Auth Endpoints', () => {
  describe('post /api/cart/', () => {
    it('Creates new cart', (done) => {
      req
        .post('/api/cart/')
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .end(done);
    });
  });
});
