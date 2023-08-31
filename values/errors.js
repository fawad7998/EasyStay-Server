module.exports.internalErr = {
  code: 500,
  message: 'Internal error',
};

module.exports.invalidTokenErr = {
  code: 400,
  message: 'invalid token',
};

module.exports.badRequestErr = {
  code: 400,
  message: 'bad request',
};

module.exports.userAlreadyRegisteredErr = {
  code: 400,
  message: 'User already registered',
};

module.exports.wrongEmailOrPasswordErr = {
  code: 400,
  message: 'Wrong email or password',
};

module.exports.recoveryHashUpdateErr = {
  code: 400,
  message: 'Error updating recovery hash',
};

module.exports.recoveryHashValidateErr = {
  code: 400,
  message: 'Error validating recovery hash',
};

module.exports.updatePasswordErr = {
  code: 400,
  message: 'Error while updating password',
};

module.exports.updatingDomadinsErr = {
  code: 400,
  message: 'Error while setting up domains',
};
