const isEqual = require('lodash/fp/isEqual');
const isObject = require('lodash/fp/isObject');
const reduce = require('lodash/reduce');

function difference({object, base, ignoredFields = []}) {
  return reduce(
    object,
    (result, value, key) => {
      if (!isEqual(value, base[key]) && ignoredFields.indexOf(key) === -1) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? difference({object: value, base: base[key], ignoredFields})
            : value;
      }
      return result;
    },
    {}
  );
}

function isEmpty(object) {
  return (
    object === undefined ||
    object === null ||
    (Object.keys(object).length === 0 && object.constructor === Object)
  );
}

function checkTripNull(trip) {
  const isTripANull = isEmpty(trip.tripA);
  const isTripBNull = isEmpty(trip.tripB);

  return {isTripANull, isTripBNull};
}

module.exports.difference = difference;
module.exports.isEmpty = isEmpty;
module.exports.checkTripNull = checkTripNull;
