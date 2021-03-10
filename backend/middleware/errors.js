const errorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    error.message = err.message;

    //Wrong mongoose object id
    if(err.name === 'CastError'){
        const message = `Resource not found. Invalid: ${err.path}`
        error = new errorHandler(message, 400)
    }
    //Handling Mongoose Validation Error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(value => value.message);
        error = new errorHandler(message, 400)
    }

    //Handling mongoose duplicate keys errros
    if(err.code === 11000){
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`
      error = new errorHandler(message, 404)
    }
    
    //Handling wrong JWT error
    if(err.name === 'JsonWebTokenError'){
      const message = 'Json web token is invalid. Try Again!'
      error = new errorHandler(message, 400)
    }
     //Handling expired JWT 
     if(err.name === 'TokenExpiredError'){
      const message = 'Json web token is invalid. Try Again!'
      error = new errorHandler(message, 400)
    }


    res.status(err.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
