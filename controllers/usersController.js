
require('dotenv').config();
const User = require('../models/User');
const moment = require('moment');
const axios = require('axios');
// const { GEOCODING_API_URL, API_KEY } = require('../config/config');
const mongoose = require('mongoose');
const config = require('../config/config');
const { FormListInstance } = require('twilio/lib/rest/verify/v2/form');



exports.enterAdditionalInfo = async (req, res) => {
    const { firstName, lastName, gender, dateOfBirth } = req.body;
    const userId = req.userData.userId;

    try {
        // Find the user by ID
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate age based on date of birth
        const age = calculateAge(dateOfBirth);

        // Update user's additional information
        user.firstName = firstName;
        user.lastName = lastName;
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        user.age = age; // Update user's age

       
        if (firstName && lastName && gender && dateOfBirth) {
            user.profileSetup = true; // Set profileSetup to true if all fields are provided
        }

        await user.save();

        res.status(200).json({ message: 'Additional information saved successfully' });
    } catch (error) {
        console.error('Error saving additional information:', error);
        res.status(500).json({ message: 'Failed to save additional information', error: error.message });
    }
};


// Function to calculate age based on date aof birth
function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}


// exports.enterAdditionalInfo = async (req, res) => {
//     const { firstName, lastName, gender, dateOfBirth } = req.body;
//     const userId = req.userData.userId;


//     try {
//         // Find the user by ID
//         const user = await User.findOne({ userId });


//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user's additional information
//         user.firstName = firstName;
//         user.lastName = lastName;

//         user.dateOfBirth = dateOfBirth;
//         user.gender = gender;


//         await user.save();

//         res.status(200).json({ message: 'Additional information saved successfully' });
//     } catch (error) {
//         console.error('Error saving additional information:', error);
//         res.status(500).json({ message: 'Failed to save additional information', error: error.message });
//     }
// };


exports.getAdditionalInfo = async (req, res) => {
    const userId = req.userData.userId;
    console.log(userId, 'userId usersController');

    try {
        // Find the user by ID
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return all user data
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).json({ message: 'Failed to retrieve user information', error: error.message });
    }
};


exports.getOppositeGenderUsers = async (req, res) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findOne({ userId });
        if (!user) {
           
            return res.status(404).json({ message: 'User not found' });
        }

        const userIdObject = new mongoose.Types.ObjectId(user._id);
        
        let oppositeGenderUsers = await User.find({
            gender: { $ne: user.gender },
            blockedUsers: { $nin: [userIdObject] },
            receivedRequests: { $nin: [userIdObject] },
            sentRequests: { $nin: [userIdObject] },
            firstName: { $ne: null },
            acceptedRequests:{$nin:[userIdObject]}
        });

        res.status(200).json({ oppositeGenderUsers });
    } catch (error) {
        console.error('Error retrieving opposite gender users:', error);
        res.status(500).json({ message: 'Failed to retrieve opposite gender users', error: error.message });
    }
};


exports.getMatches = async (req, res) => {
    const userId = req.userData.userId;
    const lastViewedProfileIndex = req.lastViewedProfileIndex;

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let oppositeGenderUsers = await User.find({
            gender: { $ne: user.gender },
            blockedUsers: { $nin: [userId] },
            receivedRequests: { $nin: [userId] },
            sentRequests: { $nin: [userId] },
            acceptedRequests:{$nin:[userId]}
        });

        const matches = oppositeGenderUsers.slice(lastViewedProfileIndex);

        res.status(200).json({ matches });
    } catch (error) {
        console.error('Error retrieving matches:', error);
        res.status(500).json({ message: 'Failed to retrieve matches', error: error.message });
    }
};

exports.blockUser = async (req, res) => {
    const userIdToBlock = req.params.userId;
    const authenticatedUserId = req.userData.userId;
    console.log(userIdToBlock, "userIdToBlock");
    console.log(authenticatedUserId, "authenticatedUserId");

    try {
        // Find the authenticated user
        const authenticatedUser = await User.findOne({ userId: authenticatedUserId });
        console.log(authenticatedUser, "authenticatedUser");

        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }

        // Add the userIdToBlock to the list of blocked users
        authenticatedUser.blockedUsers.push(userIdToBlock);
        await authenticatedUser.save();

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Failed to block user', error: error.message });
    }
};


exports.unblockUser = async (req, res) => {
    const userIdToUnblock = req.params.userId;
    const authenticatedUserId = req.userData.userId;
    console.log(userIdToUnblock, "userIdToUnblock");
    console.log(authenticatedUserId, "authenticatedUserId");

    try {
        // Find the authenticated user
        const authenticatedUser = await User.findOne({ userId: authenticatedUserId });
        console.log(authenticatedUser, "authenticatedUser");

        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }

        // Remove the userIdToUnblock from the list of blocked users
        const index = authenticatedUser.blockedUsers.indexOf(userIdToUnblock);
        if (index > -1) {
            authenticatedUser.blockedUsers.splice(index, 1);
            await authenticatedUser.save();
            res.status(200).json({ message: 'User unblocked successfully' });
        } else {
            res.status(404).json({ message: 'User not found in blocked list' });
        }
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Failed to unblock user', error: error.message });
    }
};


// Controller function to find nearby people based on a user's location

// exports.findNearbyPeople = async (req, res) => {
//     try {
//         // Get the user's location from the request body
//         const { address } = req.body;

//         // Use Geocoding API URL from config to convert address to geographic coordinates (latitude and longitude)
//         const geocodingResponse = await axios.get(config.GEOCODING_API_URL(address));

//         const location = geocodingResponse.data.results[0].geometry.location;
//         const { lat, lng } = location;

//         // Now, you can use the latitude and longitude to find nearby people in your database
//         // For demonstration purposes, we'll just send back the coordinates
//         res.json({ latitude: lat, longitude: lng });
//     } catch (error) {
//         console.error('Error finding nearby people:', error);
//         res.status(500).json({ message: 'Failed to find nearby people' });
//     }
// };








