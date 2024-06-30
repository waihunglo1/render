var express = require('express');
var router = express.Router();
const moment = require('moment');
const taIndicator = require('@debut/indicators');
const yahooFinance = require('yahoo-finance2').default;

/**
 * 
 */
router.get('/', function (req, res, next) {
  // previous 25 days
  var targetDate = moment().subtract(25, "days");
  var todayStr = targetDate.format("YYYY-MM-DD");
  const cgo = req.query.cgo;
  var stockCodes = [];
  var taIndicator = "M5";

  console.log("date:" + todayStr + " cgo:" + cgo);  
  if (!empty(cgo)) {
    stockCodes = cgo.split("|")[0].split(",");
    taIndicator = cgo.split("|")[1];
  } 

  queryMultipleStockTechIndicator(todayStr, stockCodes)
    .then(function (stocks) {
      // res.send(stocks);
      res.json(stocks);
    });
});

/**
 * 
 * @param {*} todayStr 
 * @param {*} stockCodes 
 * @returns 
 */
const queryMultipleStockTechIndicator = async (todayStr, stockCodes) => {
  var bars = [];
  var stockList = [];

  stockCodes.forEach(code => {
    var bar = new Promise((resolve, reject) => {
      var stock = {
        "symbol": code,
        "extra": 0
      }
      queryHistoryPrices(todayStr, stock)
        .then(function () {
          stockList.push(stock);
          resolve(stock);
        });
    });

    bars.push(bar);
  });

  await Promise.all(bars)
    .then((values) => {
      console.log(values);
  });

  return stockList;
}

/**
 * 
 * @param {*} todayStr 
 * @param {*} stockCodeStr 
 * @returns 
 */
const queryHistoryPrices = async (todayStr, stock) => {
  // format query options
  const queryOptions = { period1: todayStr, /* ... */ };
  const stockPrices = await yahooFinance.historical(stock.symbol, queryOptions);

  // create tech indicator
  const sma = new taIndicator.SMA(10);
  const rsi = new taIndicator.RSI(12);
  const roc = new taIndicator.ROC(12);

  // calculate
  stockPrices.forEach((row, idx) => {
    stock.extra = roc.nextValue(row.adjClose);
  });

  return stock;
}

function empty(str)
{
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "")
        return true;
    else
        return false;
}

module.exports = router;
