const User = require('../models/user.model');
const { sendResponse } = require('../utils/response');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation error', errors.array());
    }

    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return sendResponse(res, 400, false, 'User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            sendResponse(res, 201, true, 'User registered successfully', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            sendResponse(res, 400, false, 'Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation error', errors.array());
    }

    const { email, password } = req.body;

    try {
        // Bring password in scope for checking match
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (user.status === 'inactive') {
                return sendResponse(res, 401, false, 'Account is inactive. Please contact support.');
            }
            sendResponse(res, 200, true, 'Login successful', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            sendResponse(res, 401, false, 'Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
