const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch((error) => {
      console.log(error);
    });
  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render('shop/product-list', {
  //       prods: rows,
  //       pageTitle: 'All Products',
  //       path: '/products',
  //     });
  //   })
  //   .catch((error) => console.log(error.message));
  // Product.fetchAll((products) => {
  //   res.render('shop/product-list', {
  //     prods: products,
  //     pageTitle: 'All Products',
  //     path: '/products',
  //   });
  // });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.findAll({ where: { id: productId } })
    .then((products) => {
      console.log(products);
      res.render('shop/product-detail', {
        product: products[0],
        pageTitle: products[0].title,
        path: '/products',
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
  // Product.findByPk(productId)
  //   .then((product) => {
  //     res.render('shop/product-detail', {
  //       product: product,
  //       pageTitle: product.title,
  //       path: '/products',
  //     });
  //   })
  //   .catch((error) => {
  //     console.log(error.message);
  //   });
  // Product.fetchProduct(prodId)
  //   .then(([product, fieldData]) => {
  //     console.log(product);
  //     res.render('shop/product-detail', {
  //       product: product[0],
  //       pageTitle: product.title,
  //       path: '/products',
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch((error) => {
      console.log(error);
    });
  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render('shop/index', {
  //       prods: rows,
  //       pageTitle: 'Shop',
  //       path: '/',
  //     });
  //   })
  //   .catch((error) => console.log(error.message));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      // console.log(cart);
      return cart
        .getProducts()
        .then((products) => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            cartProds: products,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
  // Cart.fetchAll((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cardProductData = cart.products.find(
  //         (el) => el.id === product.id
  //       );
  //       if (cardProductData) {
  //         cartProducts.push({ productData: product, qty: cardProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       cartProds: cartProducts,
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  let fetchedCart;
  let newQuantity = 1;

  // User.hasOne(Cart);
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      // Product.belongsToMany(Cart, { through: CartItem });
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }

      return Product.findByPk(productId)
        .then((product) => {
          fetchedCart.addProduct(product, {
            through: { quantity: newQuantity },
          });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((error) => console.log(error));

  // Product.fetchProduct(productId, (product) => {
  //   Cart.addProduct(productId, product.price);
  // });
  // res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  //
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      console.log(products);
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((error) => console.log(error));
  // My Method
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     return cart.removeProducts([productId]);
  //   })
  //   .then((result) => {
  //     res.redirect('/cart');
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  // Product.fetchProduct(productId, (product) => {
  //   Cart.deleteProduct(productId, product.price);
  //   res.redirect('/cart');
  // });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      console.log(products);
      return req.user
        .createOrder()
        .then((order) => {
          console.log(order);
          return order.addProducts(
            products.map((product) => {
              console.log(product);
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .then((result) => {
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: 'products' })
    .then((orders) => {
      orders.forEach((el) => {
        console.log(el.products);
      });
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};
