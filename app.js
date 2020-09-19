const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
// Import the mongoose module
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');

const localhost = '127.0.0.1';
const port = 3000;
const uri =
  'mongodb+srv://Benny:Lxhtmj490i2fFNXh@cluster0.fyfno.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5f60ea94ea780633a41535fd')
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
