module.exports.validate = async (schema, data) => {
  return await schema
    .validate(data, {abortEarly: false})
    .then((parameters) => {
      return {parameters};
    })
    .catch((err) => {
      return {
        errors: err.errors.join(', '),
      };
    });
};
