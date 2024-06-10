
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');

// exports.register = async (req, res) => {
//     const { email, password, phone, confirm_password } = req.body;

//     try {
//         // Check if passwords match
//         if (password !== confirm_password) {
//             return res.status(400).json({ message: 'Passwords do not match' });
//         }

//         const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

//         if (existingUser) {
//             let message;
//             if (existingUser.email === email) {
//                 message = 'Email already exists';
//             } else {
//                 message = 'Phone number already exists';
//             }
//             return res.status(400).json({ message });
//         }

//         // If neither email nor phone number exists, create a new user
//         const otp = generateOTP(); // Generate OTP

//         const newUser = new User({
//             email,
//             password,
//             confirm_password,
//             phone,
//             otp,
//         });

//         // Save the new user to the database
//         await newUser.save();

//         // Generate JWT token with email and user ID
//         const tokenPayload = {
//             email: email,
//             userId: newUser.userId,
//             tokens: [],
//             _id: newUser._id
//         };

//         const token = jwt.sign(
//             tokenPayload,
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );
//         tokenPayload.tokens.push(token);

//         // Update user document with the generated token
//         newUser.tokens.push(token);
//         await newUser.save();

//         // Send OTP email
//         await sendOTP(email, otp);

//         const response = {
//             statusCode: 201,
//             otp,
//             message: 'User registered successfully',
//             token,
//             tokenPayload,
//         };

//         res.status(201).json({ response });
//     } catch (error) {
//         console.error('Error registering user:', error);
//         res.status(500).json({ message: 'Failed to register user', error: error.message });
//     }
// };

exports.register = async (req, res) => {
    const { email, password, phone, confirm_password, firstName, lastName, gender } = req.body;

    try {
        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            let message;
            if (existingUser.email === email) {
                message = 'Email already exists';
            } else {
                message = 'Phone number already exists';
            }
            return res.status(400).json({ message });
        }

        const otp = generateOTP(); // Generate OTP

        const newUser = new User({
            email,
            password,
            confirm_password,
            phone,
            otp,
            firstName,
            lastName,
            gender,
        });

        // Check if first name, last name, and gender are provided
        if (firstName && lastName && gender) {
            newUser.profileSetup = true;
        }

        // Save the new user to the database
        await newUser.save();

        // Generate JWT token with email and user ID
        const tokenPayload = {
            email: email,
            userId: newUser.userId,
            tokens: [],
            _id: newUser._id
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );
        tokenPayload.tokens.push(token);

        // Update user document with the generated token
        newUser.tokens.push(token);
        await newUser.save();

        // Send OTP email
        await sendOTP(email, otp);

        const response = {
            statusCode: 201,
            otp,
            message: 'User registered successfully',
            token,
            tokenPayload,
        };

        res.status(201).json({ response });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
};


// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     console.log('aaaaaaaaaaaaa', password);

//     try {
//         // Find the user by email
//         const user = await User.findOne({ email });
//         console.log(user.password, 'xxxxxxxxxxxxxx');

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Validate password
//         // const isPasswordValid = await user.comparePassword(password, user.password);
//         // console.log('ispasssssssssssssssss', isPasswordValid);
//         const isPasswordValid = await bcrypt.compare(password,user.password);

//         // Log the comparison result
//         console.log('Password valid:', isPasswordValid);
        

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: 'Invalid password' });
//         }

//         // Check if the user is blocked
//         if (user.status === 'blocked') {
//             return res.status(403).json({ message: 'Your account is blocked. Please contact customer support for assistance.' });
//         }

//         // Assuming password validation is successful, generate a new token
//         const tokenPayload = {
//             email: user.email,
//             userId: user.userId,
//         };

//         const token = jwt.sign(
//             tokenPayload,
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         // Remove previous tokens and store the new token in user document
//         user.tokens = [token];
//         await user.save();

//         res.status(200).json({ message: 'Login successful', token, tokenPayload });
//     } catch (error) {
//         console.error('Error logging in user:', error);
//         res.status(500).json({ message: 'Failed to login user', error: error.message });
//     }
// };

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Check if the user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'Your account is blocked. Please contact customer support for assistance.' });
        }

        // Assuming password validation is successful, generate a new token
        const tokenPayload = {
            email: user.email,
            userId: user.userId,
            profileSetup: user.profileSetup, 
            isOtpVerified:user.isOtpVerified,
            isPhotoUploaded: user.isPhotoUploaded,
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Remove previous tokens and store the new token in user document
        user.tokens = [token];
        await user.save();

        res.status(200).json({ message: 'Login successful', token, tokenPayload });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Failed to login user', error: error.message });
    }
};




