var express = require('express');
var router = express.Router();

/**
 * main function
 */
router.get('/', function (req, res, next) {
    var hc = {
        "health": "yes"
      }

    res.json(hc);
});

module.exports = router;