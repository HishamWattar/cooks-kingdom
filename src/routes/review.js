const express = require('express');

const router = express.Router();

const { isCustomer } = require('../middlewares/auth');
const { isAuthenticated } = require('../middlewares/auth');
const reviewController = require('../controllers/review');

router.post(
  '/:id',
  isAuthenticated,
  isCustomer,
  reviewController.addReviewToDish
);
router.put(
  '/:id',
  isAuthenticated,
  isCustomer,
  reviewController.updateReviewToDish
);
router.delete(
  '/:id',
  isAuthenticated,
  isCustomer,
  reviewController.deleteReviewFromDish
);
// eslint-disable-next-line no-undef
module.exports = router;
