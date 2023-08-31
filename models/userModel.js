const mongoose = require('mongoose');
const Yup = require('yup');

const jwtUtil = require('../util/jwtUtil');
const validatorUtil = require('../util/validatorUtil');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 2048,
    },
    name: {
      type: String,
      minlength: 4,
      maxlength: 255,
    },
    city: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
      require: false,
      default:
        'https://cdn.pixabay.com/photo/2017/06/21/07/51/icon-2426371_960_720.png',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    organizationName: {
      type: String,
      required: false,
    },
    recoveryHash: {
      type: String,
      required: false,
    },
    domains: {
      type: [String],
      required: false,
    },
  },
  {timestamps: true}
);

userSchema.methods = {
  generateAuthToken: function () {
    const token = jwtUtil.sign({
      id: this._id,
      email: this.email,
    });

    return token;
  },
};

userSchema.statics = {
  validateCreateRequest: function (user) {
    const schema = Yup.object().shape({
      email: Yup.string().min(4).max(255).required().email(),
      password: Yup.string().min(6).max(255).required(),
      name: Yup.string().min(4).max(255).required(),
      city: Yup.string().min(4).max(255),
      phoneNumber: Yup.string()
        .matches(/^[0-9]+$/, 'Must be only digits')
        .min(11, 'Phone Number Must be exactly 11 digits')
        .max(11, 'Phone Number Must be exactly 11 digits'),
      organizationName: Yup.string().when('isAdmin', {
        is: true,
        then: Yup.string().required(),
        otherwise: Yup.string(),
      }),
    });

    return validatorUtil.validate(schema, user);
  },
  validateLoginRequest: function (user) {
    const schema = Yup.object().shape({
      email: Yup.string().min(4).max(255).required().email(),
      password: Yup.string().min(6).max(255).required(),
    });

    return validatorUtil.validate(schema, user);
  },
  validateFindRequest: function (user) {
    const schema = Yup.object().shape({
      email: Yup.string().min(4).max(255).required().email(),
    });

    return validatorUtil.validate(schema, user);
  },
  validateResetPasswordRequest: function (user) {
    const schema = Yup.object().shape({
      userId: Yup.string().required(),
      password: Yup.string().min(6).max(255).required(),
      hash: Yup.string().required(),
    });

    return validatorUtil.validate(schema, user);
  },
  validateSetDomainsdRequest: function (user) {
    const schema = Yup.object().shape({
      domains: Yup.array().of(Yup.string()).required(),
    });
    return validatorUtil.validate(schema, user);
  },
};

module.exports = mongoose.model('Users', userSchema);
