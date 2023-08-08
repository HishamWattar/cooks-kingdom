const supertest = require('supertest');
const app = require('../app');
const { User, Chef } = require('../models/user');
const Dish = require('../models/dish');
const Order = require('../models/order');
const cartModel = require('../models/cart');

const req = supertest(app);
const db = require('../db/connection');

let customerToken;
let customerId;
let orderId;
let chefToken;
let allDishes;
let fishId;
// let chickenId;
// let orderExp;
// let cart;

const customerUser = {
  firstName: 'customerTests',
  lastName: 'customerTests',
  password: 'Customer%123Tests',
  username: 'customerUserTests',
  email: 'customerTests@example.com',
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
  reviews: [
    {
      rate: 4,
      description: 'Perfect portion sizes and crispy batter.',
    },
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
  reviews: [
    {
      rate: 5,
      description: 'Flavours were spot on, really tasty dish.',
    },
    {
      rate: 3,
      description: 'A bit low on spice for my liking.',
    },
  ],
};
const cartItemData = {
  quantity: 2,
};

beforeAll(async () => {
  await db.connectToMongo();
  let res = await req.post('/api/auth/signup').send(customerUser);
  customerId = res.body.data._id;
  [customerToken] = res.headers['set-cookie'][0].split(';');
  const _chefUser = await Chef.create(chefUser);
  res = await req.post('/api/auth/signin').send(chefUser);
  [chefToken] = res.headers['set-cookie'][0].split(';');
  const chefID = _chefUser._id;
  fish.chefId = _chefUser._id;
  chicken.chefId = _chefUser._id;
  const orderExample = {
    customerId,
    chefID,
    totalPrice: 50.0,
    status: 'pending',
    orderItems: [
      {
        fishId,
        quantity: 2,
        price: 25.0,
      },
    ],
    quantity: 2,
  };
  const cartItems = [
    {
      dishId: fishId,
      quantity: 2,
    },
  ];
  const cartData = {
    customerId,
    cartItems,
  };
  allDishes = await Dish.insertMany([fish, chicken]);
  await Order.create(orderExample);
  await cartModel.create(cartData);
  fishId = allDishes[0]._id;
  //   chickenId = allDishes[1]._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Dish.deleteMany({});
  await cartModel.deleteMany({});
  await Chef.deleteMany({});
  await db.closeDatabase();
});

// Test suite for order routes
describe('Order Routes', () => {
  // Test for getting all orders for customer
  describe('GET /api/order/customer', () => {
    // Test for success response
    it('should return a success response with an array of orders', async () => {
      // Create an order for the customer
      const orderResponse = await req
        .post('/api/orders')
        .set('Cookie', customerToken)
        .send({ customerId, cartItems: [cartItemData] });
      orderId = orderResponse.body.orders[0]._id;

      // Make a get request to the route
      const response = await req
        .get('/api/orders/customer')
        .set('Cookie', customerToken);

      // Expect a status code of 200 and an array of orders in the response body
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    // Test for failure response due to invalid token
    it('should return a failure response with an error message', async () => {
      // Make a get request to the route with an invalid token
      const response = await req
        .get('/api/orders/customer')
        .set('Cookie', 'Bearer invalidtoken');

      // Expect a status code of 401 and an error message in the response body
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthenticated');
    });
  });

  // Test for getting all orders for chef
  describe('GET /api/v1/order/chef', () => {
    // Test for success response
    it('should return a success response with an array of orders', async () => {
      const response = await req
        .get('/api/orders/chef')
        .set('Cookie', chefToken);

      // Expect a status code of 200 and an array of orders in the response body
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]._id).toEqual(orderId);
    });

    // Test for failure response due to invalid token
    it('should return a failure response with an error message', async () => {
      // Make a get request to the route with an invalid token
      const response = await req
        .get('/api/orders/chef')
        .set('Cookie', 'Bearer invalidtoken');

      // Expect a status code of 401 and an error message in the response body
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthenticated');
    });
  });

  describe('POST /api/orders', () => {
    // Test for success response
    it('should return a success response with an array of orders', async () => {
      // Make a post request to the route with the customer id and cart items
      const response = await req
        .post('/api/orders')
        .set('Cookie', customerToken)
        .send({ customerId, cartItems: [cartItemData] });

      // Expect a status code of 201 and an array of orders in the response body
      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders[0].customerId).toEqual(customerId);
      expect(response.body.orders[0].totalPrice).toEqual(10);
      expect(response.body.orders[0].status).toEqual('pending');
      expect(Array.isArray(response.body.orders[0].orderItems)).toBe(true);
      expect(response.body.orders[0].orderItems[0].price).toEqual(5);
      expect(response.body.orders[0].orderItems[0].quantity).toEqual(2);
    });

    // Test for failure response due to invalid input
    it('should return a failure response with an error message', async () => {
      // Make a post request to the route with an invalid customer id
      const response = await req
        .post('/api/orders')
        .send({ customerId: 'invalidid', cartItems: [cartItemData] });

      expect(response.status).toBe(401);
    });
  });

  // Test for updating an order
  describe('PUT /api/v1/order/:id', () => {
    // Test for success response
    it('should return a success response with the updated order', async () => {
      const response = await req
        .put(`/api/orders/${orderId}`)
        .set('Cookie', chefToken)
        .send({ status: 'in_progress' });

      // Expect a status code of 200 and the updated order in the response body
      expect(response.status).toBe(200);
      expect(response.body.data._id).toEqual(orderId);
      expect(response.body.data.status).toEqual('in_progress');
    });
  });

  // Test for deleting an order
  describe('DELETE /api/orders/:id', () => {
    // Test for success response
    it('should return a success response with a message', async () => {
      // Make a delete request to the route with the order id
      const response = await req
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', customerToken);

      expect(response.status).toBe(204);
    });
  });
});
