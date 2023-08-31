const isSameDay = require('date-fns/isSameDay');
const sub = require('date-fns/sub');
const add = require('date-fns/add');

module.exports.isSameDay = (date1, date2) => {
  return isSameDay(date1, date2);
};

module.exports.subOneDay = (date) => {
  return sub(date, {days: 1});
};

module.exports.addOneDay = (date) => {
  return add(date, {days: 1});
};
