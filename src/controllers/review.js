const Dish = require('./models/dish'); 
const jwt = require('jsonwebtoken');


exports.postReviewByDishId = async (req, res) => {
    try {
      const id = req.params.id;
      const review = {
          customerId: getUserID(req),
          rate: req.body.rate,
          description: req.body.description,
      };
  
      const dish = await Dish.findById(id);
  
      dish.reviews.push(review);
      await dish.save();
  
      res.status(201).json(dish);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

exports.putReviewById = async (req, res) => {
    try {
      const id  = req.params.id;
      const reviewData = req.body;
  
      const dish = await Dish.findOne({ 'reviews._id': id });
      const reviewIndex = dish.reviews.findIndex((review) => review._id.toString() === id)
  
      // Update the review data
      dish.reviews[reviewIndex].rate = reviewData.rate;
      dish.reviews[reviewIndex].description = reviewData.description;
  
      // Save the updated dish with the modified review
      await dish.save();
  
      res.json(dish);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

exports.deleteReviewById = async (req, res) => {
    try {
      const  id  = req.params.id;
  
      const dish = await Dish.findOne({ 'reviews._id': id });
      const reviewIndex = dish.reviews.findIndex((review) => review._id.toString() === id)
      dish.reviews.splice(reviewIndex, 1);
      await dish.save();
  
      res.json(dish);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  function getUserID(req) {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    return decoded.userId;
}