const express = require('express');

const OrganizationModel = require('../models/organizationModel');
const OrganizationController = require('../controllers/organizationController');

const {orgCreatedRes} = require('../values/responses');
const {internalErr, badRequestErr} = require('../values/errors');

const OrganizationRouter = express.Router();

OrganizationRouter.post('/', async (req, res) => {
  try {
    const {errors} = await OrganizationModel.validateCreateRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }
    const response = await OrganizationController.create(req.body, req.user);
    const {success, organization} = response;

    // TODO: check for existing organization with same name for same user

    if (!success) throw new Error('Organization creation failed');

    return res.json({
      code: orgCreatedRes.code,
      message: orgCreatedRes.message,
      organization,
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

module.exports = OrganizationRouter;
