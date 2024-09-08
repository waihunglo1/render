const axios = require('axios').default;
const config = require('./config.js');
const helper = require('./helper.js');

/**
 * 
 * @param {*} stock 
 */
const fillDataScan = async (stock) => {
    var breadth = config.breadthByKey(stock.symbol);
    if(! helper.isEmpty(breadth)) {
        const resolvedPromise = new Promise((resolve, reject) => {
            var stockCodes = breadth.split(",");
            var row = queryStockChartsDataScan(stockCodes,"M12");
            stock.breadthSymbols = stockCodes;
            resolve(row);
        });

        await Promise.all([resolvedPromise]).then((result) => {
            var row = result[0];
            Object.keys(row).forEach(function(key) {
                stock[key] = row[key];
            });    
        }); 
    }
}

 /**
 * 
 * @param {*} stockCodes 
 * @param {*} taIndicatorStr 
 */  
const queryStockChartsDataScan = async (stockCodes, taIndicatorStr) => {
    const scanDataUrl = "https://stockcharts.com/def/servlet/SC.uscan";
    const stockCodesStr = stockCodes.join(",") + "|" + taIndicatorStr;
    let object = new Object();
    var bars = [];

    var bar = new Promise((resolve, reject) => {
        axios.get(scanDataUrl, {
            params: {
                cgo: stockCodesStr,
                p: "1",
                format: "json",
                order: "a"
            }
        })
        .then(function (response) {
            var row = {};
            response.data.stocks.forEach(element => {
                var numb = element.symbol.match(/\d+/g);
                var i = element.symbol.indexOf(numb.join(""));
                var key = element.symbol.substring(i-1);
                row[key] = helper.round(element.close, 2);
            });
            resolve(row);
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
    });

    bars.push(bar);

    await Promise.all(bars)
      .then((values) => {
        // console.log(values);
        object = values[0];
    });    

    return object;
}
 
module.exports = {
    fillDataScan
};