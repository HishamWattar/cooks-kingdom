const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const Dish = require('../models/dish');
const Cart = require('../models/cart');
const { User } = require('../models/user');

let customerToken;
let customerId;
const req = supertest(app);
let dishId;

const customerUser = {
  firstName: 'cartCustomer',
  lastName: 'cartCustomer',
  password: 'cartCustomer%123',
  username: 'cartCustomerUser',
  email: 'cartCustomer@example.com',
  role: 'customer',
};

beforeAll(async () => {
  await db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(customerUser);
  customerId = res.body.data._id;
  [customerToken] = res.headers['set-cookie'][0].split(';');
  // const dish = new Dish(dishes[0]);
  // await dish.save();
  dishId = customerId;
});

afterAll(async () => {
  await User.deleteMany({
    email: customerUser.email,
  });
  await Dish.deleteMany({});
  await Cart.deleteMany({});
  await db.closeDatabase();
});
describe('Cart Endpoints', () => {
  describe('post /api/cart', () => {
    it('creates a new cart and return it', async () => {
      const res = await req.post('/api/cart').set('Cookie', customerToken);
      expect(res.statusCode).toBe(201);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('get /api/cart', () => {
    it('gets a cart ', async () => {
      const res = await req.get('/api/cart').set('Cookie', customerToken);
      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('delete /api/cart', () => {
    it('deletes a cart ', async () => {
      const res = await req.delete('/api/cart').set('Cookie', customerToken);
      expect(res.statusCode).toBe(204);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});

describe('CartItem Endpoints', () => {
  describe('post /api/cart/item/:dishId', () => {
    it('creates a new cart item and return the cart', async () => {
      const res = await req
        .post(`/api/cart/item/${dishId}`)
        .set('Cookie', customerToken);
      expect(res.statusCode).toBe(201);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post(`/api/cart/item/${dishId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('get /api/cart/item/:dishId', () => {
    it('gets a cart item ', async () => {
      const res = await req
        .get(`/api/cart/item/${dishId}`)
        .set('Cookie', customerToken);
      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.get(`/api/cart/item/${dishId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('delete /api/cart/item/:dishId', () => {
    it('deletes cart item and return the cart', async () => {
      const res = await req
        .delete(`/api/cart/item/${dishId}`)
        .set('Cookie', customerToken);
      expect(res.statusCode).toBe(204);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.delete('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});
