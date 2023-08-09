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
  isAuthenticated,
  isCustomer,
  createReview,
  validationHandler,
  reviewController.addReviewToDish
);
router.put(
  '/:dishId',
  isAuthenticated,
  isCustomer,
  updateReview,
  validationHandler,
  reviewController.updateReviewToDish
);
router.delete(
  '/:dishId',
  isAuthenticated,
  isCustomer,
  reviewController.deleteReviewFromDish
);

module.exports = router;
