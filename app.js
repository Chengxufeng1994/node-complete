const path = require('path');
const fs = require('fs');
// const https = require('https');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
// This module exports a single function which takes an instance of connect (or Express) and returns a MongoDBStore class that can be used to store sessions in MongoDB.
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
// routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
// models
const User = require('./models/user');

const host = '0.0.0.0';
const port = process.env.PORT || 3000;
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.fyfno.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const app = express();
const store = new MongoDBStore({
  uri: uri,
  collection: 'sessions',
});
// const csrfProtection = csrf({ cookie: true });
const csrfProtection = csrf();
// openssl req -nodes -new -x509 -keyout server.key -out server.cert
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});
const fileFilter = function (req, file, cb) {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    // To accept the file pass `true`, like so:
    cb(null, true);
  } else {
    // To reject this file pass `false`, like so:
    cb(null, false);
  }

  // You can always pass an error if something goes wrong:
  // cb(new Error("I don't have a clue!"));
};
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.set('view engine', 'ejs');
app.set('views', 'views');
// helmet
app.use(helmet());
// compression
app.use(compression());
// morgan
app.use(morgan('combined', { stream: accessLogStream }));
// parse cookies
// we need this because "cookie" is true in csrfProtection
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: { secure: true }
  })
);
app.use(cookieParser());
app.use(csrfProtection);
app.use(flash());
// locals是Express應用中 Application(app)對象和Response(res)對象中的屬性，該屬性是一個對象。該對象的主要作用是，將值傳遞到所渲染的模板中。
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // throw new Error('Async Dummy');
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // throw new Error(err);
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use((err, req, res, next) => {
  console.error(err);
  // res.render(error.httpStatusCoder).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
});
// Set up default mongoose connection
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    // https.createServer(
    //   { key: privateKey, cert: certificate },
    //   app
    // )
    app.listen(port, host, () => {
      console.log(`Server is listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
