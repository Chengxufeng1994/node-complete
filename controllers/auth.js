const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
// nodemailer
const transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '97dd3280293c10',
    pass: 'b1eb7aa22648df',
  },
});

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  // console.log(req.session.isLoggedIn);
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      const { password: hashPassword } = user;
      bcrypt
        .compare(password, hashPassword)
        .then((isMatch) => {
          // res === true
          if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }

          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  console.log('Logout');

  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
  // .then((result) => {
  //   res.redirect('/');
  // })
  // .catch((error) => {
  //   console.log(error);
  // });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          'error',
          'Email is exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }

      const salt = bcrypt.genSaltSync(12);
      return bcrypt
        .hash(password, salt)
        .then((hashPassword) => {
          const user = new User({
            email: email,
            password: hashPassword,
            cart: { items: [] },
          });

          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
          const mailOptions = {
            from: '"Node-complete Team" <shop@node-complete.com>',
            to: email,
            subject: 'Sign up succeeded!',
            text: 'Hey there, it’s our first message sent with Nodemailer ',
            html: '<h1>Hey there!</h1><h2>You successfully signed up!</h2>',
          };

          return transport.sendMail(mailOptions);
        })
        .then((info) => {
          console.log('Message sent: %s', info.messageId);
        })
        .catch((err) => {
          console.log('line 154: ', err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
