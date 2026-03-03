const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/error.middleware');
const { sendResponse } = require('./utils/response');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const ticketRoutes = require('./routes/ticket.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (Morgan)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes Definition
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
    sendResponse(res, 200, true, "Helpdesk CRM API is up and running");
});

// 404 Route Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
