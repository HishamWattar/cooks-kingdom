const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const { User } = require('../models/user');

// Mock the getUserID function
let customerToken;
let customerId;
const req = supertest(app);
const dishId = 'one';
const dishes = [
  {
    name: 'Spaghetti Carbonara',
    chefId: 'I1NiIsInR5cCI6Ikp',
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
  {
    name: 'Chicken Alfredo',
    chefId: 'bGciOiJIUzI1NiI',
    description:
      'Creamy pasta dish with grilled chicken, Alfredo sauce, and Parmesan cheese.',
    image: 'chicken-alfredo.jpg',
    ingredients: [
      'Fettuccine',
      'Chicken',
      'Heavy Cream',
      'Butter',
      'Garlic',
      'Parmesan Cheese',
    ],
    price: 14.99,
  },
  {
    name: 'Steak Au Poivre',
    chefId: 'jMjcxMjRiNWI2ZmU0Mzci',
    description:
      'Tender steak coated in crushed peppercorns, served with a creamy sauce.',
    image: 'steak-au-poivre.jpg',
    ingredients: ['Beef Steak', 'Peppercorns', 'Brandy', 'Heavy Cream'],
    price: 24.99,
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
  db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(customerUser);
  customerId = res.body.data._id;
  [customerToken] = res.headers['set-cookie'][0].split(';');
});

afterAll(async () => {
  await User.deleteMany({
    email: customerUser.email,
  });
});
afterAll(async () => db.closeDatabase());
describe('cart Endpoints', () => {
  describe('post /api/cart/', () => {
    test('Creates new cart', async () => {
      req.post('/api/cart').set('Cookie', customerToken).send(dishes[0]);

      expect(201);
    });
  });

  describe('delete /api/cart/', () => {
    it('Deletes cart', async () => {
      req.delete('/api/cart').set('Cookie', customerToken);

      expect(204);
    });
  });

  describe('post /api/cart/', () => {
    it('it adds cartitem to cart by dish Id', async () => {
      req.post(`/api/cart/${dishId}`).set('Cookie', customerToken);

      expect(201);
    });
  });

  describe('put /api/cart/', () => {
    it('it increase the quantity by 1 for the cartitem to cart by dish Id', async () => {
      req.put(`/api/cart/${dishId}`).set('Cookie', customerToken);

      expect(201);
    });
  });

  describe('get /api/cart/', () => {
    it('it gets cartitem by dish Id', async () => {
      req.get(`/api/cart/${dishId}`).set('Cookie', customerToken);

      expect(201);
    });
  });

  describe('delete /api/cart/', () => {
    it('it deletes cartitem by dish Id', async () => {
      req.delete(`/api/cart/${dishId}`).set('Cookie', customerToken);

      expect(201);
    });
  });
});
