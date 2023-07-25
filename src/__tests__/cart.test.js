const supertest = require('supertest');
const app = require('../app');

// Mock the getUserID function
const req = supertest(app);
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGJlN2M4ZDljMjcxMjRiNWI2ZmU0MzciLCJpYXQiOjE2OTAyMDUzMjUsImV4cCI6MTY5MTUwMTMyNX0.9GPQYXtWvI5OFYVowYrqOR8oidzkiaPesxdpiU8IsFo';
let cartId;
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

describe('Auth Endpoints', () => {
  describe('post /api/cart/', () => {
    it('Creates new cart', async () => {
      req
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send(dishes[0])
        .expect('Content-Type', /json/)
        .expect(201, (err, res) => {
          cartId = res.body._id;
        });
    });
  });

  describe('delete /api/cart/', () => {
    it('Deletes cart', async () => {
      req
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(204);
    });
  });

  describe('post /api/cart/', () => {
    it('it adds cartitem to cart by dish Id', async () => {
      req
        .post(`/api/cart/${dishId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(201);
    });
  });

  describe('put /api/cart/', () => {
    it('it increase the quantity by 1 for the cartitem to cart by dish Id', async () => {
      req
        .put(`/api/cart/${dishId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(201);
    });
  });

  describe('get /api/cart/', () => {
    it('it gets cartitem by dish Id', async () => {
      req
        .get(`/api/cart/${dishId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(201);
    });
  });

  describe('delete /api/cart/', () => {
    it('it deletes cartitem by dish Id', async () => {
      req
        .delete(`/api/cart/${dishId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(201);
    });
  });
});
