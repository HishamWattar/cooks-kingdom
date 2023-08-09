const Dish = require('../models/dish');
const CustomError = require('../utils/customError');
const uploadImage = require('../services/gcs');

const getAllDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find();
    return res.json({ data: dishes });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const getDishById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const dish = await Dish.findById(id);

    if (!dish) {
      return next(new CustomError('Dish not found.', 404));
    }

    return res.json({ data: dish });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const filterDishes = async (req, res, next) => {
  try {
    const { name, maxPrice, minPrice, minRate, maxRate, ingredients } =
      req.query;

    // console.log(req.query);

    const pipeline = [];

    if (minPrice)
      pipeline.push({ $match: { price: { $gte: parseInt(minPrice, 10) } } });
    if (maxPrice)
      pipeline.push({ $match: { price: { $lte: parseInt(maxPrice, 10) } } });
    if (name)
      pipeline.push({ $match: { name: { $regex: new RegExp(name, 'i') } } });
    if (ingredients)
      pipeline.push({
        $match: { ingredients: { $all: ingredients.split(',') } },
      });

    if (minRate || maxRate) {
      const matchStage = {};
      if (minRate) matchStage.$gte = parseFloat(minRate);
      if (maxRate) matchStage.$lte = parseFloat(maxRate);

      pipeline.push({
        $addFields: {
          avgRating: { $avg: '$reviews.rate' },
        },
      });
      pipeline.push({ $match: { avgRating: matchStage } });
    }

    pipeline.push({ $project: { __v: 0 } }); // Exclude the __v field

    const filteredDishes = await Dish.aggregate(pipeline);

    return res.json({ data: filteredDishes });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

const addDish = async (req, res, next) => {
  const { name, description, price, ingredients } = req.body;
  const dishData = {
    name,
    chefId: req.user.id,
    description,
    ingredients,
    price,
  };

  try {
    const newDish = await Dish.create(dishData);
    return res.status(201).json({ data: newDish });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const updateDish = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, ingredients } = req.body;

  try {
    const updatedDish = await Dish.findOneAndUpdate(
      { _id: id, chefId: req.user.id },
      {
        name,
        description,
        ingredients,
        price,
      },
      { returnOriginal: false }
    );

    if (!updatedDish) {
      return next(new CustomError('Dish not found.', 404));
    }

    return res.json({ data: updatedDish });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const deleteDish = async (req, res, next) => {
  const { id } = req.params;

  try {
    const isDeleted = await Dish.findOneAndDelete({
      _id: id,
      chefId: req.user.id,
    });

    if (!isDeleted) {
      return next(new CustomError('Dish not found.', 404));
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const uploadDishImage = async (req, res, next) => {
  try {
    if (req.file) {
      const { id } = req.params;

      const dish = await Dish.findOne({ _id: id, chefId: req.user.id });
      if (!dish) {
        return next(new CustomError('Dish not found.', 404));
      }

      dish.image = await uploadImage(req.file);
      await dish.save();

      return res.json({ message: 'Dish image uploaded successfully.' });
    }
    return next(new CustomError('Please provide a dish image.', 400));
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};

module.exports = {
  getAllDishes,
  getDishById,
  filterDishes,
  addDish,
  updateDish,
  deleteDish,
  uploadDishImage,
};
