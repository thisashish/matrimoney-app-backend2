// controllers/adminsController.js

const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Coupon = require('../models/Coupon');
const Message = require('../models/Message');


// Controller to search user by name (case-insensitive)
exports.searchUserByName = async (req, res) => {
  const { firstName } = req.body;

  try {
    // Perform a case-insensitive search for users by name
    const users = await User.find({ firstName: { $regex: new RegExp(firstName, "i") } });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found with the provided firstName' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching user by name:', error);
    res.status(500).json({ message: 'Failed to search user by name', error: error.message });
  }
};

// exports.searchUserByName = async (req, res) => {
//   const { firstName, lastName } = req.body;

//   try {
//     // Perform a case-insensitive search for users by first name or last name
//     const query = {};
//     if (firstName) {
//       query.firstName = { $regex: new RegExp(`\\b${firstName}\\b`, "i") };
//     }
//     if (lastName) {
//       query.lastName = { $regex: new RegExp(`\\b${lastName}\\b`, "i") };
//     }

//     const users = await User.find({
//       $or: [
//         query.firstName && { firstName: query.firstName },
//         query.lastName && { lastName: query.lastName }
//       ].filter(Boolean)
//     });

//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: 'No users found with the provided name' });
//     }

//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error searching user by name:', error);
//     res.status(500).json({ message: 'Failed to search user by name', error: error.message });
//   }
// };



// Controller to search user by user ID
exports.searchUserById = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user by ID
    const user = await User.findOne({userId});

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error searching user by user ID:', error);
    res.status(500).json({ message: 'Failed to search user by user ID', error: error.message });
  }
};


exports.searchUserByEmail = async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error('Error searching user by email:', error);
      res.status(500).json({ message: 'Failed to search user by email', error: error.message });
  }
};

// Controller to search user by phone number
exports.searchUserByPhone = async (req, res) => {
  const { phone } = req.body; 

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error searching user by phone:', error);
    res.status(500).json({ message: 'Failed to search user by phone', error: error.message });
  }
};

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  try {
      const users = await User.find();
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Failed to fetch all users', error: error.message });
  }
};

exports.getUsersByGender = async (req, res) => {
  try {
      const { gender } = req.query;

      // Query the database to find users based on gender
      const users = await User.find({ gender });
      console.log(users, 'users data');

      // Return the users as a response
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching users by gender:', error);
      res.status(500).json({ message: 'Failed to fetch users by gender', error: error.message });
  }
};


exports.getAllMaleUsers = async (req, res) => {
  try {
      // Check if the user making the request is an admin
      if (!req.admin) {
          return res.status(403).json({ success: false, message: "User is not authorized as admin." });
      }

      // Find all male users
      const maleUsers = await User.find({ gender: 'male' });

      res.status(200).json({ maleUsers });
  } catch (error) {
      console.error('Error fetching male users:', error);
      res.status(500).json({ message: 'Failed to fetch male users', error: error.message });
  }
};


// Controller to edit user data
exports.editUser = async (req, res) => {
  const { userId } = req.params;
  
  const updatedData = req.body;

  try {
      const updatedUser = await User.findOneAndUpdate({userId:userId}, updatedData, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Controller to delete user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
      const deletedUser = await User.findOneAndDelete({userId});

      if (!deletedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

exports.verifyFirstPhoto = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has any photos
        if (!user.photos || user.photos.length === 0) {
            return res.status(404).json({ message: 'No photos found for the user' });
        }

        // Get the first photo in the user's photos array
        const firstPhoto = user.photos[0];

        // Mark the first photo as verified
        firstPhoto.verified = true;

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'First photo verified successfully' });
    } catch (error) {
        console.error('Error verifying photo:', error);
        res.status(500).json({ message: 'Failed to verify photo', error: error.message });
    }
};


// Controller method to activate a user
exports.activateUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID and update their status to active
        await User.findOneAndUpdate({ userId: userId }, { status: 'active' });
        res.status(200).json({ message: 'User activated successfully' });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ message: 'Failed to activate user', error: error.message });
    }
};


