const Ticket = require('../models/ticket.model');
const Counter = require('../models/counter.model');
const { sendResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation error', errors.array());
    }

    const { title, description, category, priority } = req.body;

    try {
        const currentYear = new Date().getFullYear();
        const counterId = `ticket_${currentYear}`;

        const counter = await Counter.findOneAndUpdate(
            { id: counterId },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        const sequence = counter.seq.toString().padStart(4, '0');
        const customTicketId = `TKT-${currentYear}-${sequence}`;

        const ticket = await Ticket.create({
            ticketId: customTicketId,
            title,
            description,
            category,
            priority,
            createdBy: req.user._id,
            activityLogs: [
                {
                    action: 'Ticket Created',
                    performedBy: req.user._id,
                    role: req.user.role,
                }
            ]
        });

        sendResponse(res, 201, true, 'Ticket created successfully', ticket);
    } catch (error) {
        next(error);
    }
};

// @desc    Get tickets (Role scoped)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
    try {
        let query = { isDeleted: false };

        if (req.user.role === 'user') {
            query.createdBy = req.user._id;
        } else if (req.user.role === 'agent') {
            // Allow agents to see all tickets to pick them up, or stick to assigned. 
            // Based on typical helpdesk, agents might need to see open tickets to get assigned.
            // But let's follow the strict plan: "Agent: View assigned tickets". We'll also allow them to see Open tickets just in case, but let's stick to assignedTo.
            // query.$or = [{ assignedTo: req.user._id }, { assignedTo: null }]; 
            query.assignedTo = req.user._id;
        } else if (req.user.role === 'admin') {
            // Admin sees all tickets, no explicit filter needed on createdBy/assignedTo
        }

        if (req.query.status) query.status = req.query.status;
        if (req.query.priority) query.priority = req.query.priority;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Ticket.countDocuments(query);
        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        sendResponse(res, 200, true, 'Tickets fetched', {
            tickets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role')
            .populate('comments.commentedBy', 'name email role');

        if (!ticket) {
            return sendResponse(res, 404, false, 'Ticket not found');
        }

        // Authorization check
        if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, false, 'Not authorized to view this ticket');
        }

        if (req.user.role === 'agent' && ticket.assignedTo && ticket.assignedTo._id.toString() !== req.user._id.toString()) {
            // Technically agents shouldn't peek into other agents' assigned tickets
            return sendResponse(res, 403, false, 'Ticket assigned to another agent');
        }

        sendResponse(res, 200, true, 'Ticket fetched', ticket);
    } catch (error) {
        next(error);
    }
};

// @desc    Update ticket status / assignment
// @route   PUT /api/tickets/:id
// @access  Private (Agent/Admin)
const updateTicket = async (req, res, next) => {
    try {
        if (req.user.role === 'user') {
            return sendResponse(res, 403, false, 'Users cannot update ticket properties');
        }

        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) return sendResponse(res, 404, false, 'Ticket not found');

        if (req.user.role === 'agent' && ticket.assignedTo && ticket.assignedTo.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, false, 'You can only update tickets assigned to you');
        }

        const { status, priority, assignedTo } = req.body;

        if (status && status !== ticket.status) {
            ticket.activityLogs.push({
                action: `Status changed from ${ticket.status} to ${status}`,
                performedBy: req.user._id,
                role: req.user.role
            });
            ticket.status = status;
        }

        if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
            if (req.user.role !== 'admin') {
                return sendResponse(res, 403, false, 'Only admins can assign tickets');
            }
            ticket.activityLogs.push({
                action: `Ticket Assigned`,
                performedBy: req.user._id,
                role: req.user.role
            });
            ticket.assignedTo = assignedTo;
        }

        if (priority && priority !== ticket.priority) {
            // Agents and Admins can update priority usually
            ticket.activityLogs.push({
                action: `Priority changed to ${priority}`,
                performedBy: req.user._id,
                role: req.user.role
            });
            ticket.priority = priority;
        }

        await ticket.save();

        ticket = await Ticket.findById(ticket._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        sendResponse(res, 200, true, 'Ticket updated successfully', ticket);
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comment
// @access  Private
const addComment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation error', errors.array());
    }

    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return sendResponse(res, 404, false, 'Ticket not found');

        if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, false, 'Not authorized to comment here');
        }

        const comment = {
            message: req.body.message,
            commentedBy: req.user._id,
            role: req.user.role
        };

        ticket.comments.push(comment);
        ticket.activityLogs.push({
            action: `Added a comment`,
            performedBy: req.user._id,
            role: req.user.role
        });

        await ticket.save();

        // Populate the newly added comment
        await ticket.populate('comments.commentedBy', 'name email role');

        sendResponse(res, 201, true, 'Comment added', ticket.comments[ticket.comments.length - 1]);
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
const deleteTicket = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return sendResponse(res, 403, false, 'Only admins can delete tickets');
        }

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return sendResponse(res, 404, false, 'Ticket not found');

        ticket.isDeleted = true;
        await ticket.save();

        sendResponse(res, 200, true, 'Ticket deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    addComment,
    deleteTicket
};
