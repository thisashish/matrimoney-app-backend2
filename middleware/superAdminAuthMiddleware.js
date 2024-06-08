// superAdminAuthMiddleware.js

const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdmin');

const superAdminAuthMiddleware = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }

        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
       
        
        // Check if the user is a super admin
        const superAdmin = await SuperAdmin.findById(decodedToken.adminId);
        
        if (!superAdmin) {
            return res.status(403).json({ success: false, message: "User is not authorized as a super admin." });
        }

        // Attach super admin data to request for further processing
        req.superAdmin = superAdmin;
        next(); // Call next middleware
    } catch (error) {
        console.error('Error verifying super admin token:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = superAdminAuthMiddleware;
