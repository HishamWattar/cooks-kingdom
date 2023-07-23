// dishes.test.js
const supertest = require('supertest');
const dishModel = require('../models/dish');
const app = require('../app');
const db = require('../db/connection');
const dish = require('../models/dish');

const req = supertest(app);

let allDishes;
let dishId;
let token;

const chef = {
  firstName: 'chef',
  lastName: 'chef',
  password: 'cheFf%123',
  name: 'chefName',
  email: 'chef@example.com',
  role: 'chef',
};

const spaghetti = {
  name: 'Spaghetti Bolognese',
  price: 12.5,
  ingredients: ['Tomato sauce', 'Minced beef', 'Pasta'],
  reviews: [
    {
      rate: 5,
      description: 'Absolutely delicious, perfect spaghetti bolognese!',
    },
    {
      rate: 4,
      description: 'Great Italian classic, will definitely order again.',
    },
  ],
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

// beforeAll(async () => {
//   await db.connectToMongo();
//   const res = await req.post('/api/auth/signup').send(chef);
//   [token] = res.headers['set-cookie'][0].split(';');
// });

beforeAll(async () => {
  await db.connectToMongo();
  const res = await req.post('/api/auth/signup').send(chef);
  [token] = res.headers['set-cookie'][0].split(';');

  // Create sample dishes for tests
  allDishes = await dishModel.insertMany([fish, chicken]);
  dishId = allDishes[0]._id;
});

afterAll(async () => {
  await db.clearDatabase();
  await db.closeDatabase();
});

describe('GET /api/dishes', () => {
  it('Returns all dishes', async () => {
    const res = await req.get('/api/dishes').set('Cookie', token);
    expect(res.body.data).toHaveLength(allDishes.length);
  });
});

describe('GET /api/dishes/filter', () => {
  it('Filters by single ingredient returns one item', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: 'Chicken thighs' })
      .set('Cookie', token);
    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by single ingredient returns multiple items', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: 'Potatoes' })
      .set('Cookie', token);
    expect(res.body.data).toHaveLength(2);
  });
  it('Filters by multiple ingredients returns one item', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: ['Cod fish', 'Vegetable oil'] })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by multiple ingredients returns multiple items', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: ['Tomato sauce', 'Yogurt marinade'] })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(2);
  });
  it('Filters by minimum price', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ minPrice: 9 })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by maximum price', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ maxPrice: 20 })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(2);
  });
  it('Filters by maximum and minimum price', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ maxPrice: 20, minPrice: 6 })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by rate', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ rate: 5 })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by name', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ name: 'chi' })
      .set('Cookie', token);

    expect(res.body.data).toHaveLength(2);
  });
});

describe('POST /api/dishes', () => {
  it('Adds a new dish', async () => {
    const res = await req
      .post('/api/dishes')
      .send(spaghetti)
      .set('Cookie', token);
    expect(res.body.data.name).toBe('Spaghetti Bolognese');
  });
  it("Doesn't add a new dish with missing details", async () => {
    const res = await req
      .post('/api/dishes')
      .send({ name: 'hello' })
      .set('Cookie', token);
    expect(res.status).toBe(422);
  });
});

describe('PUT /api/dishes/:id', () => {
  it('Updates a dish', async () => {
    const res = await req
      .put(`/api/dishes/${dishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', token);
    expect(res.body.data.name).toBe('Not fish');
  });
  it("Doesn't update others' dishes", async () => {
    const res = await req
      .put(`/api/dishes/${dishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', token);
    expect(res.body.data.name).toBe('Not fish');
  });
  it("Doesn't update non-existing dishes", async () => {
    const res = await req
      .put(`/api/dishes/${dishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', token);
    expect(res.body.data.name).toBe(422);
  });
});

describe('DELETE /api/dishes/:id', () => {
  it('Deletes a dish', async () => {
    const res = await req
      .delete(`/api/dishes/${dishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', token);
    expect(res.status).toBe(204);
  });
  it("Doesn't delete others' dishes", async () => {
    const res = await req
      .delete(`/api/dishes/${dishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', token);
    expect(res.status).toBe(204);
  });
  it("Doesn't delete non-existing dishes", async () => {
    const res = await req
      .delete(`/api/dishes/${dishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', token);
    expect(res.status).toBe(404);
  });
});
