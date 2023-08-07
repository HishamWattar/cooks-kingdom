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
  '/:dishId',
  createReview,
  validationHandler,
  isAuthenticated,
  isCustomer,
  reviewController.addReviewToDish
);
router.put(
  '/:dishId',
  updateReview,
  validationHandler,
  isAuthenticated,
  isCustomer,
  reviewController.updateReviewToDish
);
router.delete(
  '/:dishId',
  isAuthenticated,
  isCustomer,
  reviewController.deleteReviewFromDish
);

module.exports = router;
