/**
 * main app
 */
var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Router setting
 */
var indexRouter = require('./routes/index');
var yahooRouter = require('./routes/yahoo');
var dataScanRouter = require('./routes/scan');
var portfolioRouter = require('./routes/portfolio');
var healthCheckRouter = require('./routes/healthcheck');
var mmRouter = require('./routes/mm');

/**
 * Proxy endpoints for /stockcharts routing
 */
const options = {
  target: "https://stockcharts.com/",
  changeOrigin: true,
  pathRewrite: {
      [`^/stockcharts`]: '',
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
};

const myProxy = createProxyMiddleware(options);

/**
 * view engine setup
 */ 
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // disable cors

/**
 * setup entry point
 */
app.use('/', indexRouter);
app.use('/hc', healthCheckRouter)
app.use('/yahoo', yahooRouter);
app.use('/dscan', dataScanRouter);
app.use('/portfolios', portfolioRouter);
app.use('/mm', mmRouter);
app.use('/stockcharts', myProxy);

/**
 * catch 404 and forward to error handler
 */
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

module.exports = app