const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const Dish = require('../models/dish');
const Cart = require('../models/cart');
const { User } = require('../models/user');
const { Chef } = require('../models/user');

const req = supertest(app);
jest.mock('../utils/email');

let dishId;
let customerToken;

const chef = {
  firstName: 'chef',
  lastName: 'chef',
  password: 'cheFf%123',
  name: 'chefName',
  isApproved: true,
  email: 'chefCart@example.com',
  role: 'chef',
};
const customerUser = {
  firstName: 'cartCustomer',
  lastName: 'cartCustomer',
  password: 'cartCustomer%123',
  name: 'cartCustomerUser',
  email: 'cartCustomer@example.com',
  role: 'customer',
};

const spaghetti = {
  name: 'Spaghetti Bolognese',
  price: 12.5,
  ingredients: ['Tomato sauce', 'Minced beef', 'Pasta'],
};

beforeAll(async () => {
  await db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(customerUser);
  [customerToken] = res.headers['set-cookie'][0].split(';');
  const ownerChef = await Chef.create(chef);
  spaghetti.chefId = ownerChef._id;
  const newDish = await Dish.create(spaghetti);
  dishId = newDish._id;
});

afterAll(async () => {
  await User.deleteMany({
    email: customerUser.email,
  });
  await Chef.deleteMany({});
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
  describe('post /api/cart/item', () => {
    it('creates a new cart item and return the cart', async () => {
      const res = await req
        .post('/api/cart/item')
        .send({ id: dishId })
        .set('Cookie', customerToken);
      expect(res.statusCode).toBe(201);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart/item');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('get /api/cart/item', () => {
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

  describe('delete /api/cart/item', () => {
    it('deletes cart item and return the cart', async () => {
      const res = await req
        .delete(`/api/cart/item/${dishId}`)
        .set('Cookie', customerToken);
      expect(res.statusCode).toBe(204);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.delete(`/api/cart/item/${dishId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});
