/* eslint-disable prettier/prettier */
const express = require('express');

const router = express.Router();

const dishController = require('../controllers/dish');
const { isAuthenticated } = require('../middlewares/auth');
const { isChef } = require('../middlewares/auth');

router.get('/', dishController.getAllDishes);
router.get('/filter', dishController.filterDishes);
router.get('/:id', dishController.getDishById);

router.post('/', isAuthenticated, isChef, dishController.addDish);
router.put('/:id', isAuthenticated, isChef, dishController.updateDish);
router.delete('/:id', isAuthenticated, isChef, dishController.deleteDish);

module.exports = router;
