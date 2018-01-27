var Campground = require('./models/campground');
var expressSession = require('express-session');
var methodOverride = require('method-override');
var LocalStrategy = require('passport-local');
var Comment = require('./models/comment');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var User = require('./models/user');
var mongoose = require('mongoose');
var passport = require('passport');
var express = require('express');
var seedDB = require('./seeds');
var app = express();

// Code for uploading images ********************* vvv
// Testing Image Uploader
var multer = require('multer');
var path = require('path');

// Set Storage Engine
var storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Init Upload
var upload = multer({
  storage: storage,
}).single('image');

// Code for uploading images ********************* ^^^

// Requiring Routes
var campgroundRoutes = require('./routes/campgrounds');
var commentRoutes = require('./routes/comments');
var indexRoutes = require('./routes/index');

var url = process.env.DATABASEURL || 'mongodb://localhost/travel_app';
mongoose.connect(url, { useMongoClient: true });
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');

// seedDB();

// PASSPORT CONFIG
app.use(expressSession({
  secret: 'This is the opposite of secret!',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/', indexRoutes);

// =========================================
// SERVER CONFIG
// =========================================

var port = process.env.PORT || 3000;

app.listen(port, process.env.IP, function () {
  console.log('Server started');
});
