const authMiddleware = require('../middleware/authMiddleware');

module.exports.prepareV1Routes = (app) => {
  const prefix = '/api/v1/';

  const userRouter = require('../routes/userRouter');
  app.use(`${prefix}user`, userRouter);
  const organizationRouter = require('../routes/organizationRouter');
  app.use(`${prefix}organization`, authMiddleware, organizationRouter);
};
