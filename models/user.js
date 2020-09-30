const Mongoose = require('mongoose');
const { use } = require('../routes/shop');
const Order = require('./order');
const Product = require('./product');
const Schema = Mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// instance methods
userSchema.methods.fetchCartItems = function () {
  const cartItemsIds = this.cart.items.map((item) => {
    return item.productId;
  });

  return Product.find({
    _id: {
      $in: cartItemsIds,
    },
  })
    .then((cartProducts) => {
      return cartProducts.map((product) => {
        product.quantity = this.cart.items.find(
          (item) => item.productId.toString() === product._id.toString()
        ).quantity;

        return product;
      });
    })
    .catch((error) => console.log(error));
};

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });
  const updatedCartItems = [...this.cart.items];
  let newQuantity = 1;

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    const updatedCartProduct = updatedCartItems[cartProductIndex];
    updatedCartProduct.quantity = newQuantity;
    updatedCartItems[cartProductIndex] = updatedCartProduct;
    // updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  // My method
  // const cartProductIndex = this.cart.items.findIndex((item) => {
  //   return item.productId.toString() === id.toString;
  // });
  // this.cart.items.splice(cartProductIndex, 1);
  return this.save();
};

userSchema.methods.resetCart = function () {
  this.cart = { items: [] };
  this.save();
};

userSchema.methods.fetchOrders = function (userId) {
  return Order.find({ 'user.userId': userId })
    .then((orders) => {
      return orders;
    })
    .catch((error) => {
      console.log(error);
    });
};

const User = Mongoose.model('User', userSchema);

module.exports = User;
