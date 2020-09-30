const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();
// handle login && logout
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
// handle signup
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
// handle reset password
router.get('/resetpassword', authController.getResetPassword);
router.post('/resetpassword', authController.postResetPassword);
// handle new password
router.get('/resetpassword/:token', authController.getNewPassword);
router.post('/newpassword', authController.postNewPassword);

module.exports = router;
