var express = require('express');
var router = express.Router();
const helper = require('./helper.js');
const yahooutils = require('./yahoo-utils.js');

/**
 * main function
 */
router.get('/', function (req, res, next) {
  const cgo = req.query.cgo;
  var stockCodes = [];
  var taIndicatorStr = "M12";
  if (!helper.isEmpty(cgo)) {
    stockCodes = cgo.split("|")[0].split(",");
    taIndicatorStr = cgo.split("|")[1];

    yahooutils.queryMultipleStockTechIndicator(stockCodes, taIndicatorStr)
      .then(function (stocks) {
        res.json(stocks);
      });    
  }
});

/**
 * quote summary function
 */
router.get('/summary', function (req, res, next) {
  const cgo = req.query.cgo;
  var stockCodes = [];
  var taIndicatorStr = "M12";
  if (!helper.isEmpty(cgo)) {
    stockCodes = cgo.split("|")[0].split(",");

    yahooutils.queryMultipleStockQuote(stockCodes)
      .then(function (stocks) {
        res.json(stocks);
      });    
  }
});

module.exports = router;
