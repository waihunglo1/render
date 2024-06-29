/**
 * to start npm start under redirectApp directory
 * C:\Users\user\Documents\GitHub\render\redirectApp> npm start
 * test from browser
 * http://localhost:3000/stockcharts/c-sc/sc?r=1718500840433&chart=LAND,uu[305,a]dacayaci[pb20!b50][dg][ilM12]
 * 
 */
var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

var indexRouter = require('./routes/index');
var yahooRouter = require('./routes/yahoo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // disable cors

// setup entry point
app.use('/', indexRouter);
app.use('/yahoo', yahooRouter);

// Proxy endpoints for /stockcharts routing
const API_SERVICE_URL = "https://stockcharts.com/";
app.use('/stockcharts', createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
      [`^/stockcharts`]: '',
  },
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
