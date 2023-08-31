const config = require('config');

const jwtUtil = require('../util/jwtUtil');
const {invalidTokenErr} = require('../values/errors');

module.exports = (req, res, next) => {
  const header = req.header(config.get('tokenVariable'));
  const token = jwtUtil.verify(header);
  if (token) {
    req.user = token;
    next();
  } else {
    res.status(invalidTokenErr.code).json({...invalidTokenErr});
  }
};
