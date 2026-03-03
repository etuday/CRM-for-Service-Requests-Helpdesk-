const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    addComment,
    deleteTicket
} = require('../controllers/ticket.controller');

router.route('/')
    .get(protect, getTickets)
    .post(
        protect,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            check('category', 'Category is required').not().isEmpty(),
        ],
        createTicket
    );

router.route('/:id')
    .get(protect, getTicket)
    .put(protect, authorize('agent', 'admin'), updateTicket)
    .delete(protect, authorize('admin'), deleteTicket);

router.route('/:id/comment')
    .post(
        protect,
        [
            check('message', 'Message is required').not().isEmpty()
        ],
        addComment
    );

module.exports = router;
