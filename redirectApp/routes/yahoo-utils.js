const taIndicator = require('@debut/indicators');
const yahooFinance = require('yahoo-finance2').default;
const helper = require('./helper.js');
const stockcharts = require('./stockcharts-utils.js')
const config = require('./config.js');
const axios = require('axios').default;

// cookie
const path = require('path');
const os = require('os');
const ExtendedCookieJar = require('yahoo-finance2').ExtendedCookieJar;
const CookieFileStore = require('tough-cookie-file-store').FileCookieStore

/**
 * 
 * @param {*} targetDateStr 
 * @param {*} stockCodes 
 * @returns 
 */
const queryMultipleStockTechIndicator = async (stockCodes, taIndicatorStr) => {
  var bars = [];
  var stockList = [];
  var startDateStr = helper.determineTargetDateString(taIndicatorStr);
  console.log("startDate:" + startDateStr + " cgo:" + stockCodes);

  stockCodes.forEach(code => {
    var bar = new Promise((resolve, reject) => {
      var stock = {
        "fromDate": startDateStr,
        "symbol": code,
        "extra": -1,
        "errmsg":""
      }
      queryHistoryPrices(startDateStr, stock, taIndicatorStr)
        .then(function () {
          stockList.push(stock);
          resolve(stock);
        });
    });

    bars.push(bar);
  });

  await Promise.all(bars)
    .then((values) => {
      // console.log(values);
  });

  
  // Creating response object
  let responseJson = new Object();
  responseJson.stocks = stockList;

  return responseJson;
}
  
/**
 * 
 * @param {*} targetDateStr 
 * @param {*} stockCodeStr 
 * @returns 
 */
const queryHistoryPrices = async (startDateStr, stock, taIndicatorStr) => {
  try {
    // format query options
    const queryOptions = { period1: startDateStr, /* ... */ };
    const result = await yahooFinance.chart(stock.symbol, queryOptions);

    // fill tech indicator
    await calculateTechIndicator(result, stock, taIndicatorStr);

    // fill data scan from stockchart.com data scan
    await stockcharts.fillDataScan(stock);

    // fill exchange
    await queryStockQuote(stock);
  } catch (error) {
    console.warn(`Skipping queryHistoryPrices("${stock.symbol}"): [${error.name}] ${error.message}`);
    console.warn(error.stack);
    stock.errmsg = `unable to locate history data ${stock.symbol}`;
  }

  return stock;
}

/**
 * logic to calculatr ta
 * @param {} result 
 * @param {*} stock 
 * @param {*} taIndicatorStr 
 */
const calculateTechIndicator = async (result, stock, taIndicatorStr) => {
  // create tech indicator
  const rsi = new taIndicator.RSI(14);
  const roc = new taIndicator.ROC(12);
  const sma50 = new taIndicator.SMA(50);
  const sma20 = new taIndicator.SMA(20);
  const sma10 = new taIndicator.SMA(10);
  var lastQuote = null;
  var vpCandles = [];

  // calculate
  result.quotes.forEach((quote, idx) => {
    if (taIndicatorStr == "M12") {
      stock.extra = roc.nextValue(quote.close);
    } else if (taIndicatorStr == "B14") {
      stock.extra = rsi.nextValue(quote.close);
    } else if (taIndicatorStr == "S50DF") {
      sma(stock, sma50, sma20, sma10, quote);
    } else if (taIndicatorStr == "VP") {
      vpCandles.push(toCandle(quote));
    } else {
      stock.extra = 0;
    }

    lastQuote = quote;
  });

  // open/high/low/close
  stock.toDate = helper.formatDate(lastQuote.date, "YYYY-MM-DD");
  stock.close = helper.round(lastQuote.close, 2);
  stock.open = helper.round(lastQuote.open, 2);
  stock.high = helper.round(lastQuote.high, 2);
  stock.low = helper.round(lastQuote.low, 2);
  stock.vol = helper.round(lastQuote.volume, 2);

  // taIndicator
  stock.taIndicator = taIndicatorStr;
  stock.extra = helper.round(stock.extra, 2);
  doVolumeProfile();
}

function doVolumeProfile(stock, taIndicatorStr, vpCandles) {
  if (taIndicatorStr != "VP") {
    return;
  }

  const map1 = new Map();
  const vp = new taIndicator.VolumeProfile(1);
  for (const candle of vpCandles) {
    vp.nextValue(candle);
  }
  const vpSession = vp.getSession(vpCandles[vpCandles.length - 1]);
  vpSession.forEach((volume, price) => {
    map1[price] = volume;
  });

  console.log(map1);
}

function toCandle(quote) {
  var candle = new Object();
  candle.time = quote.date.getTime();
  candle.o = quote.open;
  candle.c = quote.close;
  candle.h = quote.high;
  candle.l = quote.low;
  candle.v = quote.volume;
  return candle;
}

/**
 * simple moving average and diff
 * @param {} stock 
 * @param {*} sma50 
 * @param {*} sma20 
 * @param {*} sma10 
 * @param {*} quote 
 */
const sma = async (stock, sma50, sma20, sma10, quote) => {
    // sma50
    stock.sma50 = helper.round(sma50.nextValue(quote.close), 2);
    stock.sma20 = helper.round(sma20.nextValue(quote.close), 2);
    stock.sma10 = helper.round(sma10.nextValue(quote.close), 2);
    stock.close = helper.round(quote.close, 2);

    // diff between sma50 vs close
    stock.extra = helper.round((stock.close - stock.sma50) / stock.sma50 * 100, 2);
    stock.sma50df = helper.round((stock.close - stock.sma50) / stock.sma50 * 100, 2);
    stock.sma20df = helper.round((stock.close - stock.sma20) / stock.sma20 * 100, 2);
    stock.sma10df = helper.round((stock.close - stock.sma10) / stock.sma10 * 100, 2);  
}

/**
 * 
 * @param {*} stockCodes 
 * @returns 
 */
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

/**
 * single quote
 * @param {*} stock 
 * @returns 
 */
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