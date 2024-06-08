const express = require('express');
const router = express.Router();
const { updateProfileVisitors } = require('../controllers/profileController.js');
const { getProfileVisitors } = require('../controllers/profileController.js');
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/usersController.js');
const profileController = require('../controllers/profileController.js')
const User = require('../models/User');

// router.post('/create-profile', profileController.createProfile);
router.post('/:_id/update-profile', profileController.updateProfile);

router.get('/search', authenticateUser, profileController.searchProfiles);
router.post('/searchByUserId', authenticateUser, profileController.searchProfileByUserId);

// Route to fetch specific profile visitor
router.get('/:userId/profile-visitors', authenticateUser, getProfileVisitors, async (req, res) => {
    try {
        // Get the userId from request parameters
        const userId = req.params.userId;

        // Call the getProfileVisitors controller function to fetch profile visitors
        const profileVisitors = await userController.find({ userId });

        // Send the profile visitors data as a response
        res.status(200).json({ profileVisitors });
    } catch (error) {
        console.error('Error fetching profile visitors:', error);
        res.status(500).json({ message: 'Failed to fetch profile visitors', error: error.message });
    }
});

// Route to fetch all profile visitors
// router.get('/profile-visitors', authenticateUser, async (req, res) => {
//     try {
//         // Get the authenticated user's ID
//         const authenticatedUserId = req.userData.userId;

//         // Fetch all users
//         const users = await User.find({});

//         // Initialize an array to store all profile visitors
//         let allProfileVisitors = [];

//         // Iterate through each user and extract their profile visitors
//         users.forEach(user => {
//             allProfileVisitors.push(...user.profileVisitors);
//         });

//         // Filter out the authenticated user's own ID from the profile visitors
//         const filteredProfileVisitors = allProfileVisitors.filter(visitorId => visitorId !== authenticatedUserId);




//         // Send the profile visitors data as a response
//         res.status(200).json({ filteredProfileVisitors });
//     } catch (error) {
//         console.error('Error fetching profile visitors:', error);
//         res.status(500).json({ message: 'Failed to fetch profile visitors', error: error.message });
//     }
// });


router.get('/profile-visitors', authenticateUser, async (req, res) => {
    try {
        // Get the authenticated user's ID
        const authenticatedUserId = req.userData.userId;

        // Fetch all users
        const users = await User.find({});

        // Initialize an array to store all profile visitors' IDs
        let allProfileVisitorIds = [];

        // Iterate through each user and extract their profile visitors' IDs
        users.forEach(user => {
            allProfileVisitorIds.push(...user.profileVisitors);
        });

        // Filter out the authenticated user's own ID from the profile visitors' IDs
        const filteredProfileVisitorIds = allProfileVisitorIds.filter(visitorId => visitorId !== authenticatedUserId);

        // Fetch the details of each profile visitor using userId
        const profileVisitorsDetails = await Promise.all(
            filteredProfileVisitorIds.map(async visitorId => {
                return await User.findOne({ userId: visitorId }); // Fetch all details using userId
            })
        );

        // Send the profile visitors data as a response
        res.status(200).json({ profileVisitors: profileVisitorsDetails });
    } catch (error) {
        console.error('Error fetching profile visitors:', error);
        res.status(500).json({ message: 'Failed to fetch profile visitors', error: error.message });
    }
});

// Route to view user's profile
router.get('/:userId', authenticateUser, updateProfileVisitors, async (req, res) => {
    try {
        // Get the userId from request parameters
        const userId = req.params.userId;
        console.log("userIdxxx", userId);

        const user = await User.find({ userId });
        console.log("user", user);


        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});


module.exports = router;


