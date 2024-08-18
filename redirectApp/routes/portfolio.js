var express = require('express');
var router = express.Router();
var validator = require("isin-validator");
const helper = require('./helper.js');
const config = require('./config.js');
var axios = require('axios').default;
var axiosDebug = require('axios-debug-log/enable');
axios.defaults.timeout = 3000;

/*
 * main function
 */
router.get('/', function (req, res, next) {
    fillDataSync(true)
      .then(function (dataList) {
        res.json(dataList);
      });   
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

/**
 * 
 * @param {*} element 
 * @param {*} api 
 * @returns 
 */
const handleElement = async (element, api) => {
    var obj = new Object();

    obj.desc = element.desc;
    obj.chartDataSource = element.chartDataSource;
    obj.category = element.category

    if(helper.isEmpty(element.id)) {
        obj.data = element.data.split(",");
     } else if(api == true && ! helper.isEmpty(element.id)) {
        obj.data = await retrievePortfolioById(element.id) 
     } else {
        obj.data = element.data.split(",");
     }

     return obj;
}

/**
 * 
 * @param {*} id 
 * @returns 
 */
const retrievePortfolioById = async (id) => {
    var obj = await retrievePortfolioByIdWithLimit(id, 1);
    console.log(id + " records : " + obj.records);

    obj =  await retrievePortfolioByIdWithLimit(id, obj.records);
    return obj.dataRow;
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
const retrievePortfolioByIdWithLimit = async (id, limit) => {
    let object = new Object();
    var bars = [];

    var bar = new Promise((resolve, reject) => {
        axios.get("https://whalewisdom.com/filer/holdings", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
            },            
            params: {
                id: id,
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
                limit: limit
            }
        })
        .then(function (response) {
            var retObject = new Object();
            var i = 0;
            retObject.records = response.data.records;
            retObject.dataRow = [];

            response.data.rows.forEach(element => {
                if (validator(element.symbol)) {
                    retObject.dataRow[i++] = element.symbol;
                }
            });
            resolve(retObject);
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