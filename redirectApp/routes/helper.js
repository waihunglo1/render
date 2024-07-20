const moment = require('moment');

const isEmpty = (str) => {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "")
        return true;
    else
        return false;
}

const determineDays = (taIndicatorStr) => {
    var days = 25;
    if (taIndicatorStr == "S50") {
      days = 80;    
    }
    var targetDate = moment().subtract(days, "days");
    var todayStr = targetDate.format("YYYY-MM-DD");
    return todayStr;
}
  
/**
 * Round half away from zero ('commercial' rounding)
 * Uses correction to offset floating-point inaccuracies.
 * Works symmetrically for positive and negative numbers.
 */
const round = (num, decimalPlaces = 0) => {
    var p = Math.pow(10, decimalPlaces);
    var n = (num * p) * (1 + Number.EPSILON);
    return Math.round(n) / p;
} 
 
module.exports = {
    determineDays,
    round,
    isEmpty
};