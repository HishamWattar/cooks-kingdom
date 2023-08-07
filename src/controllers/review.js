const Dish = require('../models/dish');

const CustomError = require('../utils/customError');

const addReviewToDish = async (req, res, next) => {
  const { id } = req.params;
  const { rate, comment } = req.body;
  const customerId = req.user.id;
  const reviewData = { customerId, rate, comment };
  try {
    const dish = await Dish.findById(id);

    if (!dish) {
      return next(new CustomError('Dish not found.', 404));
    }

    const existingReview = await dish.reviews.find(
      (review) => review.customerId.toString() === customerId
    );

    if (existingReview) {
      return next(new CustomError('You already reviewed this dish.', 400));
    }

    dish.reviews.push(reviewData);
    await dish.save();

    return res.status(201).json({
      data: dish,
    });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const updateReviewToDish = async (req, res, next) => {
  const { id } = req.params;
  const { rate, comment } = req.body;
  try {
    const dish = await Dish.findById(id);

    if (!dish) {
      return next(new CustomError('Dish not found', 404));
    }

    const updatedDishReview = await Dish.findOneAndUpdate(
      {
        _id: id,
        'reviews.customerId': req.user.id,
      },
      {
        $set: {
          'reviews.$.rate': rate,
          'reviews.$.comment': comment,
        },
      },
      { new: true }
    );

    if (!updatedDishReview) {
      return next(new CustomError("You don't have reviews", 404));
    }

    return res.json({
      data: updatedDishReview,
    });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const deleteReviewFromDish = async (req, res, next) => {
  const { id } = req.params;
  try {
    const dish = await Dish.findById(id);

    if (!dish) {
      return next(new CustomError('Dish not found', 404));
    }

    const deletedDishReview = await Dish.findOneAndUpdate(
      {
        _id: id,
        'reviews.customerId': req.user.id,
      },
      {
        $pull: {
          reviews: { customerId: req.user.id },
        },
      },
      { new: true }
    );

    if (!deletedDishReview) {
      return next(new CustomError("You don't have reviews", 404));
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

module.exports = {
  addReviewToDish,
  updateReviewToDish,
  deleteReviewFromDish,
};
