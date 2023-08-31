const jwt = require('jsonwebtoken');
const config = require('config');

module.exports.sign = (obj) => {
  const token = jwt.sign(obj, 'ac0700');
  return token;
};

module.exports.verify = (token) => {
  try {
    const decodedObj = jwt.verify(token, 'ac0700');
    return decodedObj;
  } catch (err) {
    return false;
  }
};
