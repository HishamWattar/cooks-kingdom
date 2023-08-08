const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const Dish = require('../models/dish');
// const Cart = require('../models/cart');
// const { User } = require('../models/user');
// const { Chef } = require('../models/user');

const req = supertest(app);
jest.mock('../utils/email');

let dishId;
let customerToken;
let cartItemId;

const customerUser = {
  firstName: 'cartCustomer',
  lastName: 'cartCustomer',
  password: 'cartCustomer%123',
  username: 'cartCustomerUser',
  email: 'ahmadalashtar@gmail.com',
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
  spaghetti.chefId = '123432334334445563122154';
  const dish = await Dish.create(spaghetti);
  dishId = dish._id.toString();
});

afterAll(async () => {
  // await User.deleteMany({
  //   email: customerUser.email,
  // });
  // await Chef.deleteMany({});
  // await Dish.deleteMany({});
  // await Cart.deleteMany({});
  await db.clearDatabase();
  await db.closeDatabase();
});

describe('CartItem Endpoints', () => {
  describe('POST /api/cart/item', () => {
    it('should add a new dish a cart and return cart', async () => {
      const res = await req
        .post('/api/cart/item')
        .send({ dishId })
        .set('Cookie', customerToken);
      expect(res.statusCode).toBe(201);
      cartItemId = res.body.cartItems[0]._id;
    });

    it('should return an error message when dish is already in cart', async () => {
      const res = await req
        .post('/api/cart/item')
        .send({ dishId })
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Item already in cart.');
    });

    it('should return an error message when dish is not exist', async () => {
      const res = await req
        .post('/api/cart/item')
        .send({ dishId: '123432334334445563122154' })
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Dish not found.');
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.post('/api/cart/item');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('PUT /api/cart/item/:id', () => {
    it('should update item of cart by ID and return cart', async () => {
      const res = await req
        .put(`/api/cart/item/${cartItemId}`)
        .send({ quantity: 3 })
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when item in not exist', async () => {
      const res = await req
        .put(`/api/cart/item/123432334334445563122154`)
        .send({ quantity: 3 })
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Item not found.');
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req
        .put(`/api/cart/item/${cartItemId}`)
        .send({ quantity: 3 });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('GET /api/cart/item/:id', () => {
    it('should return item of cart by ID', async () => {
      const res = await req
        .get(`/api/cart/item/${cartItemId}`)
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when item is not exist', async () => {
      const res = await req
        .get(`/api/cart/item/64cfae3a7d0e60d0e93bf11b`)
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Item not found.');
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.get(`/api/cart/item/${cartItemId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('delete /api/cart/item', () => {
    it('should delete item of cart and return cart', async () => {
      const res = await req
        .delete(`/api/cart/item/${cartItemId}`)
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(204);
    });

    it('should return an error message when item is not exist', async () => {
      const res = await req
        .delete(`/api/cart/item/${cartItemId}`)
        .set('Cookie', customerToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Item not found.');
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.delete(`/api/cart/item/${dishId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});
describe('Cart Endpoints', () => {
  describe('GET /api/cart', () => {
    it('should return authenticated user cart ', async () => {
      const res = await req.get('/api/cart').set('Cookie', customerToken);

      expect(res.statusCode).toBe(200);
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.get('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });

  describe('delete /api/cart', () => {
    it('should delete authenticated user cart ', async () => {
      const res = await req.delete('/api/cart').set('Cookie', customerToken);

      expect(res.statusCode).toBe(204);
    });

    it("should return an error message when user doesn't have a cart", async () => {
      const res = await req.delete('/api/cart').set('Cookie', customerToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("You don't have a cart.");
    });

    it('should return an error message when user is not authenticated', async () => {
      const res = await req.delete('/api/cart');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthenticated');
    });
  });
});
