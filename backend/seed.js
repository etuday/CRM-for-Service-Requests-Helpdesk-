const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/user.model');
const Ticket = require('./models/ticket.model');
const Counter = require('./models/counter.model');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/helpdesk')
    .then(async () => {
        // Delete all data for a fresh start
        await User.deleteMany({});
        await Ticket.deleteMany({});
        await Counter.deleteMany({});

        await User.create([
            { name: 'Admin', email: 'admin@gmail.com', password: 'admin@123', role: 'admin' },
            { name: 'Agent One', email: 'agent1@gmail.com', password: 'agent1@123', role: 'agent' },
            { name: 'Agent Two', email: 'agent2@gmail.com', password: 'agent2@123', role: 'agent' },
            { name: 'User One', email: 'user1@gmail.com', password: 'user1@123', role: 'user' },
            { name: 'User Two', email: 'user2@gmail.com', password: 'user2@123', role: 'user' }
        ]);

        console.log('Successfully wiped database and created the requested custom accounts!');
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
