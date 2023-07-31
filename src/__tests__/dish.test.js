// dishes.test.js
const supertest = require('supertest');
const dishModel = require('../models/dish');
const app = require('../app');
const db = require('../db/connection');
const { Chef } = require('../models/user');

const req = supertest(app);

let allDishes;
let fishId;
let chickenId;
let ownerChefToken;
let otherChefToken;

const ownerChef = {
  firstName: 'chef',
  lastName: 'chef',
  password: 'cheFf%123',
  name: 'chefName',
  isApproved: true,
  email: 'chef@example.com',
  role: 'chef',
};

const otherChef = {
  firstName: 'chef',
  lastName: 'chef',
  isApproved: true,
  password: 'cheFf%123',
  name: 'chefName',
  email: 'otherChef@example.com',
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

beforeAll(async () => {
  await db.connectToMongo();
  const _ownerChef = await Chef.create(ownerChef);
  const _otherChef = await Chef.create(otherChef);
  let res = await req.post('/api/auth/signin').send(ownerChef);
  [ownerChefToken] = res.headers['set-cookie'][0].split(';');
  fish.chefId = _ownerChef._id;
  chicken.chefId = _ownerChef._id;
  spaghetti.chefId = _ownerChef._id;
  res = await req.post('/api/auth/signin').send(otherChef);
  [otherChefToken] = res.headers['set-cookie'][0].split(';');

  // Create sample dishes for tests
  allDishes = await dishModel.insertMany([fish, chicken]);
  fishId = allDishes[0]._id;
  chickenId = allDishes[1]._id;
});

afterAll(async () => {
  // await db.clearDatabase();
  await dishModel.deleteMany({});
  await Chef.deleteMany({});

  await db.closeDatabase();
});

describe('GET /api/dishes', () => {
  it('Returns all dishes', async () => {
    const res = await req.get('/api/dishes');
    expect(res.body.data).toHaveLength(allDishes.length);
  });
});

describe('GET /api/dishes/filter', () => {
  it('Filters by single ingredient returns one item', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: 'Chicken thighs' });
    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by single ingredient returns multiple items', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: 'Potatoes' });
    expect(res.body.data).toHaveLength(2);
  });
  it('Filters by multiple ingredients returns one item', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: ['Cod fish', 'Vegetable oil'] });

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by multiple ingredients returns multiple items', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ ingredients: ['Tomato sauce', 'Yogurt marinade'] });

    expect(res.body.data).toHaveLength(2);
  });
  it('Filters by minimum price', async () => {
    const res = await req.get('/api/dishes/filter').query({ minPrice: 9 });

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by maximum price', async () => {
    const res = await req.get('/api/dishes/filter').query({ maxPrice: 20 });

    expect(res.body.data).toHaveLength(2);
  });
  it('Filters by maximum and minimum price', async () => {
    const res = await req
      .get('/api/dishes/filter')
      .query({ maxPrice: 20, minPrice: 6 });

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by rate', async () => {
    const res = await req.get('/api/dishes/filter').query({ rate: 5 });

    expect(res.body.data).toHaveLength(1);
  });
  it('Filters by name', async () => {
    const res = await req.get('/api/dishes/filter').query({ name: 'chi' });

    expect(res.body.data).toHaveLength(2);
  });
});

describe('POST /api/dishes', () => {
  it('Adds a new dish', async () => {
    const res = await req
      .post('/api/dishes')
      .send(spaghetti)
      .set('Cookie', ownerChefToken);
    expect(res.body.data.name).toBe('Spaghetti Bolognese');
  });
  it("Doesn't add a new dish with missing details", async () => {
    const res = await req
      .post('/api/dishes')
      .send({ name: 'hello' })
      .set('Cookie', ownerChefToken);
    expect(res.status).toBe(422);
  });
});

describe('PUT /api/dishes/:id', () => {
  it('Updates a dish', async () => {
    const res = await req
      .put(`/api/dishes/${fishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', ownerChefToken);
    expect(res.body.data.name).toBe('Not fish');
  });
  it("Doesn't update others' dishes", async () => {
    const res = await req
      .put(`/api/dishes/${fishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', otherChefToken);
    expect(res.status).toBe(403);
  });
  it("Doesn't update non-existing dishes", async () => {
    const res = await req
      .put(`/api/dishes/0101010101`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', ownerChefToken);
    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/dishes/:id', () => {
  it('Deletes a dish', async () => {
    const res = await req
      .delete(`/api/dishes/${fishId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', ownerChefToken);
    expect(res.status).toBe(204);
  });
  it("Doesn't delete others' dishes", async () => {
    const res = await req
      .delete(`/api/dishes/${chickenId.toString()}`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', otherChefToken);
    expect(res.status).toBe(403);
  });
  it("Doesn't delete non-existing dishes", async () => {
    const res = await req
      .delete(`/api/dishes/0101010101`)
      .send({
        name: 'Not fish',
      })
      .set('Cookie', ownerChefToken);
    expect(res.status).toBe(422);
  });
});
