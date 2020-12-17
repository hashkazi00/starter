// A controller for keeping error handler may seem a little controversial but we do it this way, any other way of separting the cponcern is always welcome


const AppError = require('./../utils/appError');

///HAndling the wrong type of tour id error, error from mongoose converted to opertaional error by setting the iOperational property
const handleCastErrorDB = err => {

    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
    // console.log('handleCastErrorDB')
}

/////Handling duplicate field, error from mongoose converted to operational error by setting the iOperational property
const handleDupFieldErrorDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value.`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid Input Data ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid Token! Please Login Again.', 401);
const handleJWTExpiredError = () => new AppError('Token Expired! Please Login Again.', 401);


////Environtal variable based error definition
//1
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}
//2
const sendErrorProd = (err, res) => {
    //Operation, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else { //uknown error so don't leak info to client

        //For developer usage
        console.error(err)
        res.status(500).json({
            status: 'error',
            message: 'something went too wrong!!!'
        })
    }
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // res.status(err.statusCode).json({
    //     status: err.status,
    //     message: err.message
    // });
    if (process.env.NODE_ENV === 'development') {

        sendErrorDev(err, res)

    } else if (process.env.NODE_ENV === 'production') { //only in production

        let error = { ...err } //good practice to not directly mutate the parameters
        // console.log(error)

        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if (err.code === 11000) {
            error = handleDupFieldErrorDB(error);
        }

        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if(err.name === 'JsonWebTokenError') error = handleJWTError();

        if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res)
    }
}