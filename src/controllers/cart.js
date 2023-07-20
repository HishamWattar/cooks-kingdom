const Cart = require('./models/Cart');
const jwt = require('jsonwebtoken');

exports.postCart = async (req, res) => {
    try {
      const userId = getUserID(req);
      const cart = new Cart({customerId: userId});
      await cart.save();
      res.status(201).json(cart);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create cart', error: err });
    }
  }

exports.deleteCart =  async (req, res) => {
    try{
        const userId = getUserID(req);
        Cart.deleteOne({customerId: userId}) 
        //todo: what to do after the delete 
        res.status(204).end();
    }catch(err){
        res.status(500).json({ message: 'Failed to delete cart', error: err });
    }
}

exports.postCartItemByDishId =  async(req, res) =>{
    try{
       const userId = getUserID(req);
       const cart =  Cart.findOne({customerId: userId})
       const cartItem = {
            dishId: req.params.id,
            quantity: 1,
        };
        cart.cartItems.push(cartItem)
        cart.save();
        res.status(201).json(cart)
    
    }
    catch(err){
        res.status(500).json({ message: 'Failed to add item to cart', error: err });
    }
}


exports.putCartItemByDishId =  async(req, res) =>{
    try{
        const userId = getUserID(req);
        const cart =  Cart.findOne({customerId: userId})
        const cartItem = cart.cartItems.find(item => item.dishId === req.params.id);
        if (cartItem) {
            cartItem.quantity = cartItem.quantity + 1;
            cart.save();
        }else{
            res.status(404).json({message:'item not found'})
        }
        res.status(201).json(cart)
    }catch (err){
        res.status(500).json({ message: 'Failed to update item' , error: err});
    }
}

exports.getCartItemByDishId = async (req, res) =>{
    try{
        const userId = getUserID(req);
        const cart =  Cart.findOne({customerId: userId})
        const cartItem = cart.cartItems.find(item => item.dishId === req.params.id);
        if (cartItem) {
            res.status(201).json(cartItem)
        }else{
            res.status(404).json({message:'item not found'})
        }
    }catch(err){
        res.status(500).json({ message: 'Failed to get item' , error: err});
    }
}

exports.deleteCartItemByDishId = async(req, res) =>{
    try{
        const userId = getUserID(req);
        const cart =  Cart.findOne({customerId: userId})
        const cartItemIndex = cart.cartItems.findIndex(item => item.dishId === dishId);

        if (cartItemIndex !== -1) {
          cart.cartItems.splice(cartItemIndex, 1);
          cart.save();
        } else {
            res.status(404).json({message:'item not found'})
        }
        res.status(204).json(cart);

    }catch(err){
       res.status(500).json({ message: 'Failed to delete item' , error: err});   
    }
}

function getUserID(req) {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    return decoded.userId;
}
