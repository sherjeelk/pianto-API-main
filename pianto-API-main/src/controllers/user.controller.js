const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models')
const { userService, tokenService, emailService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const searchUserList = catchAsync(async (req, res) => {
  const body = req.body;
  const query = [];
  if (body){
    if (body.length > 0){
      for (const  item of body){
        const search = {};
        const key = Object.keys(item)[0];
        search[key] = {$regex: item[key], $options: "i" };
        query.push(search);
      }
    }
  }
  const users = query.length === 0 ? await User.find() : await User.find({$and: query});
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users with this query not found');
  }
  res.send(users);
});


const updateUser = catchAsync(async (req, res) => {
  console.log('update user Called');
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const isExist = catchAsync(async (req, res) => {
  console.log('update user Called');
  const user = await User.findOne({email: req.params.email});

  if (user && !user.used){
    const resetPasswordToken = await tokenService.generateResetPasswordToken(req.params.email);
    await emailService.sendWelcomeEmail(req.params.email, resetPasswordToken);
  }
  res.send({status: user ? 1 : 0, msg: user ? 'User already exist' : 'User does not exists!', exists: !!user, used: user ? user.used : false, id: user ? user.id : '-1'});
});

const updateToken = catchAsync(async (req, res) => {
  console.log('update token Called', req.params.id, req.body.fcmToken);
  const user = await userService.getUserById(req.params.id);
  console.log('User', user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.fcmToken = req.body.fcmToken;
  await user.save();
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  updateToken,
  getUsers,
  searchUserList,
  getUser,
  updateUser,
  deleteUser,
  isExist,
};
