const taIndicator = require('@debut/indicators');
const yahooFinance = require('yahoo-finance2').default;
const helper = require('./helper.js');
const stockcharts = require('./stockcharts-utils.js')
const config = require('./config.js');

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
        "extra": -1,
        "errmsg":""
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
  try {
    // format query options
    const queryOptions = { period1: todayStr, /* ... */ };
    const stockPrices = await yahooFinance.historical(stock.symbol, queryOptions);

    // create tech indicator
    const rsi = new taIndicator.RSI(14);
    const roc = new taIndicator.ROC(12);
    const sma50 = new taIndicator.SMA(50);
    const sma20 = new taIndicator.SMA(20);
    const sma10 = new taIndicator.SMA(10);

    console.log("taIndicatorStr :" + taIndicatorStr);

    // calculate
    stockPrices.forEach((row, idx) => {
      if (taIndicatorStr == "M12") {
        // roc
        stock.extra = roc.nextValue(row.adjClose);
      } else if (taIndicatorStr == "B14") {
        stock.extra = rsi.nextValue(row.adjClose);
      } else if (taIndicatorStr == "S50DF") {
        // sma50
        stock.sma50 = helper.round(sma50.nextValue(row.adjClose), 2);
        stock.sma20 = helper.round(sma20.nextValue(row.adjClose), 2);
        stock.sma10 = helper.round(sma10.nextValue(row.adjClose), 2);
        stock.close = helper.round(row.adjClose, 2);

        // diff between sma50 vs close
        stock.extra = helper.round((stock.close - stock.sma50) / stock.sma50 * 100, 2);
        stock.sma50df = helper.round((stock.close - stock.sma50) / stock.sma50 * 100, 2);
        stock.sma20df = helper.round((stock.close - stock.sma20) / stock.sma20 * 100, 2);
        stock.sma10df = helper.round((stock.close - stock.sma10) / stock.sma10 * 100, 2);        
      } else {
        stock.extra = 0;
      }

      // open/high/low/close
      stock.close = helper.round(row.adjClose, 2);
      stock.open = row.open;
      stock.high = row.high;
      stock.low = row.low;
      stock.vol = row.volume;
    });

    // fill data scan
    await stockcharts.fillDataScan(stock);

    // fill exchange
    await queryStockQuote(stock);

  } catch (err) {
    console.log(err.message);
    console.log(err.name);
    console.log(err.stack);
    stock.errmsg = "unable to locate history data";
  }

  return stock;
}

const queryMultipleStockQuote = async (stockCodes) => {
  var bars = [];
  var stockList = [];

  stockCodes.forEach(code => {
    var bar = new Promise((resolve, reject) => {
      var stock = {
        "symbol": code,
        "exchange": "NYQ,",
        "fullExchangeName":"NYSE",
        "errmsg":""
      }
      queryStockQuote(stock)
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

const queryStockQuote = async (stock) => {
  try {
    const stockQuote =  await yahooFinance.quote(stock.symbol,{ fields: [ "symbol", "exchange", "fullExchangeName", "quoteType", "longName"] });
    // console.log(stockQuote);
    stock.exchange = stockQuote.exchange;
    stock.fullExchangeName = stockQuote.fullExchangeName;
    stock.universe = stockQuote.quoteType;
    stock.name = stockQuote.longName;

    var tvExchange = config.tradingViewExchangeByKey(stock.exchange);
    if (! helper.isEmpty(tvExchange)) {
      var tradingViewCode = config.tradingViewCodeByKey(stock.symbol);

      if (tradingViewCode == null) {
        stock.tradingViewSymbol = tvExchange + ":" + stock.symbol;
      } else {
        stock.tradingViewSymbol = tvExchange + ":" + tradingViewCode;
      }
      
    } else {
      stock.errmsg = stock.exchange + " exchange mapping not found";
    }

    var stockCodeFromConfig = config.stockCodeByKey(stock.symbol);
    if (stockCodeFromConfig != null) {
      stock.symbol = stockCodeFromConfig;
    }

  } catch (err) {
    console.log(err.message);
    console.log(err.name);
    console.log(err.stack);
    stock.errmsg = "unable to locate exchange";
  }
  
  return stock;
}

module.exports = {
    queryMultipleStockTechIndicator,
    queryMultipleStockQuote
};