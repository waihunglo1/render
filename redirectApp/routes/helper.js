const moment = require('moment');
var fincal = require("fincal");

const isEmpty = (str) => {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "")
        return true;
    else
        return false;
}

const determineTargetDateString = (taIndicatorStr) => {
    var days = 25;
    if (taIndicatorStr == "S50DF") {
      days = 80;    
    }
    else if (taIndicatorStr == "VP") {
        days = 150;    
    }
  
    // Calendar class
    var hkCalendar = fincal.calendar("hong_kong");
    var previousTradingDate = hkCalendar.previousTradingDay(moment(), "YYYY-MM-DD");
    var targetDate = moment(previousTradingDate).subtract(days, "days");
    var targetTradingDate = hkCalendar.previousTradingDay(targetDate, "YYYY-MM-DD");
    var formattedTargetTradingDate = targetTradingDate.format("YYYY-MM-DD");

    // console.log(hkCalendar.name); // > "New York"
    // console.log(hkCalendar.locale); // > [Object]
    console.log("date range: " + formatDate(previousTradingDate,"YYYY-MM-DD") + " to " + formattedTargetTradingDate); 

    return {
        startDate: formattedTargetTradingDate,
        endDate:   formatDate(previousTradingDate,"YYYY-MM-DD")
    };
}

const formatDate = (sourceDate, formatStr) => {
    return moment(sourceDate).format(formatStr);
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
    determineTargetDateString,
    round,
    isEmpty,
    isValidIsinCode,
    formatDate
};