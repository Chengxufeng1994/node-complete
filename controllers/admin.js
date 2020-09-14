const Product = require('../models/product');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
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
  const product = new Product(
    title,
    imageUrl,
    price,
    description,
    null,
    req.user._id
  );

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

  Product.fetchProduct(productId)
    .then((product) => {
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
  const product = new Product(
    title,
    imageUrl,
    price,
    description,
    new ObjectId(productId)
  );

  product
    .save()
    .then(() => {
      console.log('Update product');
      res.redirect('/admin/products');
    })
    .catch((error) => console.log(error));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.deleteProduct(productId)
    .then(() => {
      // return req.user.deleteItemFromCart(productId);
    })
    .then((result) => {
      console.log('Delete product');
      res.redirect('/admin/products');
    })
    .catch((error) => {
      console.log(error.message);
    });
};

exports.getProducts = (req, res, next) => {
  console.log('Fetch All Product!!!');
  Product.fetchAll()
    .then((products) => {
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
