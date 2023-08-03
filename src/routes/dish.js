/* eslint-disable prettier/prettier */
const express = require('express');

const router = express.Router();

const dishController = require('../controllers/dish');
const { isAuthenticated, isChef, isOwner } = require('../middlewares/auth');

router.get('/', dishController.getAllDishes);
router.get('/filter', dishController.filterDishes);
router.get('/:id', dishController.getDishById);

router.post('/', isAuthenticated, isChef, dishController.addDish);
router.put(
  '/:id',
  isAuthenticated,
  isChef,
  isOwner('dishes'),
  dishController.updateDish
);
router.delete(
  '/:id',
  isAuthenticated,
  isOwner('dishes'),
  isChef,
  dishController.deleteDish
);

// router.post('/',  dishController.addDish);
// router.put('/:id',  dishController.updateDish);
// router.delete('/:id',  dishController.deleteDish);

module.exports = router;
