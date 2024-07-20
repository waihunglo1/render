const taIndicator = require('@debut/indicators');
const yahooFinance = require('yahoo-finance2').default;
const helper = require('./helper.js');
const stockcharts = require('./stockcharts-utils.js')

/**
 * 
 * @param {*} todayStr 
 * @param {*} stockCodes 
 * @returns 
 */
const queryMultipleStockTechIndicator = async (stockCodes, taIndicatorStr) => {
    var bars = [];
    var stockList = [];
    var todayStr = helper.determineDays(taIndicatorStr);
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
        stock.extra = helper.round(sma50.nextValue(row.adjClose), 2);
        stock.close = helper.round(row.adjClose, 2);
        stock.diff = helper.round((stock.close - stock.extra) / stock.extra * 100, 2);
      } else {
        stock.extra = rsi.nextValue(row.adjClose);
      }
    });

    // fill data scan
    await stockcharts.fillDataScan(stock);

    return stock;
  }

module.exports = {
    queryMultipleStockTechIndicator
};