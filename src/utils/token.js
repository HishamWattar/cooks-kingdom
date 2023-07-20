const jwt = require('jsonwebtoken');

const createToken = (user) => {
  const { _id } = user;

  const payload = {
    userId: _id,
  };

  return jwt.sign(payload, process.env.APP_SECRET, {
    expiresIn: '15d',
  });
};

// eslint-disable-next-line consistent-return
const saveTokenToCookie = (user, res) => {
  try {
    const token = createToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { saveTokenToCookie, createToken };
