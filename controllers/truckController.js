const omit = require('lodash/omit');
const TruckModel = require('../models/truckModel');

module.exports = class OrganizationController {
  constructor() {}

  static async create(data) {
    const truck = await TruckModel.create(data);

    const truckObj = {
      id: truck._id,
      ...omit(truck.toJSON(), ['_id', '__v']),
    };

    return {
      success: true,
      truck: truckObj,
    };
  }

  static async getAllByOrganizationId({organizationId}) {
    let trucks = await TruckModel.find({organizationId});

    const trucksArr = trucks.map((truck) => ({
      id: truck._id,
      ...omit(truck.toJSON(), ['_id', '__v ']),
    }));

    return {
      success: true,
      trucks: [...trucksArr],
    };
  }

  static async delete({id}) {
    const deletedTruck = await TruckModel.findByIdAndDelete(id);

    if (deletedTruck) {
      const truckObj = {
        id: deletedTruck._id,
        ...omit(deletedTruck.toJSON(), ['_id', '__v']),
      };

      return {
        success: true,
        truck: truckObj,
      };
    } else
      return {
        success: false,
      };
  }
};
