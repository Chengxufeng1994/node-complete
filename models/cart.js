const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;

// const fs = require('fs');
// const path = require('path');
// const Product = require('./product');

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'cart.json'
// );

// const getCartFromFile = (callbackeFunc) => {
//   fs.readFile(p, (err, fileContent) => {
//     let cart = { products: [], totalPrice: 0 };

//     if (err) {
//       callbackeFunc(null);
//     } else {
//       callbackeFunc(JSON.parse(fileContent));
//     }
//   });
// };

// module.exports = class Cart {
//   static fetchAll(cb) {
//     getCartFromFile(cb);
//   }

//   static addProduct(id, productPrice) {
//     // Fetch the previous cart
//     fs.readFile(p, (err, fileContent) => {
//       let cart = { products: [], totalPrice: 0 };

//       if (!err) {
//         cart = JSON.parse(fileContent);
//       }
//       // Analyze the cart => Find existing product
//       const existingProductIndex = cart.products.findIndex((el) => {
//         return el.id === id;
//       });
//       const existingProduct = cart.products[existingProductIndex];
//       let updatedProduct;
//       // Add new porduct / increaser quantity
//       if (existingProduct) {
//         // Deep clone
//         updatedProduct = {
//           ...existingProduct,
//         };
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products = [...cart.products];
//         cart.products[existingProductIndex] = updatedProduct;
//       } else {
//         updatedProduct = { id: id, qty: 1 };
//         cart.products = [...cart.products, updatedProduct];
//       }

//       cart.totalPrice = cart.totalPrice + +productPrice;

//       fs.writeFile(p, JSON.stringify(cart), (err) => {
//         console.log(err);
//       });
//     });
//   }
//   // handle delete product in Cart
//   static deleteProduct(id, productPrice) {
//     getCartFromFile((cart) => {
//       // const productIndex = cart.products.findIndex((el) => {
//       //   return el.id === id;
//       // });
//       // const product = cart.products[productIndex]
//       // 簡化成以下方式
//       const updatedCart = { ...cart };
//       const product = updatedCart.products.find((el) => el.id === id);
//       // 如果沒有 product 就 retrun
//       if (!product) {
//         return;
//       }
//       const productQty = product.qty;

//       updatedCart.products = updatedCart.products.filter(
//         (prod) => prod.id !== id
//       );
//       updatedCart.totalPrice =
//         updatedCart.totalPrice - productQty * productPrice;

//       fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//         // console.log(err);
//       });
//     });
//   }
// };
