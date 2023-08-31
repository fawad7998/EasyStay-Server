const omit = require('lodash/omit');

const UserModel = require('../models/userModel');
const passwordsUtil = require('../util/passwordsUtil');
const {v4: uuid} = require('uuid');

module.exports = class UserController {
  constructor() {}

  static async findUserByEmail({email}) {
    email = email.toLowerCase();
    let user = await UserModel.findOne({email});
    return user;
  }

  static async registerUser(data) {
    let user = new UserModel(data);

    user.email = user.email.toLowerCase();
    user.password = await passwordsUtil.saltHashPassword(user.password);

    await user.save();

    const token = await user.generateAuthToken();

    const userObj = {
      id: user._id,
      ...omit(user.toJSON(), ['_id', '__v']),
    };

    return {
      success: true,
      user: userObj,
      token,
    };
  }

  static async loginUser(reqBody, user) {
    const isCorrectPassword = await passwordsUtil.verify(
      reqBody.password,
      user.password
    );

    if (isCorrectPassword) {
      const token = await user.generateAuthToken();
      return {
        success: true,
        user,
        token,
      };
    } else {
      return {
        wrongPassword: true,
      };
    }
  }

  static async updateUserRecoveryHash({email}) {
    try {
      const recoveryHash = uuid();
      const updateUserRecoveryHash = await UserModel.findOneAndUpdate(
        {email},
        {recoveryHash}
      );

      if (!updateUserRecoveryHash) {
        return {
          success: false,
        };
      } else {
        return {
          success: true,
          user: updateUserRecoveryHash,
        };
      }
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  static async validateRecoveryHash({userId, hash}) {
    const findUser = await UserModel.findById(userId);
    if (findUser.recoveryHash == hash) return true;
    else return false;
  }

  static async updatePassword({userId, password}) {
    const encryptedPassword = await passwordsUtil.saltHashPassword(password);
    const updatePassword = await UserModel.findOneAndUpdate(
      {_id: userId},
      {password: encryptedPassword}
    );
    if (updatePassword) return true;
    else return false;
  }

  static async updateUserDomains({userId, domains}) {
    try {
      const updateUserDomains = await UserModel.findByIdAndUpdate(
        userId,
        {
          domains,
        },
        {new: true}
      );

      const userObj = {
        id: updateUserDomains._id,
        ...omit(updateUserDomains.toJSON(), ['_id', '__v', 'password']),
      };

      if (!updateUserDomains) {
        return {
          success: false,
        };
      } else {
        return {
          success: true,
          user: userObj,
        };
      }
    } catch (error) {
      return {
        success: false,
      };
    }
  }
};
