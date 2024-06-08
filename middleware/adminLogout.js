const SuperAdmin = require('../models/superAdmin');
const jwt = require('jsonwebtoken');

const authenticateSuperAdmin = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const superAdmin = await SuperAdmin.findById(decoded.adminId);
        console.log(superAdmin,'superAdmin');
        if (!superAdmin) {
            return res.status(404).json({ message: 'Super admin not found' });
        }
        req.admin = superAdmin;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authenticateSuperAdmin;