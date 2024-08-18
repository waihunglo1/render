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
    const api = req.query.api;
    if (!helper.isEmpty(api)) {
      fillDataSync(true)
        .then(function (dataList) {
          res.json(dataList);
        });   
    } else {
      fillDataSync(false)
        .then(function (dataList) {
          res.json(dataList);
        }); 
    }
  


    // return res.json(responseJson);
});

/**
 * 
 * @returns 
 */
const fillDataSync = async (api) => {
    var portfolios = config.retrievePortfolios();
    var dataList = [];

    await Promise.all(portfolios.map(async (elem) => {
        try {
          let portfolio = await handleElement(elem, api)  
          dataList.push(portfolio)
        } catch (error) {
          console.log('error'+ error);
        }
    }));

    var obj = new Object;
    obj.data = dataList;
    return obj;
}

const handleElement = async (element, api) => {
    var obj = new Object();

    obj.desc = element.desc;
    obj.chartDataSource = element.chartDataSource;
    obj.category = element.category

    if(helper.isEmpty(element.dataUrl)) {
        obj.data = element.data.split(",");
     } else if(api == true && ! helper.isEmpty(element.dataUrl)) {
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

    https://whalewisdom.com/filer/holdings?
    


    var bar = new Promise((resolve, reject) => {
        axios.get("https://whalewisdom.com/filer/holdings", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
            },            
            params: {
                id: "duquesne-family-office-llc",
                q1: -1,
                type_filter: "1,2,3,4",
                symbol: "",
                change_filter: "",
                minimum_ranking: "",
                minimum_shares: "",
                is_etf: 0,
                sc: false,
                sort: "current_mv",
                order: "desc",
                offset: "",
                limit: 1
            }
        })
        .then(function (response) {
            var dataRow = [];
            var i = 0;
            // console.log(response);
            console.log("record : " + response.data.records);

            response.data.rows.forEach(element => {
                if (validator(element.symbol)) {
                    dataRow[i++] = element.symbol;
                }
            });
            resolve(dataRow);
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