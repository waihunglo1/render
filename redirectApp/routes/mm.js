var express = require('express');
var router = express.Router();
const helper = require('./helper.js');
const mmutils = require('./mm-utils.js');

/**
 * extract stock codes from excel
 */
router.get('/index', function (req, res, next) {
    mmutils.queryExcelView()
        .then(function (data) {
            res.json(data);
        });
});

module.exports = router;