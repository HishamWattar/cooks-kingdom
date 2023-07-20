/* eslint-disable prettier/prettier */
const dishModel = require('../models/dish');

const getAllDishes = async (req, res) => {
  try {
    const Dishes = await dishModel.find();
    res.json(Dishes);
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

const getDishById = async (req, res) => {
  const { id } = req.params;
  try {
    // Find by ID query
    const dish = await dishModel.findById(id);
    if (!dish) {
      res
        .status(422)
        .json({ message: "the dish you are looking for wasn't found" });
    } else {
      res.json(dish);
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};
const filterDishes = async (req, res) => {
  try {
    const { maxPrice, minPrice, rate } = req.query;
    let { ingredients } = req.query;
    if (!Array.isArray(ingredients)) {
      ingredients = ingredients ? [ingredients] : [];
    }
    const filters = {};
    if (ingredients.length > 0) filters.ingredients = { $all: ingredients };
    if (maxPrice)
      filters.price = {
        $lt: Number(maxPrice) || Infinity,
        $gt: Number(minPrice) || 0,
      };
    if (minPrice) filters.minPrice = { $gte: Number(minPrice) };
    if (rate) filters['reviews.rate'] = { $gte: Number(rate) };

    const filteredDishes = await dishModel.find(filters);
    res.json(filteredDishes);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const addDish = async (req, res) => {
  const { name, chefId, description, image, ingredients, price } = req.body;
  const dishData = { name, chefId, description, image, ingredients, price };
  try {
    const newDish = await dishModel.create(dishData);
    res.status(201).json(newDish);
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};
const updateDish = async (req, res) => {
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
      res
        .status(422)
        .json({ message: "the dish you are trying to update wasn't found" });
    } else {
      res.json(updatedDish);
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};
const deleteDish = async (req, res) => {
  const { id } = req.params;
  try {
    const dish = await dishModel.findByIdAndDelete(id);
    if (!dish) {
      res
        .status(422)
        .json({ message: "the dish you are trying to delete wasn't found" });
    } else {
      res.status(204).send();
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
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
