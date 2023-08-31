const mongoose = require('mongoose');
const Yup = require('yup');

const Schema = mongoose.Schema;

const validatorUtil = require('../util/validatorUtil');

const organizationSchema = new Schema(
  {
    name: {type: String},
    creatorId: {type: 'ObjectId', required: true},
    admins: [{type: 'ObjectId', required: true}],
  },
  {timestamps: true}
);

organizationSchema.methods = {};

organizationSchema.statics = {
  validateCreateRequest: function (organization) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    return validatorUtil.validate(schema, organization);
  },
};

module.exports = mongoose.model('Organization', organizationSchema);
