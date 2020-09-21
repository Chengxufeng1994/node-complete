const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
// This module exports a single function which takes an instance of connect (or Express) and returns a MongoDBStore class that can be used to store sessions in MongoDB.
var MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
// routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
// models
const User = require('./models/user');

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
    saveUninitialized: true,
    store: store,
    // cookie: { secure: true }
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
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

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
// Set up default mongoose connection
mongoose
  .connect(uri)
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Cheng',
          email: 'Cheng@test.com',
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(port, localhost, () => {
      console.log(`Server is listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
