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

module.exports = router;
