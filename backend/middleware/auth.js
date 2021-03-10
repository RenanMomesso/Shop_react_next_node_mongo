const catchAsyncErrors = require("./catchAsynError");
const errorHandler = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

//Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if(!token){
      return next(new errorHandler("Login first to acess this resource", 401))
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  console.log(req.user)
  next()
});
