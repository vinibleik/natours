const errorHandler = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

module.exports = errorHandler;
