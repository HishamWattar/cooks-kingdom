const express = require('express');

const router = express.Router();

const { isCustomer } = require('../middlewares/auth');
const { isAuthenticated } = require('../middlewares/auth');
const reviewController = require('../controllers/review');
const {
  validationHandler,
  createReview,
  updateReview,
} = require('../middlewares/validation');

router.post(
  '/:id',
  createReview,
  validationHandler,
  isAuthenticated,
  isCustomer,
  reviewController.addReviewToDish
);
router.put(
  '/:id',
  updateReview,
  validationHandler,
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

module.exports = router;
