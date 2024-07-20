var express = require('express');
var router = express.Router();

/**
 * main function
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
