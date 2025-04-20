const axios = require('axios').default;
const config = require('./config.js');
const helper = require('./helper.js');


const sctr = async(sizeOfCorp) => {
    const resolvedPromise = new Promise((resolve, reject) => {
        var row = retrieveStockChartSCTR(sizeOfCorp);
        resolve(row);
    });

    let object = new Object();
    await Promise.all([resolvedPromise])
      .then((values) => {
        // console.log(values);
        object = values[0];
    });    

    return object;
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
const retrieveStockChartSCTR = async (sizeOfCorp) => {
    let object = new Object();
    var bars = [];

    var bar = new Promise((resolve, reject) => {
        axios.get("https://stockcharts.com/j-sum/sum", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
            },            
            params: {
                cmd: "sctr",
                view: sizeOfCorp,
                timeframe: "E",
                r: 1745130832563
            }
        })
        .then(function (response) {
            var retObject = new Object();
            retObject.data = response.data;
            resolve(retObject);
        })
        .catch(function (error) {
            console.log(error);
            resolve(null);
        })
        .finally(function () {
            // always executed
        });
    });

    bars.push(bar);

    await Promise.all(bars)
      .then((values) => {
        console.log(values);
        object = values[0];
    });    

    return object;
}

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
    fillDataScan,
    sctr
};