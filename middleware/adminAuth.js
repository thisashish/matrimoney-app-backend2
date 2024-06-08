const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdmin');

const authenticateAdmin = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        console.log("authorizationHeader",authorizationHeader);
        if (!authorizationHeader) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }
        
        const token = authorizationHeader.split(' ')[1];
        console.log('token',token);
        if (!token) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }

        const decodedToken = jwt.verify(token, "secretkeyappearshere");
        console.log(decodedToken,'decoded token')
        
        // Check if the user is an admin
        const admin = await SuperAdmin.findById(decodedToken.adminId);
        console.log(admin,'super-admin');

        if (!admin) {
            return res.status(403).json({ success: false, message: "User is not authorized as super admin." });
        }

        // Attach admin data to request for further processing
        req.admin = admin;
        next(); // Call next middleware
    } catch (error) {
        console.error('Error verifying admin token:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = authenticateAdmin;
