var express = require('express');
var router = express.Router();
var validator = require("isin-validator");
const helper = require('./helper.js');
const config = require('./config.js');
var axios = require('axios').default;
var axiosDebug = require('axios-debug-log/enable');

/*
 * main function
 */
router.get('/', function (req, res, next) {
    fillDataSync()
      .then(function (dataList) {
        res.json(dataList);
      });   


    // return res.json(responseJson);
});

/**
 * 
 * @returns 
 */
const fillDataSync = async () => {
    var portfolios = config.retrievePortfolios();
    var dataList = [];

    await Promise.all(portfolios.map(async (elem) => {
        try {
          let portfolio = await handleElement(elem)  
          dataList.push(portfolio)
        } catch (error) {
          console.log('error'+ error);
        }
    }));

    return dataList;
}

const handleElement = async (element) => {
    var obj = new Object();

    obj.desc = element.desc;
    obj.chartDataSource = element.chartDataSource;
    obj.category = element.category

    if(! helper.isEmpty(element.dataUrl)) {
        obj.data = await fillData(element.dataUrl) 
     } else {
         obj.data = element.data.split(",");
     }

     return obj;
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
const fillData = async (dataUrl) => {
    console.log(dataUrl);
    let object = new Object();
    var bars = [];

    var bar = new Promise((resolve, reject) => {
        axios.get(dataUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
            },            
            params: {
            }
        })
        .then(function (response) {
            var row = [];
            var i = 0;
            response.data.forEach(element => {
                if (validator(element.name)) {
                    row[i++] = element.name;   
                }
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
        console.log(values);
        object = values[0];
    });    

    return object;
}

module.exports = router;