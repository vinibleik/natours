const ApiError = require("../helpers/apiError");

const DBErrorHandlers = {
    // Mongoose CastError (invalid ObjectId)
    CastError: (err) => {
        const message = `Invalid ${err.path}: ${err.value}.`;
        return new ApiError(message, 400);
    },

    // Mongoose ValidationError
    ValidationError: (err) => {
        return new ApiError(err.message, 400);
    },

    // MongoError (duplicate key)
    MongoServerError: (err) => {
        if (err.code === 11000) {
            const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
            return new ApiError(message, 400);
        }

        return err;
    },
};

const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Programming or other unknown error: don't leak error details
    console.error(err);
    return res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
    });
};

const globalErrorHandler = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        return sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = DBErrorHandlers[err.name]?.(err) ?? err;

        return sendErrorProd(error, res);
    }
};

module.exports = globalErrorHandler;
