/**
 * Standardized API Response formatter
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Represents request success or failure
 * @param {string} message - Descriptive message
 * @param {any} data - Optional payload data
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
    const responseData = {
        success,
        message,
    };

    if (data !== null && data !== undefined) {
        responseData.data = data;
    }

    return res.status(statusCode).json(responseData);
};

module.exports = { sendResponse };
