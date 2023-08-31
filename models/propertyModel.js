const mongoose = require('mongoose');
const Yup = require('yup');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  locationUrl: {
    type: String,
    required: true,
  },
});

const sizeSchema = new Schema({
  unit: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
});

const amenitiesSchema = new Schema({
  general: {
    type: [String],
    required: true,
  },
  safety: {
    type: [String],
    required: false,
  },
  other: {
    type: [String],
    required: false,
  },
});

const pricingSchema = new Schema({
  frequency: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  minimumAmount: {
    type: Number,
    required: false,
  },
  maximumAmount: {
    type: Number,
    required: false,
  },
});

const faqSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const usersSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String, // admin, editor, viewer
    required: true,
  },
});

const propertySchema = new Schema(
  {
    users: {
      type: [usersSchema],
      required: true,
    },
    type: {
      type: String, // Hotel, Cottage, Farm Stay, Hostel
      required: true,
      minlength: 4,
      maxlength: 255,
    },
    propertyName: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 2048,
    },
    rentalForm: {
      type: String, // Entire Place, Saperate Room, Share Room
      minlength: 4,
      maxlength: 255,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    size: {
      type: sizeSchema,
      required: true,
    },
    amenities: {
      type: amenitiesSchema,
      required: true,
    },
    additionalRules: {
      type: [String],
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: true,
    },
    picturesOfPlaces: {
      type: [String],
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    minStay: {
      type: Number,
      required: false,
    },
    maxStay: {
      type: Number,
      required: false,
    },
    faqs: {
      type: [faqSchema],
      required: false,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model('Properties', propertySchema);
