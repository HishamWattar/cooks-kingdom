const dishModel = require('../models/dish');

const CustomError = require('../utils/customError');

const addReviewToDish = async (req, res, next) => {
  const { dishId } = req.params;
  const { rating, comment } = req.body;
  const customerId = req.user.id;
  const reviewData = { customerId, rating, comment };
  try {
    const dish = await dishModel.findOne({ id: dishId });
    if (!dish) {
      return next(new CustomError('Dish not found', 404));
    }
    dish.reviews.push(reviewData);
    await dish.save();
    return res.status(201).json({
      success: true,
      data: dish,
    });
  } catch (err) {
    console.log(err.message);
    return next(new CustomError(err.message, 422));
  }
};
const updateReviewToDish = async (req, res, next) => {
  const { dishId } = req.params;
  const { rating, comment } = req.body;
  try {
    const dish = await dishModel.findOne({ id: dishId });
    if (!dish) {
      return next(new CustomError('Dish not found', 404));
    }
    const reviewUpdate = dishModel.findOne({
      reviews: { $elemMatch: { id: req.user.id } },
    });
    if (!reviewUpdate) {
      return next(new CustomError("You don't have reviews", 404));
    }
    reviewUpdate.rating = rating;
    reviewUpdate.comment = comment;
    await dish.save();
    return res.status(201).json({
      success: true,
      data: dish,
    });
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};
const deleteReviewFromDish = async (req, res, next) => {
  const { dishId } = req.params;
  try {
    const dish = await dishModel.findOne({ id: dishId });

    if (!dish) {
      return next(new CustomError('Dish not found', 404));
    }
    const reviewDelete = dishModel.findOne({
      reviews: { $elemMatch: { id: req.user.id } },
    });
    if (!reviewDelete) {
      return next(new CustomError("You don't have reviews", 404));
    }
    dish.reviews.pull(reviewDelete);
    await dish.save();
    return res.status(204).json({
      success: true,
      data: dish,
    });
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};

module.exports = {
  addReviewToDish,
  updateReviewToDish,
  deleteReviewFromDish,
};
