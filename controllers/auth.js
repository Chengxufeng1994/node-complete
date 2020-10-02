const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const salt = bcrypt.genSaltSync(12);
// nodemailer
const transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '97dd3280293c10',
    pass: 'b1eb7aa22648df',
  },
});
const { validationResult } = require('express-validator');

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
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
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

          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
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
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
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
      console.log(err);
    });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/resetpassword',
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  console.log('[POST reset password]');
  const { email } = req.body;

  crypto.randomBytes(32, function (err, buffer) {
    if (err) {
      console.log(err);
      return res.redirect('/resetpassword');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash(
            'error',
            'Email is NOT exists, No account with that email found.'
          );
          return res.redirect('/resetpassword');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then((result) => {
        res.redirect('/login');
        const mailOptions = {
          from: '"Node-complete Team" <shop@node-complete.com>',
          to: email,
          subject: 'Reset Password',
          text: 'Hey there, it’s our first message sent with Nodemailer ',
          html: `
          <h1>You request a password reset!</h1>
          <p>Click this <a href="http://localhost:3000/resetpassword/${token}">link</a> to set New Password!</p>`,
        };

        return transport.sendMail(mailOptions);
      })
      .then((info) => {
        console.log('Message sent: %s', info.messageId);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  console.log('[GET New Password]');
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/newpassword', {
        pageTitle: 'New password',
        path: '/new-assword',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  console.log('[POST New Password]');
  const { userId, password: newpassword, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newpassword, salt);
      // user.password = newpassword;
      // return user.save();
    })
    .then((hashPassword) => {
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
    });
};
