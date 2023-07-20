const dishController = require('../controllers/dish');
const dishModel = require('../models/dish');

jest.mock('../models/dish');

describe('Dish Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDishes', () => {
    test('should return all dishes', async () => {
      const mockDishes = [
        { name: 'Dish 1', price: 450 },
        { name: 'Dish 2', price: 20 },
      ];
      dishModel.find.mockResolvedValue(mockDishes);

      await dishController.getAllDishes(req, res);

      expect(res.json).toHaveBeenCalledWith(mockDishes);
    });

    test('should handle errors', async () => {
      const errorMessage = 'Database error';
      dishModel.find.mockRejectedValue(new Error(errorMessage));

      await dishController.getAllDishes(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getDishById', () => {
    test('should return a dish by ID', async () => {
      const mockId = '12345';
      const mockDish = { name: 'Dish 1', price: 258, _id: mockId };
      req.params = { id: mockId };
      dishModel.findById.mockResolvedValue(mockDish);

      await dishController.getDishById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockDish);
    });

    test('should return an error if the dish is not found', async () => {
      const mockId = 'non-existent-id';
      req.params = { id: mockId };
      dishModel.findById.mockResolvedValue(null);

      await dishController.getDishById(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        message: "the dish you are looking for wasn't found",
      });
    });

    test('should handle errors', async () => {
      const mockId = '12345';
      const errorMessage = 'Database error';
      req.params = { id: mockId };
      dishModel.findById.mockRejectedValue(new Error(errorMessage));

      await dishController.getDishById(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('filterDishes', () => {
    test('should filter dishes based on query parameters', async () => {
      const mockFilteredDishes = [
        { name: 'Filtered Dish 1' },
        { name: 'Filtered Dish 2' },
      ];
      const mockQuery = {
        maxPrice: '20',
        minPrice: '10',
        rate: '4.5',
        ingredients: 'ingredient1,ingredient2',
      };
      req.query = mockQuery;
      dishModel.find.mockResolvedValue(mockFilteredDishes);

      await dishController.filterDishes(req, res);

      expect(res.json).toHaveBeenCalledWith(mockFilteredDishes);
    });

    test('should handle errors', async () => {
      const errorMessage = 'Internal Server Error';
      req.query = { maxPrice: '20' };
      dishModel.find.mockRejectedValue(new Error(errorMessage));

      await dishController.filterDishes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('addDish', () => {
    test('should add a new dish', async () => {
      const mockDishData = {
        name: 'New Dish',
        chefId: 'chef123',
        description: 'Delicious new dish',
        image: 'https://example.com/new-dish.jpg',
        ingredients: ['ingredient1', 'ingredient2'],
        price: 15.99,
      };
      req.body = mockDishData;
      const mockNewDish = {
        name: mockDishData.name,
        chefId: mockDishData.chefId,
        ingredients: mockDishData.ingredients,
        price: mockDishData.price,
        reviews: mockDishData.reviews,
        _id: 'new-dish-id',
      };
      dishModel.create.mockResolvedValue(mockNewDish);

      await dishController.addDish(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNewDish);
    });

    test('should handle errors', async () => {
      const errorMessage = 'Database error';
      req.body = {
        name: 'New Dish',
        chefId: 'chef123',
        description: 'Delicious new dish',
        image: 'https://example.com/new-dish.jpg',
        ingredients: ['ingredient1', 'ingredient2'],
        price: 15.99,
      };
      dishModel.create.mockRejectedValue(new Error(errorMessage));

      await dishController.addDish(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('updateDish', () => {
    test('should update an existing dish', async () => {
      const mockId = 'existing-dish-id';
      const mockDishData = {
        name: 'Updated Dish',
        chefId: 'updated-chef123',
        ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
        price: 19.99,
        reviews: [{ rating: 4.5, comment: 'Updated review' }],
      };
      req.params = { id: mockId };
      req.body = mockDishData;
      const mockUpdatedDish = {
        name: mockDishData.name,
        chefId: mockDishData.chefId,
        ingredients: mockDishData.ingredients,
        price: mockDishData.price,
        reviews: mockDishData.reviews,
        _id: mockId,
      };
      dishModel.findOneAndUpdate.mockResolvedValue(mockUpdatedDish);

      await dishController.updateDish(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUpdatedDish);
    });

    test('should return an error if the dish is not found', async () => {
      const mockId = 'non-existent-id';
      req.params = { id: mockId };
      req.body = {
        name: 'Updated Dish',
        chefId: 'updated-chef123',
        ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
        price: 19.99,
        reviews: [{ rating: 4.5, comment: 'Updated review' }],
      };
      dishModel.findOneAndUpdate.mockResolvedValue(null);

      await dishController.updateDish(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        message: "the dish you are trying to update wasn't found",
      });
    });

    test('should handle errors', async () => {
      const mockId = 'existing-dish-id';
      const errorMessage = 'Database error';
      req.params = { id: mockId };
      req.body = {
        name: 'Updated Dish',
        chefId: 'updated-chef123',
        ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
        price: 19.99,
        reviews: [{ rating: 4.5, comment: 'Updated review' }],
      };
      dishModel.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await dishController.updateDish(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('deleteDish', () => {
    test('should delete a dish', async () => {
      const mockId = 'existing-dish-id';
      req.params = { id: mockId };
      dishModel.findByIdAndDelete.mockResolvedValue({ _id: mockId });

      await dishController.deleteDish(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    test('should return an error if the dish is not found', async () => {
      const mockId = 'non-existent-id';
      req.params = { id: mockId };
      dishModel.findByIdAndDelete.mockResolvedValue(null);

      await dishController.deleteDish(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        message: "the dish you are trying to delete wasn't found",
      });
    });

    test('should handle errors', async () => {
      const mockId = 'existing-dish-id';
      const errorMessage = 'Database error';
      req.params = { id: mockId };
      dishModel.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

      await dishController.deleteDish(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
