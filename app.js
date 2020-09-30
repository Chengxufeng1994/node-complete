const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
// This module exports a single function which takes an instance of connect (or Express) and returns a MongoDBStore class that can be used to store sessions in MongoDB.
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
// routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
// models
const User = require('./models/user');
// setup route middlewares
const csrfProtection = csrf({ cookie: true });

const localhost = '127.0.0.1';
const port = 3000;
// const uri =
//   'mongodb+srv://Benny:Lxhtmj490i2fFNXh@cluster0.fyfno.mongodb.net/shop?retryWrites=true&w=majority';
const uri =
  'mongodb+srv://Benny:Lxhtmj490i2fFNXh@cluster0.fyfno.mongodb.net/shop';
const store = new MongoDBStore({
  uri: uri,
  collection: 'sessions',
});
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: { secure: true }
  })
);
// parse cookies
// we need this because "cookie" is true in csrfProtection
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrfProtection);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
      console.log(error);
    });
});
// locals是Express應用中 Application(app)對象和Response(res)對象中的屬性，該屬性是一個對象。該對象的主要作用是，將值傳遞到所渲染的模板中。
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
// Set up default mongoose connection
mongoose
  .connect(uri)
  .then((result) => {
    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'Cheng',
    //       email: 'Cheng@test.com',
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });
    app.listen(port, localhost, () => {
      console.log(`Server is listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