// exports.login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         console.log('login user', user);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         console.log(password, 'password');
//         console.log(user.password, 'user password');
//         // Validate password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         console.log(isPasswordValid, 'isPasswordValid');

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: 'Invalid password' });
//         }

//         // Assuming password validation is successful, generate a new token
//         const tokenPayload = {
//             email: user.email,
//             userId: user.userId,

//         };

//         console.log('login tokenPayload', tokenPayload);

//         const token = jwt.sign(
//             tokenPayload,
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         // Remove previous tokens and store the new token in user document
//         user.tokens = token;
//         await user.save();

//         // res.cookie('token', token, { httpOnly: true });
//         res.status(200).json({ message: 'Login successful', token, tokenPayload });
//     } catch (error) {
//         console.error('Error logging in user:', error);
//         res.status(500).json({ message: 'Failed to login user', error: error.message });
//     }
// };

async function sendResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendResetEmail(email, token);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ message: 'Failed to send password reset email', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ userId: decoded.userId });


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Directly set the confirm_password without validation
        user.confirm_password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};


exports.logout = async (req, res) => {
    try {
        // Retrieve the user model from the database using the userId
        const user = await User.findOne({ userId: req.userData.userId });
        console.log('User ID:', req.userData.userId);


        // Set the tokens array to an empty array, indicating logout
        user.tokens = [];

        // Save the updated user document
        await user.save();

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'Failed to logout', error: error.message });
    }
};

exports.superAdminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the super admin with the provided email
        const superAdmin = await Admin.findOne({ email });

        if (!superAdmin) {
            return res.status(404).json({ message: 'Super admin not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, superAdmin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Assuming password validation is successful, generate a new token
        const tokenPayload = {
            email: superAdmin.email,
            adminId: superAdmin._id, // Assuming Admin model has _id field as the unique identifier
            userType: 'superAdmin', // Optionally, you can add userType to distinguish between super admin and regular users
            tokens: []
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Remove previous tokens and store the new token in admin document
        superAdmin.token = token;
        await superAdmin.save();

        res.status(200).json({ message: 'Super admin login successful', token, tokenPayload });
    } catch (error) {
        console.error('Error logging in super admin:', error);
        res.status(500).json({ message: 'Failed to login super admin', error: error.message });
    }
};


// Controller function for super admin logout

exports.superAdminLogout = async (req, res) => {
    try {

        req.admin.token = null;
        await req.admin.save();

        res.status(200).json({ message: 'Super admin logout successful' });
    } catch (error) {
        console.error('Error logging out super admin:', error);
        res.status(500).json({ message: 'Failed to logout super admin', error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.userData.userId;

        // Find and delete the user from the database
        const user = await User.findOneAndDelete({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ message: 'Failed to delete user account', error: error.message });
    }
};



async function sendOTP(email, otp) {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'av556548@gmail.com',
            pass: 'lsxlqhoyzofnupsx'
        }
    });

    // Setup email data
    const mailOptions = {
        from: 'av556548@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for registration is: ${otp}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
}

exports.sendOTP = async (req, res) => {
    const { email, phone } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email }, { phone }] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (!user.otp) {
            return res.status(400).json({ message: 'No OTP found for the user' });
        }

        const otp = user.otp;
        await sendOTP(email || phone, otp);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};



exports.verifyOTP = async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.findOne({ otp });

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: 'User not found' });
        }

        // Check if user has an OTP stored
        if (!user.otp) {
            return res.status(400).json({ statusCode: 400, message: 'No OTP found for the user' });
        }

        // Convert stored OTP and provided OTP to strings for comparison
        const storedOTP = user.otp.toString();
        const providedOTP = otp.toString();

        if (storedOTP !== providedOTP) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid OTP' });
        }

        // Mark OTP as verified
        user.isOtpVerified = true;

        // Exclude confirm_password from the user object before saving
        delete user.confirm_password;

        await user.save();

        res.status(200).json({ statusCode: 200, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ statusCode: 500, message: 'Failed to verify OTP', error: error.message });
    }
};




function generateOTP() {
    const length = 6;
    const digits = '0123456789';
    let OTP = '';

    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * digits.length);
        OTP += digits[index];
    }

    return OTP;
}



