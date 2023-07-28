const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const { connectDB, dropDB } = require('../utils/setuptestdb');
const Dish = require('../models/dish');

// Mock the getUserID function
let customerToken;
let customerId;
const req = supertest(app);
let dishId;
const dishes = [
  {
    name: 'Spaghetti Carbonara',
    chefId: customerId,
    description:
      'Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
    image: 'spaghetti-carbonara.jpg',
    ingredients: [
      'Spaghetti',
      'Eggs',
      'Pancetta',
      'Parmesan Cheese',
      'Black Pepper',
    ],
    price: 12.99,
  },
];

const customerUser = {
  firstName: 'cartCustomer',
  lastName: 'cartCustomer',
  password: 'cartCustomer%123',
  name: 'cartCustomerUser',
  email: 'cartCustomer@example.com',
  role: 'customer',
};

beforeAll(async () => {
  await connectDB();
  const res = await req.post('/api/auth/signup').send(customerUser);
  customerId = res.body.data._id;
  [customerToken] = res.headers['set-cookie'][0].split(';');
  const dish = new Dish(dishes[0]);
  await dish.save();
  dishId = dish.id;
});

afterAll(async () => {
  await dropDB();
});
afterAll(async () => db.closeDatabase());
describe('Cart Endpoints', () => {
  describe('post /api/cart', () => {
    it('creates a new cart and return it', async () => {
      const res = await req.post('/api/cart').set('Cookie', customerToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(201);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('get /api/cart', () => {
    it('creates a new cart and return it', async () => {
      const res = await req.get('/api/cart').set('Cookie', customerToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('delete /api/cart', () => {
    it('creates a new cart and return it', async () => {
      const res = await req.delete('/api/cart').set('Cookie', customerToken);

      // Check if the response status code is correct
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
  describe('post /api/cart/cartItem/:dishId', () => {
    it('creates a new cart and return it', async () => {
      const res = await req
        .post(`/api/cart/cartItem/${dishId}`)
        .set('Cookie', customerToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(201);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post(`/api/cart/cartItem/${dishId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('get /api/cart/cartItem/:dishId', () => {
    it('creates a new cart and return it', async () => {
      const res = await req
        .get(`/api/cart/cartItem/${dishId}`)
        .set('Cookie', customerToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.get(`/api/cart/cartItem/${dishId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('delete /api/cart/cartItem/:dishId', () => {
    it('creates a new cart and return it', async () => {
      const res = await req
        .delete(`/api/cart/cartItem/${dishId}`)
        .set('Cookie', customerToken);

      // Check if the response status code is correct
      expect(res.statusCode).toBe(204);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.delete('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});
