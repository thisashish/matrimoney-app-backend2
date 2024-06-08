// middleware/checkBlockedStatus.js
const User = require('../models/User');

const checkBlockedStatus = async (req, res, next) => {
    try {
        // Assuming req.userData is an object containing user information
        const userId = req.userData.userId; 
        console.log('userId', userId);

        // Find the user by userId
        const user = await User.findOne({ userId: userId });

        // Check if the user exists and is blocked
        if (!user || user.status === 'blocked') {
            return res.status(403).json({ message: 'Your account is blocked. Please contact customer support for assistance.' });
        }

        // If user is not blocked, proceed to the next middleware
        next();
    } catch (error) {
        console.error('Error checking user status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkBlockedStatus;
