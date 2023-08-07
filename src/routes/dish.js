const express = require('express');

const router = express.Router();

const dishController = require('../controllers/dish');
const { isAuthenticated, isChef } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.get('/', dishController.getAllDishes);

router.get('/filter', dishController.filterDishes);

router.get('/:id', dishController.getDishById);

router.post('/', isAuthenticated, isChef, dishController.addDish);

router.put('/:id', isAuthenticated, isChef, dishController.updateDish);

router.delete('/:id', isAuthenticated, isChef, dishController.deleteDish);

router.put(
  '/image/:id',
  isAuthenticated,
  isChef,
  upload.single('image'),
  dishController.uploadDishImage
);

module.exports = router;
