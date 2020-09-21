const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  // console.log(req.session.isLoggedIn);
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findById('5f60ea94ea780633a41535fd')
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.log(err)
        }

        res.redirect('/');
      })
    })
    .catch((error) => {
      console.log(error);
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
