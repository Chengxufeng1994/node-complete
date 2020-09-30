const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user._id,
  });

  product
    .save()
    .then((result) => {
      console.log('Create Product');
      res.redirect('/admin/products');
    })
    .catch((error) => console.log(error));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const { productId } = req.params;

  if (!editMode) {
    return res.redirect('/');
  }

  Product.findById(productId)
    .then((product) => {
      console.log('Edit Product');
      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;

  // Product.findById(productId)
  //   .then((product) => {
  //     if (product.userId.toString() !== req.user._id.toString()) {
  //       return res.redirect('/');
  //     }
  //     product.title = title;
  //     product.imageUrl = imageUrl;
  //     product.price = price;
  //     product.description = description;

  //     return product.save().then((result) => {
  //       console.log('Update Product');
  //       res.redirect('/admin/products');
  //     });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  // My Method
  Product.updateOne(
    { _id: productId, userId: req.user._id },
    {
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
    }
  )
    .then(() => {
      console.log('Update Product');
      res.redirect('/admin/products');
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  // Product.findByIdAndRemove({ _id: productId })
  Product.deleteOne({ _id: productId, userId: req.user._id })
    // .then(() => {
    //   return req.user.deleteItemFromCart(productId);
    // })
    .then((result) => {
      console.log('Delete product');
      res.redirect('/admin/products');
    })
    .catch((error) => {
      console.log(error.message);
    });

  // Product.deleteProduct(productId)
  //   .then(() => {
  //     // return req.user.deleteItemFromCart(productId);
  //   })
  //   .then((result) => {
  //     console.log('Delete product');
  //     res.redirect('/admin/products');
  //   })
  //   .catch((error) => {
  //     console.log(error.message);
  //   });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id') // include title and price, exclude _id
    // .populate('userId', 'name')
    .then((products) => {
      console.log('Fetch All');
      // console.log(products);

      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
