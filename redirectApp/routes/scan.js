var express = require('express');
const helper = require('./helper.js');
const config = require('./config.js');
const stockcharts = require('./stockcharts-utils.js')
var router = express.Router();


/**
 * main function
 */
router.get('/', function (req, res, next) {
    const cgo = req.query.cgo;
    var stockCodes = [];
    var taIndicatorStr = "M12";
    if (!helper.isEmpty(cgo)) {
      stockCodes = cgo.split("|")[0].split(",");
      taIndicatorStr = cgo.split("|")[1];

      stockcharts.queryDataScan(stockCodes, taIndicatorStr)
        .then(function (row) {
          res.json(row);
        });      
    }   
  });

module.exports = router;