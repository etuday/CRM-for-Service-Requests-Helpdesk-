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
            await User.create({
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: 'admin@123',
                role: 'admin'
            });
            console.log('✅ Auto-seeded admin@gmail.com account on startup');
        }
    } catch (err) {
        console.error('Error auto-seeding admin:', err);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
