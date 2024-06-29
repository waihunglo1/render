var express = require('express');
var router = express.Router();
// require syntax (if your code base does not support imports)

var yahooFinance = require('yahoo-finance');




/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a yahoo');
});

module.exports = router;
