const Product = require('../models/product');
const Products = require('../models/product');

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
  req.user
    .createProduct({
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
    })
    .then((result) => {
      console.log('Create Product');
      res.redirect('/');
    })
    .catch((error) => console.log(error));
  // const product = new Product(null, title, imageUrl, description, price);
  // product
  //   .save()
  //   .then((res) => {
  //     console.log(res);
  //     res.redirect('/');
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const productId = req.params.productId;

  if (!editMode) {
    return res.redirect('/');
  }

  req.user
    .getProducts({ where: { id: productId } })
    .then((products) => {
      const product = products[0];

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

  Product.findByPk(productId)
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

  // Product.fetchProduct(productId, (product) => {
  //   if (!product) {
  //     return res.redirect('/');
  //   }
  //   // console.log(product);
  //   res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: editMode,
  //     product: product,
  //   });
  // });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;

  Product.update(
    {
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
    },
    {
      where: {
        id: productId,
      },
    }
  )
    .then(() => {
      console.log('Update product');
      res.redirect('/admin/products');
    })
    .catch((error) => {
      console.log(error);
    });

  // Product.findByPk(productId)
  //   .then((product) => {
  //     product.title = title;
  //     product.imageUrl = imageUrl;
  //     product.price = price;
  //     product.description = description;
  //     return product.save()
  //   })
  //   .then(() => {
  //     console.log('Update product');
  //     res.redirect('/admin/products');
  //   })
  //   .catch((error) => {
  //     console.log(error.message);
  //   });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then(() => {
      console.log('Delete product');
      res.redirect('/admin/products');
    })
    .catch((error) => {
      console.log(error.message);
    });

  // Product.destroy({
  //   where: {
  //     id: productId,
  //   },
  // })
  //   .then(() => {
  //     console.log('Delete product');
  //     res.redirect('/admin/products');
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
  // Product.fetchAll((products) => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products',
  //   });
  // });
};
