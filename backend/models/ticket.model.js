const mongoose = require('mongoose');
const Counter = require('./counter.model');

const commentSchema = {
    message: { type: String, required: true },
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
};

const activityLogSchema = {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
};

const ticketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            unique: true,
        },
        title: {
            type: String,
            required: [true, 'Please add a ticket title'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        category: {
            type: String,
            required: [true, 'Please specify a category'],
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        comments: [commentSchema],
        activityLogs: [activityLogSchema],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for Database Optimization
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ assignedTo: 1 });





module.exports = mongoose.model('Ticket', ticketSchema);
