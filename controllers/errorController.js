// A controller for keeping error handler may seem a little controversial but we do it this way, any other way of separting the cponcern is always welcome

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}