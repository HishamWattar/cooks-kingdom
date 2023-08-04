const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const dishModel = require('../models/dish');
const { User } = require('../models/user');

const req = supertest(app);
let customerToken;
let customerId;
let fishId;
let allDishes;

const customerUser = {
  firstName: 'customerTest',
  lastName: 'customerTests',
  password: 'Customer%123Tests',
  name: 'customerUserTests',
  email: 'customerTests@example.com',
  role: 'customer',
};
const fish = {
  name: 'Fish and Chips test',
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
      rate: 5,
      description: 'Flavours were spot on, really tasty dish.',
    },
    {
      rate: 3,
      description: 'A bit low on spice for my liking.',
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

beforeAll(async () => {
  await db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(customerUser);
  [customerToken] = res.headers['set-cookie'][0].split(';');
  customerId = res.body.data._id;
  allDishes = await dishModel.insertMany([fish, chicken]);
  fishId = allDishes[0]._id;
});

afterAll(async () => {
  await dishModel.deleteMany({});
  await User.deleteMany({});
  await db.closeDatabase();
});

describe('POST /api/reviews/:id', () => {
  test('should return 404 if no rating provided', async () => {
    const res = await req
      .post(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        comment: 'Great dish',
      });
    expect(res.statusCode).toBe(422);
  });
  test('should return 201 if review created', async () => {
    const res = await req
      .post(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        customerId,
        rate: 5,
        comment: 'Great dish',
      });
    expect(res.statusCode).toBe(201);
  });
});
describe('PUT /api/reviews/:id', () => {
  test('should return 401 if no token provided', async () => {
    const res = await req.put(`/api/reviews/${fishId.toString()}`).send({
      rate: 5,
      comment: 'Great dish',
    });
    expect(res.statusCode).toBe(401);
  });
  test('should return 200 if review updated', async () => {
    const res = await req
      .put(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        rating: 5,
        comment: 'Great dish',
      });
    expect(res.statusCode).toBe(201);
  });
});
describe('DELETE /api/reviews/:id', () => {
  test('should return 401 if no token provided', async () => {
    const res = await req.delete(`/api/reviews/${fishId}`);
    expect(res.statusCode).toBe(401);
  });
  test('should return 204 if review deleted', async () => {
    const res = await req
      .delete(`/api/reviews/${fishId}`)
      .set('Cookie', customerToken);
    expect(res.statusCode).toBe(204);
  });
});
