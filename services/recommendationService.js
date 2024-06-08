const User = require('../models/User');
const UserInteraction = require('../models/UserInteraction');

exports.generateRecommendations = async (userId) => {
    // Fetch current user details
    const currentUser = await User.findOne({userId});

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Collect all user IDs with whom current user has interacted
    const userInteractions = await UserInteraction.find({ userId });
    const interactedUserIds = userInteractions.map(i => i.targetUserId.toString());

    // Find users of the opposite gender who have not been interacted with
    const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
    const recommendations = await User.find({
        _id: { $nin: interactedUserIds },
        gender: oppositeGender
    }).limit(1); // Show one user at a time

    return recommendations;
};
