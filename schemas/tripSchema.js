const Yup = require('yup');

const objectsUtil = require('../util/objectsUtil');

const RECURRING_SCHEDULE_OPTIONS = ['M, W, F', 'T, TH, S', ''];

const commonSchema = {
  organizationId: Yup.string().required(),
  isRound: Yup.boolean().oneOf([true, false]),
  isRecurring: Yup.boolean().oneOf([true, false]),
  recurringSchedule: Yup.string().when('isRecurring', {
    is: true,
    then: Yup.string()
      .oneOf(RECURRING_SCHEDULE_OPTIONS)
      .required('Recurring schedule is required'),
  }),

  firstDate: Yup.date().required(),

  crewNotes: Yup.string(),
  internalNotes: Yup.string(),
};
const tripRequiredSchema = (trip) =>
  Yup.object().shape({
    pickupLocation: Yup.string().required(
      `trip${trip} Pickup location is required`
    ),
    dropoffLocation: Yup.string().required(
      `trip${trip} Drop-off location is required`
    ),
    pickupTime: Yup.string().required(`trip${trip} Pickup time is required`),
    dropoffTime: Yup.string().required(`trip${trip} Drop-off time is required`),
    mileage: Yup.string(),
    travelTime: Yup.string(),
    truck: Yup.string().required(`trip${trip} Truck is required`),
  });

const tripNotRequiredSchema = (trip) =>
  Yup.object().shape({
    pickupLocation: Yup.string(),
    dropoffLocation: Yup.string(),
    pickupTime: Yup.string(),
    dropoffTime: Yup.string(),
    mileage: Yup.string(),
    travelTime: Yup.string(),
    // TODO: add objectId validation
    truck: Yup.string(),
  });

module.exports.create = () => {
  const schema = Yup.object().shape({
    ...commonSchema,

    patientName: Yup.string().required('Trip name is required'),

    // TODO: recheck this to make sure it's supporting all the cases in the public API, and doesn't depend on Frontend validation
    tripA: Yup.object().when('isRound', {
      is: true,
      then: tripRequiredSchema('A'),
      otherwise: Yup.object().when('tripB', {
        is: (tripB) => objectsUtil.isEmpty(tripB),
        then: tripRequiredSchema('A'),
        otherwise: tripNotRequiredSchema('A').nullable(true),
      }),
    }),
    tripB: Yup.object().when('isRound', {
      is: true,
      then: tripRequiredSchema('B'),
      otherwise: Yup.object().when('tripA', {
        is: (tripA) => objectsUtil.isEmpty(tripA),
        then: tripRequiredSchema('B'),
        otherwise: tripNotRequiredSchema('B').nullable(true),
      }),
    }),
  });
  return schema;
};

module.exports.update = () => {
  const schema = Yup.object().shape({
    ...commonSchema,

    tripId: Yup.string().required('Trip id is required'),
    patientName: Yup.string().oneOf(
      [undefined],
      'Patient name can not be edited'
    ),

    // TODO: improve this validation to handle all possible cases
    tripA: Yup.object().when('isRound', {
      is: true,
      then: tripNotRequiredSchema('A'),
      otherwise: Yup.object().when('tripB', {
        is: null,
        then: tripRequiredSchema('A'),
        otherwise: tripNotRequiredSchema('A').nullable(true),
      }),
    }),
    tripB: Yup.object().when('isRound', {
      is: true,
      then: tripNotRequiredSchema('B'),
      otherwise: Yup.object().when('tripA', {
        is: null,
        then: tripNotRequiredSchema('B'),
        otherwise: tripNotRequiredSchema('B').nullable(true),
      }),
    }),
  });
  return schema;
};

module.exports.getAll = () => {
  const schema = Yup.object().shape({
    organizationId: Yup.string().required(),
  });
  return schema;
};

module.exports.delete = () => {
  const schema = Yup.object().shape({
    id: Yup.string().required(),
  });
  return schema;
};
