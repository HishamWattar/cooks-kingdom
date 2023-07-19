const mongoose = require('mongoose');

const url = process.env.DB_URL;

const connectToMongo = () => {
  mongoose.connect(url, { useNewUrlParser: true });

  const db = mongoose.connection;

  db.once('open', () => {
    // eslint-disable-next-line no-console
    console.log('Database connected: ', url);
  });

  db.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Database connection error: ', err);
  });
};

const closeDatabase = async (drop = false) => {
  // eslint-disable-next-line no-unused-expressions
  drop && (await mongoose.connection.dropDatabase());
  await mongoose.disconnect();
  await mongoose.connection.close();
};

const clearDatabase = async () => {
  const { collections } = mongoose.connection;
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in collections) {
    // eslint-disable-next-line no-await-in-loop
    await collections[key].deleteMany();
  }
};

module.exports = {
  connectToMongo,
  closeDatabase,
  clearDatabase,
};
