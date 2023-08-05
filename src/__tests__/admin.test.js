const supertest = require('supertest');
const app = require('../app'); // Import your Express app
const db = require('../db/connection');
const { User } = require('../models/user');
const { sendChefWelcomeEmail } = require('../utils/email');
// const uploadImage = require('../services/gcs');

const req = supertest(app);
jest.mock('../utils/email');

let adminToken;
let customerToken;
let customerId;
let chefId;
const fakeUserId = '123432334334445563122154';

const customerUser = {
  firstName: 'customer',
  lastName: 'customer',
  password: 'Customer%123',
  username: 'customerUser',
  email: 'customer@example.com',
  role: 'customer',
};

const adminUser = {
  firstName: 'admin',
  lastName: 'admin',
  password: 'Admin%123',
  username: 'AdminUser',
  email: 'admin@example.com',
  role: 'admin',
};

const newChef = {
  firstName: 'New',
  lastName: 'Chef',
  username: 'chefUser',
  email: 'newchef@example.com',
  password: 'Newchef$123',
  role: 'chef',
};
beforeAll(async () => {
  await db.connectToMongo();
  let res = await req.post('/api/auth/signup').send(adminUser);
  [adminToken] = res.headers['set-cookie'][0].split(';');
  res = await req.post('/api/auth/signup').send(customerUser);
  customerId = res.body.data._id;
  [customerToken] = res.headers['set-cookie'][0].split(';');
});

afterAll(async () => {
  // await db.clearDatabase();
  await User.deleteMany({});
  await db.closeDatabase();
});

describe('Admin Endpoints', () => {
  describe('GET /api/admin/user', () => {
    it('should return all users', async () => {
      const res = await req.get('/api/admin/user').set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      // Check if the response contains the users
      expect(res.body.data.length).toBeGreaterThan(1);
    });

    it('should return an error message when admin is not authenticated', async () => {
      const res = await req.get('/api/admin/user');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });

    it('should return an error message when the user is not an admin', async () => {
      // Pass customer token instead of admin token
      const res = await req.get('/api/admin/user').set('Cookie', customerToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('This action is unauthorized');
    });
  });

  describe('GET /api/admin/user/filter', () => {
    it('should return all filtered users', async () => {
      const res = await req
        .get('/api/admin/user/filter?firstName=customer')
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      // Check if the response contains the filtered users
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/admin/user/:id', () => {
    it('should return a specific user by ID', async () => {
      const res = await req
        .get(`/api/admin/user/${customerId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      // Check if the response contains the users and excludes the admin user
      expect(res.body.data.firstName).toBe('customer');
      expect(res.body.data.lastName).toBe('customer');
      expect(res.body.data.email).toBe('customer@example.com');
      expect(res.body.data.role).toBe('customer');
    });

    it('should return 404 if the user is not found', async () => {
      const res = await req
        .get(`/api/admin/user/${fakeUserId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(404);

      expect(res.body.message).toBe('User not found');
    });
  });

  describe('POST /api/admin/user', () => {
    it('should return a new customer', async () => {
      const newCustomer = {
        firstName: 'New',
        lastName: 'Customer',
        username: 'newCustomer',
        email: 'newcustomer@example.com',
        password: 'Newcustomer$123',
        role: 'customer',
      };

      const res = await req
        .post('/api/admin/user')
        .set('Cookie', adminToken)
        .send(newCustomer);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(201);

      // Check if the response contains the created customer details
      expect(res.body.data.firstName).toBe('New');
      expect(res.body.data.lastName).toBe('Customer');
      expect(res.body.data.username).toBe('newCustomer');
      expect(res.body.data.email).toBe('newcustomer@example.com');
      expect(res.body.data.role).toBe('customer');
    });

    it('should return a new chef', async () => {
      const res = await req
        .post('/api/admin/user')
        .set('Cookie', adminToken)
        .send(newChef);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(201);

      // Check if the response contains the created chef details
      expect(res.body.data.firstName).toBe('New');
      expect(res.body.data.lastName).toBe('Chef');
      expect(res.body.data.username).toBe('chefUser');
      expect(res.body.data.email).toBe('newchef@example.com');
      expect(res.body.data.role).toBe('chef');

      chefId = res.body.data._id;
    });

    it('should return 409 if the email is already taken', async () => {
      const duplicatedUser = {
        firstName: 'New',
        lastName: 'Customer',
        username: 'newCustomer',
        email: 'newcustomer@example.com',
        password: 'Newcustomer$123',
        role: 'customer',
      };

      const res = await req
        .post('/api/admin/user')
        .set('Cookie', adminToken)
        .send(duplicatedUser);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(409);

      expect(res.body.message).toBe('The email already exists');
    });

    it('should return validation errors for invalid data', async () => {
      const invalidUser = {
        username: 'newCustomer',
        role: 'customer',
      };

      const res = await req
        .post('/api/admin/user')
        .set('Cookie', adminToken)
        .send(invalidUser);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(422);

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/admin/user/:id', () => {
    it('should return the updated user by ID', async () => {
      const res = await req
        .put(`/api/admin/user/${customerId}`)
        .set('Cookie', adminToken)
        .send({ firstName: 'test' });

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      // Check if the response contains the updated user details
      expect(res.body.data.firstName).toBe('test');
      expect(res.body.data.lastName).toBe('customer');
      expect(res.body.data.email).toBe('customer@example.com');
      expect(res.body.data.role).toBe('customer');
    });

    it('should return 404 if the user is not found', async () => {
      const res = await req
        .put(`/api/admin/user/${fakeUserId}`)
        .set('Cookie', adminToken)
        .send({ firstName: 'test' });

      // Check if the response status code is correct
      expect(res.statusCode).toBe(404);

      expect(res.body.message).toBe('User not found');
    });

    it('should return validation errors for invalid data', async () => {
      const res = await req
        .put(`/api/admin/user/${customerId}`)
        .set('Cookie', adminToken)
        .send({ firstName: 342 });

      // Check if the response status code is correct
      expect(res.statusCode).toBe(422);

      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/admin/user/approve-chef/:id', () => {
    it('should approve the user and mark him as a chef.', async () => {
      const res = await req
        .put(`/api/admin/user/approve-chef/${chefId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);

      expect(res.body.message).toBe('Chef approval successful.');
      expect(sendChefWelcomeEmail).toHaveBeenCalledTimes(1);
      expect(sendChefWelcomeEmail).toHaveBeenCalledWith(newChef.email);
    });

    it('should return an error message with user is not found.', async () => {
      const res = await req
        .put(`/api/admin/user/approve-chef/${fakeUserId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(404);

      expect(res.body.message).toBe('User not found.');
    });

    it('should return an error message when user is already approved.', async () => {
      const res = await req
        .put(`/api/admin/user/approve-chef/${chefId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(400);

      expect(res.body.message).toBe('User is already approved as a chef.');
    });
  });

  describe('DELETE /api/admin/user/:id', () => {
    it('should return nothing', async () => {
      const res = await req
        .delete(`/api/admin/user/${customerId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(204);
    });

    it('should return 404 if the user is not found', async () => {
      const res = await req
        .delete(`/api/admin/user/${fakeUserId}`)
        .set('Cookie', adminToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(404);

      expect(res.body.message).toBe('User not found');
    });
  });
});
