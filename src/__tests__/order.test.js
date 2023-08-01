const supertest = require('supertest');
const app = require('../app');
const { User, Chef } = require('../models/user');
const dishModel = require('../models/dish');
const orderModel = require('../models/order');

const req = supertest(app);
const db = require('../db/connection');

let customerToken;
let customerId;
let orderId;
let chefToken;
let allDishes;
let fishId;
let chickenId;
let orderExp;

const fakedUserId = '123432334334445563122154';
const fakeOrderId = '3244279';

const customerUser = {
  firstName: 'customerTests',
  lastName: 'customerTests',
  password: 'Customer%123Tests',
  name: 'customerUserTests',
  email: 'customerTests@example.com',
  role: 'customer',
};
const chefUser = {
  firstName: 'cheftest',
  lastName: 'cheftest',
  password: 'Chef%123test',
  name: 'chefUsertest',
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
  allDishes = await dishModel.insertMany([fish, chicken]);
  orderExp = await orderModel.create(orderExample);
  fishId = allDishes[0]._id;
  chickenId = allDishes[1]._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await dishModel.deleteMany({});
  await Chef.deleteMany({});
  await db.closeDatabase();
});

describe('GET /api/orders/:customerId', () => {
  test('should return 401 if user is not logged in', async () => {
    const res = await req.get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  test('should return all orders with the same customerId', async () => {
    const res = await req
      .get(`/api/orders/${customerId}`)
      .set('Cookie', customerToken)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/orders/:orderId', () => {
  test('should return 401 if user is not logged in', async () => {
    const res = await req.get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  test('should return an order based on orderId', async () => {
    const createOrderRes = await req
      .post('/api/orders')
      .set('Cookie', customerToken)
      .send({
        customerId,
        dishId: fishId,
        quantity: 2,
      });

    orderId = createOrderRes.body._id;

    const res = await req
      .get(`/api/orders/${orderId}`)
      .set('Cookie', [customerToken])
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body._id).toBe(orderId);
  });
});

describe('POST /api/orders', () => {
  test('should return 401 if user is not logged in', async () => {
    const res = await req.post('/api/orders').send({
      dishId: fishId,
      quantity: 2,
      orderQuantity: 1,
    });

    expect(res.status).toBe(401);
  });

  test('should create a new order', async () => {
    const res = await req
      .post('/api/orders/')
      .set('Cookie', customerToken)
      .send({
        customerId,
        dishId: fishId,
        quantity: 2,
        orderQuantity: 1,
      });

    expect(res.status).toBe(201);
  });

  // test('should return 404 if invalid dishId is provided', async () => {
  //   const res = await req
  //     .post('/api/orders')
  //     .set('Cookie', customerToken)
  //     .send({
  //       customerId,
  //       dishId: 'invalidDishId',
  //       quantity: 2,
  //       orderQuantity: 1,
  //     });

  //   expect(res.status).toBe(404);
  //   // expect(res.body).toHaveProperty('message');
  // });
});

describe('POST /api/orders/:orderId/orderItems', () => {
  test('should return 401 if user is not logged in', async () => {
    const res = await req.post(`/api/orders/orderItems/${orderId}`).send({
      dishId: chickenId,
      quantity: 1,
    });

    expect(res.status).toBe(401);
  });

  test('should add a new order item to an existing order', async () => {
    const res = await req
      .post(`/api/orders/orderItems/${orderExp._id}`)
      .set('Cookie', customerToken)
      .send({
        customerId,
        dishId: fishId.toString(),
        quantity: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
  });

  test('should return 404 if invalid orderId is provided', async () => {
    const res = await req
      .post(`/api/orders/orderItems/${fakedUserId}`)
      .set('Cookie', customerToken)
      .send({
        customerId,
        dishId: fishId,
        quantity: 1,
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});

describe('PUT /api/orders/:orderId', () => {
  test('should return 401 if user is not logged in', async () => {
    const res = await req.put(`/api/orders/${orderId}`).send({
      status: 'completed',
    });

    expect(res.status).toBe(401);
  });

  test('should update an order by ID', async () => {
    const res = await req
      .put(`/api/orders/${orderExp._id}`)
      .set('Cookie', chefToken)
      .send({
        status: 'completed',
      });

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.status).toBe('completed');
  });

  test('should return 403 if invalid orderId is provided', async () => {
    const res = await req
      .put(`/api/orders/${fakeOrderId}`)
      .set('Cookie', chefToken)
      .send({
        status: 'completed',
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
});

describe('DELETE /api/orders/:orderId', () => {
  test('should return 401 if user is not logged in', async () => {
    const res = await req.delete(`/api/orders/${orderId}`);
    expect(res.status).toBe(401);
  });

  test('should delete an order by ID', async () => {
    const res = await req
      .delete(`/api/orders/${orderId}`)
      .set('Cookie', customerToken);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
