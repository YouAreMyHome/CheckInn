
const User = require('../models/User.model');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { sendResponse } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  sendResponse(res, statusCode, true, 'Success', {
    token,
    refreshToken,
    user,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  // 1) Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists.', 400));
  }

  // 2) Create new user
  const newUser = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  // 3) Generate token and send response
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.getMe = (req, res) => {
  // The user is already available in req.user from the protect middleware
  sendResponse(res, 200, true, 'User data retrieved successfully', { user: req.user });
};
