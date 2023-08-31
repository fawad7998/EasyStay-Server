const mongoose = require('mongoose');
const Yup = require('yup');

const Schema = mongoose.Schema;

const variationsSchema = new Schema({
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  areaUnit: {
    type: String,
    required: true,
  },
  areaMeasurement: {
    type: Number,
    required: true,
  },
});

const roomSchema = new Schema(
  {
    propertyId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      minlength: 4,
      maxlength: 255,
    },
    coverImage: {
      type: String,
      required: false,
    },
    pictureOfRooms: {
      type: [String],
      required: true,
    },
    totalQuantity: {
      type: Number,
      require: false,
    },
    variations: {
      type: [variationsSchema],
      required: true,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model('Rooms', roomSchema);
