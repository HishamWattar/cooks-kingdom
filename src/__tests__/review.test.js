const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const Dish = require('../models/dish');
// const { User } = require('../models/user');
const req = supertest(app);

jest.mock('../utils/email');
jest.setTimeout(10000);

let customerToken;
let fishId;

const customerUser = {
  firstName: 'customerTest',
  lastName: 'customerTests',
  password: 'Customer%123Tests',
  username: 'customerUserTests',
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
};

beforeAll(async () => {
  await db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(customerUser);
  [customerToken] = res.headers['set-cookie'][0].split(';');
  const dish = await Dish.create(fish);
  fishId = dish._id;
});

afterAll(async () => {
  // await Dish.deleteMany({});
  // await User.deleteMany({});
  await db.clearDatabase();
  await db.closeDatabase();
});

describe('POST /api/reviews/:dishId', () => {
  it('should return 422 if no rate provided', async () => {
    const res = await req
      .post(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        comment: 'Great dish',
      });
    expect(res.statusCode).toBe(422);
  });

  it('should return 201 if review created', async () => {
    const res = await req
      .post(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        rate: 5,
        comment: 'Great dish',
      });

    expect(res.statusCode).toBe(201);
  });

  it('should return 400 if customer already reviewed the dish', async () => {
    const res = await req
      .post(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        rate: 5,
        comment: 'Great dish',
      });
    expect(res.statusCode).toBe(400);
  });
});
describe('PUT /api/reviews/:dishId', () => {
  it('should return 401 if no token provided', async () => {
    const res = await req.put(`/api/reviews/${fishId.toString()}`).send({
      rate: 5,
      comment: 'Great dish',
    });
    expect(res.statusCode).toBe(401);
  });
  it('should return 200 if review updated', async () => {
    const res = await req
      .put(`/api/reviews/${fishId.toString()}`)
      .set('Cookie', customerToken)
      .send({
        rating: 5,
        comment: 'Great dish',
      });
    expect(res.statusCode).toBe(200);
  });
});
describe('DELETE /api/reviews/:dishId', () => {
  it('should return 401 if no token provided', async () => {
    const res = await req.delete(`/api/reviews/${fishId}`);
    expect(res.statusCode).toBe(401);
  });
  it('should return 204 if review deleted', async () => {
    const res = await req
      .delete(`/api/reviews/${fishId}`)
      .set('Cookie', customerToken);
    expect(res.statusCode).toBe(204);
  });
});
