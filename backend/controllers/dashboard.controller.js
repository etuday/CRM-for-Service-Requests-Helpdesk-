const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const { sendResponse } = require('../utils/response');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const totalTickets = await Ticket.countDocuments({ isDeleted: { $ne: true } });
        const totalUsers = await User.countDocuments({ role: 'user', isDeleted: { $ne: true } });
        const totalAgents = await User.countDocuments({ role: 'agent', isDeleted: { $ne: true } });

        // Status Breakdown (Aggregation)
        const statusBreakdownRaw = await Ticket.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Agent Workload Distribution (Aggregation)
        const agentWorkloadRaw = await Ticket.aggregate([
            { $match: { isDeleted: { $ne: true }, assignedTo: { $ne: null } } },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agent'
                }
            },
            { $unwind: '$agent' },
            { $project: { name: '$agent.name', count: 1 } }
        ]);

        // Monthly Trend (Aggregation for current year)
        const currentYear = new Date().getFullYear();
        const monthlyTrend = await Ticket.aggregate([
            {
                $match: {
                    isDeleted: { $ne: true },
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const formattedMonthlyTrend = monthlyTrend.map(item => ({
            month: item._id,
            count: item.count
        }));

        sendResponse(res, 200, true, 'Dashboard stats fetched', {
            totalTickets,
            totalUsers,
            totalAgents,
            statusBreakdown: statusBreakdownRaw.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, { 'Open': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 }),
            agentWorkload: agentWorkloadRaw.map(curr => ({
                name: curr.name,
                count: curr.count
            })),
            monthlyTrend: formattedMonthlyTrend
        });
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
};

module.exports = {
    getDashboardStats
};
