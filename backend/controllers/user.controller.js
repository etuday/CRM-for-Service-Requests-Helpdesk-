const User = require('../models/user.model');
const { sendResponse } = require('../utils/response');

// @desc    Get all active/non-deleted users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        sendResponse(res, 200, true, 'Users fetched successfully', users);
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Update user role or status
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            user.status = req.body.status || user.status;

            const updatedUser = await user.save();
            sendResponse(res, 200, true, 'User updated successfully', {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status
            });
        } else {
            sendResponse(res, 404, false, 'User not found');
        }
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Soft delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isDeleted = true;
            user.status = 'inactive';
            await user.save();
            sendResponse(res, 200, true, 'User deactivated and soft deleted');
        } else {
            sendResponse(res, 404, false, 'User not found');
        }
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

module.exports = {
    getUsers,
    updateUser,
    deleteUser,
};
