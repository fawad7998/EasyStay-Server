const omit = require('lodash/omit');

const OrganizationModel = require('../models/organizationModel');

module.exports = class OrganizationController {
  constructor() {}

  static async create(data, user) {
    const organization = await OrganizationModel.create({
      ...data,
      creatorId: user.id,
      admins: [user.id],
    });

    const organizationObj = {
      id: organization._id,
      ...omit(organization.toJSON(), ['_id', '__v']),
    };
    return {
      success: true,
      organization: organizationObj,
    };
  }
};
