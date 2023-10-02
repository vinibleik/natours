/**
 * Represents an API error.
 *
 * @class
 * @extends Error
 * @param {string} message - The error message.
 * @param {number} [statusCode=500] - The HTTP status code associated with the error (default: 500).
 *
 * @property {number} statusCode - The HTTP status code of the error.
 * @property {string} status - The status of the error, either "error" (for server errors) or "fail" (for client errors).
 * @property {boolean} isOperational - Indicates whether the error is operational or not.
 *
 * @example
 * // Create a new API error
 * const error = new ApiError("Something went wrong", 500);
 *
 * // Access error properties
 * console.log(error.message); // "Something went wrong"
 * console.log(error.statusCode); // 500
 * console.log(error.status); // "error"
 * console.log(error.isOperational); // true
 *
 * // Throw the error
 * throw error;
 */
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 500 ? "error" : "fail";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
