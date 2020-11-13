class AppError extends Error { //inheritance
    constructor(message, statusCode) {
        super(message); ///similar to new Error(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;