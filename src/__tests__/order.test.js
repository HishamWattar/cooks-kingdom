const supertest = require('supertest');
const app = require('../app');
const { Chef } = require('../models/user');
const Dish = require('../models/dish');
const Cart = require('../models/cart');

const req = supertest(app);
const db = require('../db/connection');

jest.mock('../utils/email');
jest.setTimeout(10000);

let customerToken;
let customerId;
let orderId;
let chefToken;
let allDishes;
let fishId;
let chickenId;

const customerUser = {
  firstName: 'customerTests',
  lastName: 'customerTests',
  password: 'Customer%123Tests',
  username: 'customerUserTests',
  email: 'ahmadalashtar@gmail.com',
  role: 'customer',
};
const chefUser = {
  firstName: 'cheftest',
  lastName: 'cheftest',
  password: 'Chef%123test',
  username: 'chefUsertest',
  isApproved: true,
  email: 'cheftest@example.com',
  role: 'chef',
};

const fish = {
  name: 'Fish and Chips',
  price: 5,
  ingredients: [
    'Tomato sauce',
    'Cod fish',
    'Potatoes',
    'Vegetable oil',
    'Yogurt marinade',
  ],
};

const chicken = {
  name: 'Chicken Tikka Masala',
  price: 10,
  ingredients: [
    'Chicken thighs',
    'Yogurt marinade',
    'Tomato sauce',
    'Spices',
    'Potatoes',
  ],
};

beforeAll(async () => {
  await db.connectToMongo();

  let res = await req.post('/api/auth/signup').send(customerUser);
  [customerToken] = res.headers['set-cookie'][0].split(';');
  customerId = res.body.data._id;
  const chef = await Chef.create(chefUser);
  res = await req.post('/api/auth/signin').send(chefUser);
  [chefToken] = res.headers['set-cookie'][0].split(';');

  const chefId = chef._id;
  fish.chefId = chefId;
  chicken.chefId = chefId;
  allDishes = await Dish.insertMany([fish, chicken]);
  fishId = allDishes[0]._id;
  chickenId = allDishes[1]._id;
  const cartData = {
    customerId,
    cartItems: [
      {
        dishId: fishId,
        quantity: 5,
      },
      {
        dishId: chickenId,
        quantity: 2,
      },
    ],
  };
  await Cart.create(cartData);
});

afterAll(async () => {
  await db.clearDatabase();
  await db.closeDatabase();
  jest.clearAllMocks();
});

// Test suite for order endpoints
describe('Order Endpoints', () => {
  // Test for getting all orders for customer
  describe('POST /api/orders', () => {
    // Test for success response
    it('should return a success response with an array of orders', async () => {
      // Make a post-request to the route with the customer id and cart items
      const res = await req.post('/api/orders').set('Cookie', customerToken);

      // Expect a status code of 201 and an array of orders in the response body
      expect(res.status).toBe(201);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].customerId).toEqual(customerId);
      expect(res.body.data[0].totalPrice).toEqual(45);
      expect(res.body.data[0].status).toEqual('pending');
      expect(Array.isArray(res.body.data[0].orderItems)).toBe(true);
      expect(res.body.data[0].orderItems[0].price).toEqual(5);
      expect(res.body.data[0].orderItems[0].quantity).toEqual(5);
      orderId = res.body.data[0]._id;
    });

    it("should return an error message when customer doesn't have a cart or cartItem", async () => {
      const res = await req.post('/api/orders').set('Cookie', customerToken);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });
  });

  describe('GET /api/orders/customer', () => {
    // Test for success response
    it('should return a success response with an array of orders', async () => {
      // Make a get request to the route
      const res = await req
        .get('/api/orders/customer')
        .set('Cookie', customerToken);

      // Expect a status code of 200 and an array of orders in the response body
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // Test for failure response due to invalid token
    it('should return an error message when user is not authenticated', async () => {
      // Make a get request to the route with an invalid token
      const res = await req.get('/api/orders/customer');

      // Expect a status code of 401 and an error message in the response body
      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthenticated');
    });
  });

  // Test for getting all orders for chef
  describe('GET /api/orders/chef', () => {
    // Test for success response
    it('should return a success response with an array of orders', async () => {
      const res = await req.get('/api/orders/chef').set('Cookie', chefToken);

      // Expect a status code of 200 and an array of orders in the response body
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]._id).toEqual(orderId);
    });

    // Test for failure response due to invalid token
    it('should return an error message when user is not authenticated', async () => {
      // Make a get request to the route with an invalid token
      const res = await req.get('/api/orders/chef');

      // Expect a status code of 401 and an error message in the response body
      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthenticated');
    });
  });

  // Test for updating an order
  describe('PUT /api/orders/:id', () => {
    // Test for success response
    it('should return a success response with the updated order', async () => {
      const res = await req
        .put(`/api/orders/${orderId}`)
        .set('Cookie', chefToken)
        .send({ status: 'in_progress' });

      // Expect a status code of 200 and the updated order in the response body
      expect(res.status).toBe(200);
      expect(res.body.data._id).toEqual(orderId);
      expect(res.body.data.status).toEqual('in_progress');
    });
  });

  // Test for deleting an order
  describe('DELETE /api/orders/:id', () => {
    // Test for success response
    it('should return a success response with a message', async () => {
      // Send delete request to the route with the order id
      const res = await req
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', customerToken);

      expect(res.status).toBe(204);
    });
  });
});
