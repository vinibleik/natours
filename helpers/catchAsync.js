/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').NextFunction} ExpressNext
 */

/**
 * Wraps an asynchronous Express middleware function to catch and handle promise errors.
 *
 * @param {function(ExpressRequest, ExpressResponse, ExpressNext): Promise<void>} asyncHandler - The asynchronous middleware function to wrap.
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): void} A new middleware function that catches promise errors and forwards them to the error handler.
 *
 * @example
 * // Define an asynchronous middleware function
 * const asyncMiddleware = async (req, res, next) => {
 *   // Asynchronous code here
 * };
 *
 * // Wrap the async middleware with catchAsync
 * const wrappedMiddleware = catchAsync(asyncMiddleware);
 *
 * // Use the wrapped middleware in your Express route
 * app.get('/some-route', wrappedMiddleware);
 */
const catchAsync = (asyncHandler) => {
    /**
     * @param {ExpressRequest} req - The Express request object.
     * @param {ExpressResponse} res - The Express response object.
     * @param {ExpressNext} next - The Express next middleware function.
     */
    return (req, res, next) => {
        asyncHandler(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
