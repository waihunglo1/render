const moment = require('moment');

const isEmpty = (str) => {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "")
        return true;
    else
        return false;
}

const determineDays = (taIndicatorStr) => {
    var days = 25;
    if (taIndicatorStr == "S50DF") {
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
    return +Number(Math.round(n) / p).toFixed(2);
}

const isValidIsinCode = (isin_code) => {
    // Regex to check valid
    // ISIN CODE
    let regex = new RegExp(/^[A-Z]{2}[-]{0, 1}[0-9A-Z]{8}[-]{0, 1}[0-9]{1}$/);

    console.log(isin_code + ":" + regex.test(isin_code));
 
    // ISIN CODE
    // is empty return false
    if (isin_code == null) {
        return "false";
    }
 
    // Return true if the isin_code
    // matched the ReGex
    if (regex.test(isin_code) == true) {
        return "true";
    }
    else {
        return "false";
    }
}
 
module.exports = {
    determineDays,
    round,
    isEmpty,
    isValidIsinCode
};