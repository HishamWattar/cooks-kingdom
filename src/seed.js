// dishes.test.js
require('dotenv').config();
const Dish = require('./models/dish');
const db = require('./db/connection');

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

const seed = async () => {
  db.connectToMongo();
  try {
    await Dish.deleteMany(); // Clear existing data from the Dish collection
    await Dish.create(spaghetti);
    await Dish.create(fish);
    await Dish.create(chicken);
    console.log('Database seeding completed.');
    await db.closeDatabase();
  } catch (err) {
    console.error('Error seeding the database:', err);
    await db.closeDatabase();
  }
};

seed();
