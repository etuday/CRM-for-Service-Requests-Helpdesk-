require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(async () => {
    // Auto-seed admin if doesn't exist
    const User = require('./models/user.model');
    try {
        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (!adminExists) {
            await User.create({ name: 'System Admin', email: 'admin@gmail.com', password: 'admin@123', role: 'admin' });
            console.log('✅ Auto-seeded admin@gmail.com account');
        }

        const agentExists = await User.findOne({ email: 'agent1@gmail.com' });
        if (!agentExists) {
            await User.create({ name: 'Support Agent 1', email: 'agent1@gmail.com', password: 'agent1@123', role: 'agent' });
            console.log('✅ Auto-seeded agent1@gmail.com account');
        }

        const userExists = await User.findOne({ email: 'user1@gmail.com' });
        if (!userExists) {
            await User.create({ name: 'Normal User 1', email: 'user1@gmail.com', password: 'user1@123', role: 'user' });
            console.log('✅ Auto-seeded user1@gmail.com account');
        }
    } catch (err) {
        console.error('Error auto-seeding admin:', err);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
