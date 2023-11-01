const ApiError = require("../helpers/apiError");

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').NextFunction} ExpressNextFunction
 */

const ErrorHandlers = {
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

    // JsonWebToken Errors
    JsonWebTokenError: (_err) => new ApiError("Invalid token!", 401),
    TokenExpiredError: (_err) => new ApiError("Token expired!", 401),
};

/**
 * @param {ExpressResponse} res
 * @param {number} statusCode
 * @param {Object} data
 * */
const apiErrorHandler = (res, statusCode, data) => {
    return res.status(statusCode).json(data);
};

/**
 * @param {ExpressResponse} res
 * @param {number} statusCode
 * @param {Object} data
 * */
const renderErrorHandler = (res, statusCode, data) => {
    return res.status(statusCode).render("error", data);
};

/**
 * @param {Error} err
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * */
const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return apiErrorHandler(res, err.statusCode, {
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    }

    return renderErrorHandler(res, err.statusCode, {
        title: "Something went wrong!",
        message: err.message,
        status: err.status,
        statusCode: err.statusCode,
    });
};

/**
 * @param {Error} err
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * */
const sendErrorProd = (err, req, res) => {
    let error = {
        status: "error",
        message: "Something went wrong!",
    };

    if (err.isOperational) {
        error.message = err.message;
        error.status = err.status;
    }

    if (req.originalUrl.startsWith("/api")) {
        return apiErrorHandler(res, err.statusCode, error);
    }

    return renderErrorHandler(res, err.statusCode, {
        title: "Something went wrong!",
        ...error,
    });
};

/**
 * @param {Error} err
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * @param {ExpressNextFunction} next
 * */
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        return sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = ErrorHandlers[err.name]?.(err) ?? err;
        return sendErrorProd(error, req, res);
    }
};

module.exports = globalErrorHandler;