// Controller method to edit user profile
exports.editUserProfile = async (req, res) => {
    const userId = req.params.userId;
    const newData = req.body; // Assuming you're sending the updated profile data in the request body
    try {
        // Find the user by ID and update their profile data
        await User.findOneAndUpdate({ userId: userId }, newData); // Pass query criteria as an object
        res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error editing user profile:', error);
        res.status(500).json({ message: 'Failed to edit user profile', error: error.message });
    }
};


// Controller method to block a user
exports.blockUser = async (req, res) => {
    const userId = req.params.userId;
    console.log(userId, "userId");
    try {
        // Find the user by ID and update their status to blocked
        await User.findOneAndUpdate({ userId: userId }, { status: 'blocked' });

        // Remove all tokens to prevent user from staying logged in
        await User.findOneAndUpdate({ userId: userId }, { $set: { tokens: [] } });

        // Clear any pending requests (optional, depending on your requirements)
        await User.findOneAndUpdate(
            { userId: userId },
            { $set: { sentRequests: [], receivedRequests: [], acceptedRequests: [], declinedRequests: [] } }
        );

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Failed to block user', error: error.message });
    }
};


// Controller function to create a new subscription plan

exports.createSubscriptionPlan = async (req, res) => {
  const { name, duration, price, couponCode, discountPercentage, expiryDate } = req.body;

  try {
    const coupon = new Coupon({ code: couponCode, discountPercentage, expiryDate });
    await coupon.save();
    
    const newPlan = new SubscriptionPlan({ name, duration, price, coupon });
    await newPlan.save();
    
    res.status(201).json({ message: 'Subscription plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ message: 'Failed to create subscription plan', error: error.message });
  }
};

// Controller function to update a subscription plan
exports.updateSubscriptionPlan = async (req, res) => {
  const { planId } = req.params;
  const { name, duration, price, couponCode, discountPercentage, expiryDate } = req.body;

  try {
    const updatedPlan = await SubscriptionPlan.findById(planId);
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    if (couponCode && discountPercentage && expiryDate) {
      const updatedCoupon = await Coupon.findById(updatedPlan.coupon._id);
      updatedCoupon.code = couponCode;
      updatedCoupon.discountPercentage = discountPercentage;
      updatedCoupon.expiryDate = expiryDate;
      await updatedCoupon.save();
      updatedPlan.coupon = updatedCoupon;
    }

    updatedPlan.name = name;
    updatedPlan.duration = duration;
    updatedPlan.price = price;
    await updatedPlan.save();
    
    res.status(200).json({ message: 'Subscription plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ message: 'Failed to update subscription plan', error: error.message });
  }
};

// Controller function to delete a subscription plan
exports.deleteSubscriptionPlan = async (req, res) => {
  const { planId } = req.params;

  try {
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    await Coupon.findByIdAndDelete(deletedPlan.coupon._id);

    res.status(200).json({ message: 'Subscription plan and associated coupon deleted successfully', plan: deletedPlan });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({ message: 'Failed to delete subscription plan', error: error.message });
  }
};

// Controller function to list all subscription plans
exports.listSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().populate('coupon');
    res.status(200).json({ plans });
  } catch (error) {
    console.error('Error listing subscription plans:', error);
    res.status(500).json({ message: 'Failed to list subscription plans', error: error.message });
  }
};

// Controller function to create a new coupon
exports.createCoupon = async (req, res) => {
  const { code, discountPercentage, expiryDate } = req.body;

  try {
    const newCoupon = new Coupon({ code, discountPercentage, expiryDate });
    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

// Controller function to update a coupon
exports.updateCoupon = async (req, res) => {
  const { couponId } = req.params;
  const { code, discountPercentage, expiryDate } = req.body;

  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { code, discountPercentage, expiryDate }, { new: true });
    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
};

// Controller function to delete a coupon
exports.deleteCoupon = async (req, res) => {
  const { couponId } = req.params;

  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.status(200).json({ message: 'Coupon deleted successfully', coupon: deletedCoupon });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};

exports.getAllChats = async (req, res) => {
  try {
      const messages = await Message.find()
          .populate('sender', 'email')
          .populate('receiver', 'email');

      res.status(200).json({ success: true, messages });
  } catch (error) {
      console.error('Error fetching all chats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch chats', error: error.message });
  }
};