const { sendResponse } = require('../utils/response');

const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const message = err.message || 'Internal Server Error';

    sendResponse(
        res,
        statusCode,
        false,
        message,
        process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
    );
};

module.exports = { notFound, errorHandler };
