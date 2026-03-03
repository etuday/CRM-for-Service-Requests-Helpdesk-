const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendResponse } = require('../utils/response');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token without the password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return sendResponse(res, 401, false, 'Not authorized, user not found');
            }

            if (req.user.status === 'inactive') {
                return sendResponse(res, 401, false, 'Account is inactive. Please contact support.');
            }

            next();
        } catch (error) {
            return sendResponse(res, 401, false, 'Not authorized, token failed');
        }
    }

    if (!token) {
        return sendResponse(res, 401, false, 'Not authorized, no token');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendResponse(
                res,
                403,
                false,
                `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
