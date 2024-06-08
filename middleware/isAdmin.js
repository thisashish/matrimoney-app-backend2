const SuperAdmin = require('../models/superAdmin');


const isAdmin = async (req, res, next) => {
    try {
        // Check if any users exist in the database
        const userCount = await SuperAdmin.countDocuments();

        // If no users exist, allow access to create-super-admin route
        if (userCount === 0) {
            return next();
        }

        // Check if user information is available and if the user is an admin
        if (req.user && req.user.role === 'super-admin') {
            return next();
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error checking user count:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = isAdmin;
