const yaml = require('js-yaml');
const fs   = require('fs');

var doc = new Object();

// Get document, or throw exception on error
try {
  doc = yaml.load(fs.readFileSync('./config.yml', 'utf8'));
  // console.log(doc);  
} catch (e) {
  console.log(e);
}

const read = () => {
    return doc;
}

const breadthByKey = (key) => {
  var breadth = null;
  doc.indexes.forEach(element => {
    if(key.includes(element.name)) {
      breadth = element.breadth;
    }
    });
  return breadth;  
}

const tradingViewExchangeByKey = (key) => {
  var exchange = null;
  doc.exchanges.forEach(element => {
    if(key.includes(element.name)) {
      exchange = element.tradingView;
    }
    });
  return exchange;  
}

module.exports = {
    read,
    breadthByKey,
    tradingViewExchangeByKey
};