const express = require('express');
const bcrypt = require('bcryptjs');
// ...rest of the initial code omitted for simplicity.
const { body, check } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();
// handle login && logout
router.get('/login', authController.getLogin);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
router.post('/logout', authController.postLogout);
// handle signup
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        // if (value === 'admin@shop.com') {
        //   throw new Error('This email address is forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body(
      'confirmPassword',
      'confirmPassword field must have the same value as the password field'
    )
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match.');
        }

        return true;
      }),
  ],
  authController.postSignup
);
// handle reset password
router.get('/resetpassword', authController.getResetPassword);
router.post('/resetpassword', authController.postResetPassword);
// handle new password
router.get('/resetpassword/:token', authController.getNewPassword);
router.post('/newpassword', authController.postNewPassword);

module.exports = router;
