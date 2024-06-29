var express = require('express');
var router = express.Router();
// require syntax (if your code base does not support imports)

var yahooFinance = require('yahoo-finance');
// var utils = require('./utils');

/*
utils.show(async () => {
  const result = await yahooFinance.quoteSummary("TSLA", {
    // 1. Try adding, removing or changing modules
    // You'll get suggestions after typing first quote mark (")
    modules: ["price"]
  });
  */

  // 2. Put a "." after result to explore
  // return result;

  // 3. Try change "quoteSummary" above to something else
//});



/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a yahoo');


});

module.exports = router;
