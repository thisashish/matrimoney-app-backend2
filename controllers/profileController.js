const User = require('../models/User');


exports.getProfileVisitors = async (req, res) => {
    const userId = req.params.userId; // ID of the user whose profile visitors are being requested

    try {
        // Find the user
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Retrieve profile visitors' information using their userIds
        const profileVisitors = await User.find({ userId: { $in: user.profileVisitors } });
        console.log("profileVisitors", profileVisitors);
        res.status(200).json({ profileVisitors });
    } catch (error) {
        console.error('Error fetching profile visitors:', error);
        res.status(500).json({ message: 'Failed to fetch profile visitors', error: error.message });
    }
};

// exports.searchProfiles = async (req, res) => {
//     try {
//         const authenticatedUserId = req.userData.userId;
        
//         const { minAge, maxAge, maritalStatus, religion, motherTongue, minSalary, maxSalary } = req.query;

//         // Construct query based on search criteria
//         const query = {};

//         if (minAge && maxAge) {
//             query.age = { $gte: minAge, $lte: maxAge };
//         }

//         if (maritalStatus) {
//             query.maritalStatus = maritalStatus;
//         }

//         if (religion) {
//             query.religion = religion;
//         }

//         if (motherTongue) {
//             query.motherTongue = motherTongue;
//         }

//         if (minSalary && maxSalary) {
//             const minSalaryValue = parseInt(minSalary);
//             const maxSalaryValue = parseInt(maxSalary);

//             if (!isNaN(minSalaryValue) && !isNaN(maxSalaryValue)) {
//                 query.salary = { $gte: minSalaryValue, $lte: maxSalaryValue };
//             } else {
//                 throw new Error('Invalid salary values');
//             }
//         }

//         // Filter out users who have blocked the authenticated user
//         query.blockedUsers = { $ne: authenticatedUserId };
        

//         console.log(query, 'query');

//         // Query the database with the constructed query
//         const matchingProfiles = await User.find(query);
        

//         res.status(200).json({ profiles: matchingProfiles });
//     } catch (error) {
//         console.error('Error searching profiles:', error);
//         res.status(500).json({ message: 'Failed to search profiles', error: error.message });
//     }
// };

exports.searchProfiles = async (req, res) => {
    try {
        const authenticatedUserId = req.userData.userId;
        
        const { minAge, maxAge, maritalStatus, religion, motherTongue, minSalary, maxSalary, minHeight, maxHeight } = req.query;

        // Construct query based on search criteria
        const query = {};

        if (minAge && maxAge) {
            const minAgeValue = parseInt(minAge);
            const maxAgeValue = parseInt(maxAge);

            if (!isNaN(minAgeValue) && !isNaN(maxAgeValue)) {
                query.age = { $gte: minAgeValue, $lte: maxAgeValue };
            } else {
                throw new Error('Invalid age values');
            }
        }

        if (maritalStatus) {
            query.maritalStatus = maritalStatus;
        }

        if (religion) {
            query.religion = religion;
        }

        if (motherTongue) {
            query.motherTongue = motherTongue;
        }

        if (minSalary && maxSalary) {
            const minSalaryValue = parseInt(minSalary);
            const maxSalaryValue = parseInt(maxSalary);

            if (!isNaN(minSalaryValue) && !isNaN(maxSalaryValue)) {
                query.salary = { $gte: minSalaryValue, $lte: maxSalaryValue };
            } else {
                throw new Error('Invalid salary values');
            }
        }

        if (minHeight && maxHeight) {
            const minHeightValue = parseInt(minHeight);
            const maxHeightValue = parseInt(maxHeight);

            if (!isNaN(minHeightValue) && !isNaN(maxHeightValue)) {
                query.height = { $gte: minHeightValue, $lte: maxHeightValue };
            } else {
                throw new Error('Invalid height values');
            }
        }

        // Filter out users who have blocked the authenticated user
        query.blockedUsers = { $ne: authenticatedUserId };

        console.log(query, 'query');

        // Query the database with the constructed query
        const matchingProfiles = await User.find(query);
        
        res.status(200).json({ profiles: matchingProfiles });
    } catch (error) {
        console.error('Error searching profiles:', error);
        res.status(500).json({ message: 'Failed to search profiles', error: error.message });
    }
};



exports.searchProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.query;
        const authenticatedUserId = req.userData.userId;

        // Query the database to find profile by userId
        const profile = await User.findOne({ userId });
        

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Check if the authenticated user is blocked by the profile user
        if (profile.blockedUsers.includes(authenticatedUserId)) {
            return res.status(403).json({ message: 'Access denied. Ignore this user and move on in life.' });
        }

        res.status(200).json({ profile });
    } catch (error) {
        console.error('Error searching profile by userId:', error);
        res.status(500).json({ message: 'Failed to search profile by userId', error: error.message });
    }
};


// exports.searchProfileByUserId = async (req, res) => {
//     try {
//         const { userId } = req.query;

//         // Query the database to find profile by userId
//         const profile = await User.findOne({ userId });

//         if (!profile) {
//             return res.status(404).json({ message: 'Profile not found' });
//         }

//         res.status(200).json({ profile });
//     } catch (error) {
//         console.error('Error searching profile by userId:', error);
//         res.status(500).json({ message: 'Failed to search profile by userId', error: error.message });
//     }
// };

exports.updateProfileVisitors = async (req, res, next) => {
    const profileOwnerId = req.params.userId; // ID of the user whose profile is being visited
    const visitorId = req.userData.userId; // ID of the user visiting the profile

    try {
        // Find the profile owner by userId
        const profileOwner = await User.findOne({ userId: profileOwnerId });
        console.log(profileOwner, "profileOwner");

        if (!profileOwner) {
            return res.status(404).json({ message: 'Profile owner not found' });
        }

        // Check if the visitor's ID is already in the profileVisitors array
        if (!profileOwner.profileVisitors.includes(visitorId)) {
            // Push visitorId to profileVisitors array
            profileOwner.profileVisitors.push(visitorId);
            await profileOwner.save();
        }

        next(); // Proceed to the route handler
    } catch (error) {
        console.error('Error updating profile visitors:', error);
        res.status(500).json({ message: 'Failed to update profile visitors', error: error.message });
    }
};

// exports.getUsers = async (userId) => {
//     try {
//         const user = await User.findOne({ userId: userId }).populate('profileVisitors');
//         console.log("user profileController",user);
//         return user;
//     } catch (error) {
//         throw new Error(`Failed to find user: ${error.message}`);
//     }
// };


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params._id;
        const { bio, maritalStatus, religion, motherTongue, community, settleDown, homeTown, highestQualification, college, jobTitle, companyName, salary,foodPreference,smoke,drink,height } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile fields
        user.bio = bio;
        user.maritalStatus = maritalStatus;
        user.religion = religion;
        user.motherTongue = motherTongue;
        user.community = community;
        user.settleDown = settleDown;
        user.homeTown = homeTown;
        user.highestQualification = highestQualification;
        user.college = college;
        user.jobTitle = jobTitle;
        user.companyName = companyName;
        user.salary = salary;
        user.foodPreference = foodPreference;
        user.smoke = smoke;
        user.drink = drink;
        user.height = height;
        // Save updated user profile
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};


