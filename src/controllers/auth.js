const jwt = require('jsonwebtoken');

const savePayloadToToken = (req, res) => {
  try {
    const { _id } = req.user;

    const payload = {
      userId: _id,
    };

    const token = jwt.sign(payload, process.env.APP_SECRET, {
      expiresIn: '15d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'You have logged in successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  savePayloadToToken,
};
