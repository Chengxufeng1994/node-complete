const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);
// // /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);
// // /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title', 'Please enter a Title.')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    // body('imageUrl', 'Please enter a ImageUrl').isURL({
    //   protocols: ['http', 'https', 'ftp'],
    // }),
    body('price', 'Please enter a Price.').isFloat(),
    body('description', 'Please enter a Description.')
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title', 'Please enter a Title.')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    // body('imageUrl', 'Please enter a ImageUrl').isURL({
    //   protocols: ['http', 'https', 'ftp'],
    // }),
    body('price', 'Please enter a Price.').isFloat(),
    body('description', 'Please enter a Description.')
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
