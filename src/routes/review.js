const express = require('express');
const router = express.Router();
const reviewController = require('./controllers/review'); 


router.post('/Dish/:id',  reviewController.postReviewByDishId);
router.put('/Dish/:id', reviewController.putReviewById);
router.delete('/Dish/:id', reviewController.deleteReviewById);


module.exports = router;
