var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cityRouter = require('./routes/city');
var categoryRouter = require('./routes/category');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var config = require('./config/global');
var cors = require('cors');

var app = express();

var path = require('path');
global.appRoot = path.resolve(__dirname);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false,limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());
app.use(cors());


mongoose.connect(config.database.mongoUrl, {useNewUrlParser:true, useUnifiedTopology:true}, (err)=>{
  if(err){
    console.log("err", err);
  } else{
    console.log("database connected successfully.");
  }
})

// app.use(function(req,res,next){
// 	res.setHeader('Access-Control-Allow-Origin','*');
// 	res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT,PATCH, DELETE');
// 	res.setHeader('Access-Control-Allow-Headers','*');
// 	res.setHeader('Access-Control-Allow-Credentials','true');
// 	next();
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cities', cityRouter);
app.use('/categories', categoryRouter);
app.use('/uploads',express.static(path.resolve('./uploads')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
