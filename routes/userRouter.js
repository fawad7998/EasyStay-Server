const express = require('express');
const config = require('config');
const omit = require('lodash/omit');

const UserModel = require('../models/userModel');
const UserController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

const {
  userRegisteredRes,
  userLoggedInRes,
  recoveryEmailSentRes,
  passwordUpdatedSentRes,
  domainsUpdatedRes,
} = require('../values/responses');
const {
  internalErr,
  badRequestErr,
  userAlreadyRegisteredErr,
  wrongEmailOrPasswordErr,
  recoveryHashUpdateErr,
  recoveryHashValidateErr,
  updatePasswordErr,
  updatingDomadinsErr,
} = require('../values/errors');

const userRouter = express.Router();

userRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password -__v');
    return res.json({
      id: user._id,
      user: {
        ...omit(user.toJSON(), ['_id', '__v']),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(internalErr.code).json({...internalErr});
  }
});

userRouter.post('/register', async (req, res) => {
  try {
    const {errors} = await UserModel.validateCreateRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }

    let {email, password, name} = req.body;

    let user = await UserController.findUserByEmail({email});
    if (user)
      return res
        .status(userAlreadyRegisteredErr.code)
        .json({...userAlreadyRegisteredErr});

    const response = await UserController.registerUser(req.body);
    const {success, token} = response;

    if (!success) throw new Error('User registration failed');

    ({id, email, name} = response.user);
    return res.header(config.get('tokenVariable'), token).json({
      code: userRegisteredRes.code,
      message: userRegisteredRes.message,
      user: {
        id,
        email,
        name,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

userRouter.post('/login', async (req, res) => {
  try {
    const {errors} = await UserModel.validateLoginRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }

    let {email} = req.body;

    let user = await UserController.findUserByEmail({email});
    if (!user)
      return res
        .status(wrongEmailOrPasswordErr.code)
        .json({...wrongEmailOrPasswordErr});

    const response = await UserController.loginUser(req.body, user);
    const {success, wrongPassword, token} = response;

    if (wrongPassword)
      return res
        .status(wrongEmailOrPasswordErr.code)
        .json({...wrongEmailOrPasswordErr});

    if (!success) throw new Error('User login failed');

    const {name, photoURL, isAdmin, organizationName, phoneNumber, domains} =
      response.user;
    return res.header(config.get('tokenVariable'), token).json({
      code: userLoggedInRes.code,
      message: userLoggedInRes.message,
      user: {
        id: user.id,
        email,
        name,
        photoURL,
        isAdmin,
        organizationName,
        phoneNumber,
        domains,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

userRouter.post('/find', async (req, res) => {
  try {
    const {errors} = await UserModel.validateFindRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }

    let {email} = req.body;

    let user = await UserController.findUserByEmail({email});

    if (!user)
      return res
        .status(wrongEmailOrPasswordErr.code)
        .json({...wrongEmailOrPasswordErr});

    const {name, photoURL} = user;

    return res.status(userRegisteredRes.code).json({
      user: {email, name, photoURL},
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

userRouter.post('/sendRecovryEmail', async (req, res) => {
  try {
    const {errors} = await UserModel.validateFindRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }

    let {email} = req.body;

    let updateHash = await UserController.updateUserRecoveryHash({email});
    const {success, user} = updateHash;
    if (!success)
      return res
        .status(recoveryHashUpdateErr.code)
        .json({...recoveryHashUpdateErr});

    return res.status(recoveryEmailSentRes.code).json({
      ...recoveryEmailSentRes,
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

userRouter.post('/resetPassword', async (req, res) => {
  try {
    const {errors} = await UserModel.validateResetPasswordRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }

    let {userId, password, hash} = req.body;

    let validateRecoveryHash = await UserController.validateRecoveryHash({
      userId,
      hash,
    });

    if (!validateRecoveryHash)
      return res
        .status(recoveryHashValidateErr.code)
        .json({...recoveryHashValidateErr});

    let updateUserPassword = await UserController.updatePassword({
      userId,
      password,
    });

    if (!updateUserPassword)
      return res.status(updatePasswordErr.code).json({...updatePasswordErr});

    return res.status(passwordUpdatedSentRes.code).json({
      ...passwordUpdatedSentRes,
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

userRouter.post('/setDomains', authMiddleware, async (req, res) => {
  try {
    const {errors} = await UserModel.validateSetDomainsdRequest(req.body);
    if (errors) {
      return res
        .status(badRequestErr.code)
        .json({...badRequestErr, message: errors});
    }

    const reqUser = req.user;
    let {domains} = req.body;

    const response = await UserController.updateUserDomains({
      domains,
      userId: reqUser.id,
    });

    const {success, user} = response;

    if (!success)
      return res
        .status(updatingDomadinsErr.code)
        .json({...updatingDomadinsErr});

    return res.status(domainsUpdatedRes.code).json({
      ...domainsUpdatedRes,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(internalErr.code).json({...internalErr});
  }
});

module.exports = userRouter;
