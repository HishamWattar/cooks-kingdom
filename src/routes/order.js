const jwt = require('jsonwebtoken');
const express = require('express');
const routes = express.Router();
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Dish = require('./models/Dish');

routes.post('Order/', async(req, res) =>{
    try{
        const userId = getUserID(req);
        const cart =  Cart.findOne({customerId: userId})
        const totalPrice = 0;
        const orderItems = cart.cartItems.map(async (cartItem) => {
            const dish = await Dish.findById(cartItem.dishId);
            totalPrice += dish.price
              return {
                dishId: cartItem.dishId,
                quantity: cartItem.quantity,
                price: dish.price, 
              };
          });
        const totalQuantity = cart.cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);  
        const newOrder = new Order({
            customerId: cart.customerId,
            orderItems: orderItems,
            chefId: req.body.chefId,
            totalPrice: totalPrice,
            status: 'pending',
            quantity: totalQuantity,
          }); 
    
      res.status(201).json(newOrder);
    }catch(err){
        res.status(500).json({ message: 'Failed to create a new order' , error: err});   
     }
})

routes.get('Order/:id', async(req, res) =>{
    try{
        const order = await Order.findById(req.params.id)
        res.status(201).json(order);
    }catch(err){
        res.status(500).json({ message: 'Failed to get order' , error: err});   
    }
})

routes.delete('Order/:id', async(req, res) =>{
    Order.findOneAndDelete(req.params.id, function (err, docs) {
        if (err){
            res.status(500).json({ message: 'Failed to delete order' , error: err});   
        }
        else{
            res.status(500).json({ message: 'order deleted'});   
        }
    });
})
routes.get('Orders/', async(req, res) =>{
    Order.find()
    .then(orders => {
        res.status(201).json(orders);
    })
    .catch(err => {
        res.status(500).json({ message: 'Failed to get order' , error: err});   
    });
})

function getUserID(req) {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    return decoded.userId;
}
