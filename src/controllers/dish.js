/* eslint-disable prettier/prettier */
const dishModel = require('../models/dish');
const CustomError = require('../utils/customError');

const getAllDishes = async (req, res, next) => {
  try {
    const Dishes = await dishModel.find();
    return res.json({ data: Dishes });
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};

const getDishById = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Find by ID query
    const dish = await dishModel.findById(id);
    if (!dish) {
      return next(
        new CustomError("the dish you are looking for wasn't found", 422)
      );
    }
    return res.json({ data: dish });
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};
const filterDishes = async (req, res, next) => {
  try {
    const { name, maxPrice, minPrice, rate } = req.query;

    let { ingredients } = req.query;
    if (!Array.isArray(ingredients)) {
      ingredients = ingredients ? ingredients.split(',') : [];
    }

    const filters = {};
    if (ingredients.length > 0) filters.ingredients = { $all: ingredients };
    filters.price = {
      $lte: maxPrice ? Number(maxPrice) : Infinity,
      $gte: minPrice ? Number(minPrice) : 0,
    };
    if (rate) filters['reviews.rate'] = { $gte: Number(rate) };
    if (name) filters.name = { $regex: new RegExp(name, 'i') };

    const filteredDishes = await dishModel.find(filters);

    return res.json({ data: filteredDishes });
  } catch (err) {
    return next(new CustomError(err.message, 500));
  }
};
const addDish = async (req, res, next) => {
  const { name, chefId, description, image, price } = req.body;
  let { ingredients } = req.body;
  if (!Array.isArray(ingredients)) {
    ingredients = ingredients.split(',') || [];
  }
  const dishData = { name, chefId, description, image, ingredients, price };
  try {
    const newDish = await dishModel.create(dishData);
    return res.status(201).json({ data: newDish });
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};
const updateDish = async (req, res, next) => {
  const { id } = req.params;
  const { name, chefId, ingredients, price, reviews, image } = req.body;
  try {
    const updatedDish = await dishModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        chefId,
        ingredients,
        image,
        price,
        reviews,
      },
      { returnOriginal: false }
    );
    if (!updatedDish) {
      return next(
        new CustomError("the dish you are trying to update wasn't found", 422)
      );
    }
    return res.json({ data: updatedDish });
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};
const deleteDish = async (req, res, next) => {
  const { id } = req.params;
  try {
    const dish = await dishModel.findByIdAndDelete(id);
    if (!dish) {
      return next(
        new CustomError("the dish you are trying to delete wasn't found", 404)
      );
    }
    return res.status(204).send();
  } catch (err) {
    return next(new CustomError(err.message, 422));
  }
};
module.exports = {
  getAllDishes,
  getDishById,
  filterDishes,
  addDish,
  updateDish,
  deleteDish,
};
