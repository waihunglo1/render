var express = require('express');
var router = express.Router();
const moment = require('moment');
const taIndicator = require('@debut/indicators');
const yahooFinance = require('yahoo-finance2').default;

/**
 * 
 */
router.get('/', function (req, res, next) {
  const cgo = req.query.cgo;
  var stockCodes = [];
  var taIndicatorStr = "M12";
  if (!empty(cgo)) {
    stockCodes = cgo.split("|")[0].split(",");
    taIndicatorStr = cgo.split("|")[1];
  } 

  queryMultipleStockTechIndicator(stockCodes, taIndicatorStr)
    .then(function (stocks) {
      res.json(stocks);
    });
});

function determineDays(taIndicatorStr) {
  var days = 25;
  if (taIndicatorStr == "S50") {
    days = 80;    
  }
  var targetDate = moment().subtract(days, "days");
  var todayStr = targetDate.format("YYYY-MM-DD");
  return todayStr;
}

/**
 * Round half away from zero ('commercial' rounding)
 * Uses correction to offset floating-point inaccuracies.
 * Works symmetrically for positive and negative numbers.
 */
function round(num, decimalPlaces = 0) {
  var p = Math.pow(10, decimalPlaces);
  var n = (num * p) * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

/**
 * 
 * @param {*} todayStr 
 * @param {*} stockCodes 
 * @returns 
 */
const queryMultipleStockTechIndicator = async (stockCodes, taIndicatorStr) => {
  var bars = [];
  var stockList = [];
  var todayStr = determineDays(taIndicatorStr);
  console.log("date:" + todayStr + " cgo:" + stockCodes);

  stockCodes.forEach(code => {
    var bar = new Promise((resolve, reject) => {
      var stock = {
        "symbol": code,
        "extra": 0
      }
      queryHistoryPrices(todayStr, stock, taIndicatorStr)
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

  
  // Creating response object
  let responseJson = new Object();
  responseJson.stocks = stockList;

  return responseJson;
}

/**
 * 
 * @param {*} todayStr 
 * @param {*} stockCodeStr 
 * @returns 
 */
const queryHistoryPrices = async (todayStr, stock, taIndicatorStr) => {
  // format query options
  const queryOptions = { period1: todayStr, /* ... */ };
  const stockPrices = await yahooFinance.historical(stock.symbol, queryOptions);

  // create tech indicator
  const rsi = new taIndicator.RSI(14);
  const roc = new taIndicator.ROC(12);
  const sma50 = new taIndicator.SMA(50);

  console.log("taIndicatorStr :" + taIndicatorStr);

  // calculate
  stockPrices.forEach((row, idx) => {
    if (taIndicatorStr == "M12") {
      stock.extra = roc.nextValue(row.adjClose);
    } else if (taIndicatorStr == "S50") {
      stock.extra = round(sma50.nextValue(row.adjClose), 2);
      stock.close = round(row.adjClose, 2);
      stock.diff = round((stock.close - stock.extra) / stock.extra * 100, 2);
    } else {
      stock.extra = rsi.nextValue(row.adjClose);
    }
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
