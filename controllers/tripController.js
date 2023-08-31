const conn = require('../models'); // import connection
const TripModel = require('../models/tripModel');

const objectsUtil = require('../util/objectsUtil');
const timeUtil = require('../util/timeUtil');

const {OPERATIONS_TYPES} = require('../values/constants');

module.exports = class OrganizationController {
  constructor() {}

  static async create(data) {
    let createResponse = await performTripTransactions([
      {
        type: OPERATIONS_TYPES.create,
        data: TripModel.cleanTripObject(data),
      },
    ]);

    if (createResponse.success)
      return {
        success: true,
        trip: createResponse.trips[0],
      };
    else {
      return {
        success: false,
        error: createResponse.error,
      };
    }
  }

  static async getAllByOrganizationId({organizationId}) {
    let trips = await TripModel.find({organizationId});

    const tripsArr = trips.map((trip) => TripModal.formatTrip(trip.toJSON()));
    return {
      success: true,
      trips: [...tripsArr],
    };
  }

  static async delete({id}) {
    const deletedTrip = await TripModel.findByIdAndDelete(id);

    if (deletedTrip)
      return {
        success: true,
        trip: TripModal.formatTrip(deletedTrip.toJSON()),
      };
    else
      return {
        success: false,
      };
  }

  static async getById({id}) {
    const trip = await TripModel.findById(id);

    if (trip)
      return {
        success: true,
        trip: TripModal.formatTrip(trip.toJSON()),
      };
    else
      return {
        success: false,
      };
  }

  static async update(data) {
    let responseObj = {};

    const newTrip = TripModel.cleanTripObject(data);
    const {tripId: id} = newTrip;

    const session = await conn.startSession();
    try {
      session.startTransaction();

      const originalTripRes = await this.getById({id});
      const originalTrip = originalTripRes.trip;

      let trips = await getTripsArray({originalTrip, newTrip});

      let returnTrips = [];
      for (let i in trips) {
        const trip = trips[i];

        let singleTrip = null;

        const tripData = trip.data;

        if (trip.isCreate) {
          singleTrip = await TripModel.create([tripData], {
            session,
          });
          returnTrips.push(TripModal.formatTrip(singleTrip[0].toJSON()));
        } else {
          singleTrip = await TripModel.findOneAndUpdate({_id: id}, tripData, {
            session,
            returnDocument: 'after',
          });
          returnTrips.push(TripModal.formatTrip(singleTrip.toJSON()));
        }
      }

      await session.commitTransaction();
      responseObj = {
        success: true,
        trips: returnTrips,
      };
    } catch (error) {
      await session.abortTransaction();
      responseObj = {
        success: false,
      };
    }
    session.endSession();

    return responseObj;
  }
};

const performTripTransactions = async (operations) => {
  let responseObj = {};
  let returnTrips = [];

  const session = await conn.startSession();
  try {
    session.startTransaction();

    for (let i in operations) {
      const operation = operations[i];
      let singleTrip = null;

      const {type, data} = operation;

      if (type === OPERATIONS_TYPES.create) {
        singleTrip = await TripModel.create([data], {
          session,
        });

        returnTrips.push(TripModel.formatTrip(singleTrip[0].toJSON()));
      } else if (type === OPERATIONS_TYPES.update) {
        singleTrip = await TripModel.findOneAndUpdate({_id: id}, data, {
          session,
          returnDocument: 'after',
        });
        returnTrips.push(TripModel.formatTrip(singleTrip.toJSON()));
      }
    }

    await session.commitTransaction();
    responseObj = {
      success: true,
      trips: returnTrips,
    };
  } catch (error) {
    await session.abortTransaction();
    responseObj = {
      success: false,
      error,
    };
  }
  session.endSession();

  return responseObj;
};

const getTripsArray = ({originalTrip, newTrip = {}}) => {
  const dates = calculateDates(originalTrip, newTrip);

  const difference = extractUpdatedInfo({
    originalTrip,
    newTrip,
  });

  const newObject = getNewTripObject({originalTrip, difference});
  const originalObject = getOriginalTripObject({originalTrip});

  const trips = [];

  const newStartSameOriginalStart = timeUtil.isSameDay(
    dates.newStart,
    dates.originalStart
  );

  // TODO: handle if newStart is before originalStart, it will be an error
  // if new start is same as original start
  if (newStartSameOriginalStart) {
    // update original trip - originalStart - new info
    trips.push({
      isCreate: false,
      data: {
        ...newObject,
      },
    });
  } else {
    // If it's a single trip, updated to single trip
    // just update the dates and whatever new info
    if (!originalObject.isRecurring && !newObject.isRecurring) {
      // update original trip - originalStart  - new info
      trips.push({
        isCreate: false,
        data: {
          ...newObject,
          firstDate: dates.newStart,
        },
      });
    } else {
      // update original trip - originalStart, newStartMinus1  - original info
      trips.push({
        isCreate: false,
        data: {
          ...originalObject,
          endDate: dates.newStartMinus1,
        },
      });

      // create new trip - newStart - new info
      trips.push({
        isCreate: true,
        data: {
          ...newObject,
          firstDate: dates.newStart,
        },
      });
    }
  }
  // If it was changed from recurring to non-recurring, original trip was already updated above and that included the non recurring part
  // Now will need to create another trip after it to include the recurring part start the next day
  // and create another one the recurring that starts the next day
  // Create new trip - newStartPlus1 - original info
  if (originalObject.isRecurring && !newObject.isRecurring)
    trips.push({
      isCreate: true,
      data: {
        ...originalObject,
        firstDate: dates.newStartPlus1,
      },
    });

  return trips;
};

const calculateDates = (
  {firstDate: originalStart},
  {firstDate: newStart} = {}
) => {
  newStart = new Date(newStart);

  const newStartMinus1 = timeUtil.subOneDay(newStart);
  const newStartPlus1 = timeUtil.addOneDay(newStart);

  return {
    originalStart,
    newStart,
    newStartMinus1,
    newStartPlus1,
  };
};

const extractUpdatedInfo = ({originalTrip, newTrip = {}}) => {
  const ignoredFields = ['organizationId', 'tripId', 'firstDate'];
  const difference = objectsUtil.difference({
    object: newTrip,
    base: originalTrip,
    ignoredFields,
  });

  return difference;
};

const getOriginalTripObject = ({originalTrip}) => {
  let originalObject = {
    ...originalTrip,
  };
  originalObject = TripModel.convertObjectIdsToString(originalObject);

  return originalObject;
};

const getNewTripObject = ({originalTrip, difference = {}}) => {
  const tripAEdits = difference.tripA ? difference.tripA : {};
  const tripBEdits = difference.tripB ? difference.tripB : {};
  const tripA =
    !originalTrip.tripA && !difference.tripA
      ? null
      : {
          ...originalTrip.tripA,
          ...tripAEdits,
        };
  const tripB =
    !originalTrip.tripB && !difference.tripB
      ? null
      : {
          ...originalTrip.tripB,
          ...tripBEdits,
        };

  let newObject = {
    ...originalTrip,
    ...difference,
    tripA: tripA,
    tripB: tripB,
  };

  newObject = TripModel.convertObjectIdsToString(newObject);

  return newObject;
};
