const User = require("../models/user");
const catchAsynError = require("../middleware/catchAsynError");
const errorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const {v2} = require('cloudinary')

exports.registerUser = catchAsynError(async (req, res, next) => {
  console.log(req.body)
 
//const result = await v2.uploader.upload("etc")
//console.log(result)

//  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
//    folder:'samples',
//    width:150,
//    crop:"scale"
//  })

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    
  });

  sendToken(user, 200, res);
});
// Login user  => api/v1/login
exports.loginUser = catchAsynError(async (req, res, next) => {
  const { email, password } = req.body;

  // checks if email and password is entered by user
  if (!email || !password) {
    return next(new errorHandler("Please enter email & password", 400));
  }

  //finding user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new errorHandler("Invalid email or password", 401));
  }

  //checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new errorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Logout user => /api/v1/logout
exports.logout = catchAsynError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out.",
  });
});

exports.authorizeRules = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    console.log(!roles.includes(req.user.roles));
    next();
  };
};

exports.forgotPassword = catchAsynError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new errorHandler("User not found with this email", 404));
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log("RESTPASSWORD", user);

  await user.save({ validateBeforeSave: false });

  // Create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  console.log(resetUrl)
  const message = `Your password reset token is as follow: \n\n ${resetUrl}\n\nIf you have not request this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Shopit Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new errorHandler(error.message, 500));
  }
});

//Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsynError(async (req, res, next) => {
  //hash url token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    
  });
  if (!user) {
    return next(
      new errorHandler("Password token is invalid or has been expired", 400)
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new errorHandler("Password does not match", 400));
  }

  //setup new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});


exports.getUserProfile = catchAsynError(async(req,res,next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success:true,
    user
  })

})

exports.updatePassword = catchAsynError(async(req,res,next)=>{
  const user = await User.findById(req.user.id).select('+password');

  //check previous password user
  const isMatched = await user.comparePassword(req.body.oldPassword)
  if(!isMatched){
    return next(new errorHandler('Old password is incorrect',404))
  }
  user.password = req.body.password
  await user.save()

  sendToken(user, 200, res)
})

exports.updateProfile = catchAsynError(async(req,res,next)=>{
    const newUserData = {
      name: req.body.name,
      email: req.body.email
    }

    //UPDATE AVATAR TODO
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new:true, runValidators:true, useFindAndModify:false
    })

    res.status(200).json({
      success:true,
      user
    })
})



// Admin routes

// get All users => /api/v1/admin/users
exports.allUsers = catchAsynError(async(req,res,next) => {
  const users = await User.find().lean();

  res.status(200).json({
    success:true,
    users
  })
})

exports.getUserDetails = catchAsynError(async(req,res,next) => {
  const user = await User.findById(req.params.id)

  if(!user){
    return next(new errorHandler(`User does not found with id: ${req.params.id}`))
  }
  res.status(200).json({
    success:true,
    user
  })
})

// update user by admin
exports.updateUser = catchAsynError(async(req,res,next)=>{
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }

  //UPDATE AVATAR TODO
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new:true, runValidators:true, useFindAndModify:false
  })

  res.status(200).json({
    success:true,
    user
  })
})

exports.deleteUser = catchAsynError(async(req,res,next) => {
  const user = await User.findById(req.params.id);
  if(!user){
    return next(new errorHandler('User does not found with id:' + req.params.id))
  }
  // remove avatar from cloudinary - todo

  await user.remove();

  res.status(200).json({
    success:true,
    
  })
})