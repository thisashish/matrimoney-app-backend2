const jwt = require('jsonwebtoken');
const authenticateUser = async (req, res, next) => {
    try {
        // Check if the authorization header is present
        const authorizationHeader = req.headers.authorization;
        console.log('Authorization Header:', authorizationHeader); // Log authorization header
        if (!authorizationHeader) {
            return res.status(401).json({ success: false, message: "Error! Token was not provided." });
        }
        
        // Extract the token from the header
        const token = authorizationHeader.split(' ')[1];

        console.log('Token:', token); // Log the token for debugging

        // Verify the token
        const decodedToken = jwt.verify(token, "secretkeyappearshere");

        console.log('Decoded Token:', decodedToken); // Log the decoded token for debugging

        // Attach user data to request for further processing
        req.userData = { userId: decodedToken.userId, email: decodedToken.email,_id:decodedToken._id };
        next(); // Call next middleware
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ success: false, message: "Invalid token or token expired" });
    }
};

module.exports = authenticateUser;


// const authenticateUser = async (req, res, next) => {
//     try {
//         // Check if the authorization header is present
//         const authorizationHeader = req.headers.authorization;
//         console.log(authorizationHeader,"authorizationHeader");
//         if (!authorizationHeader) {
//             return res.status(401).json({ success: false, message: "Error! Token was not provided." });
//         }
        
//         // Extract the token from the header
//         const token = authorizationHeader.split(' ')[1];

//         console.log('Token:', token); // Log the token for debugging

//         // Verify the token
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

//         console.log('Decoded Token:', decodedToken); // Log the decoded token for debugging

//         // Attach user data to request for further processing
//         req.userData = { userId: decodedToken.userId, email: decodedToken.email };
//         next(); // Call next middleware
//     } catch (error) {
//         console.error('Error verifying token:', error);
//         return res.status(401).json({ success: false, message: "Invalid token or token expired" });
//     }
// };

// module.exports = authenticateUser;
