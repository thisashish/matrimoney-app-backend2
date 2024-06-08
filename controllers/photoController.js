const { Server } = require('socket.io');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.uploadPhotos = async (req, res) => {
    try {
        // Extract userId from userData attached by the authentication middleware
        const userId = req.userData.userId; 
        const photos = req.files;

        // Find the user by ID
        const user = await User.findOne({userId});
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if at least one photo is uploaded
        if (!photos || photos.length === 0) {
            return res.status(400).json({ message: 'At least one photo is required' });
        }

        // Check if the number of uploaded photos exceeds the maximum limit
        if (photos.length > 6) {
            return res.status(400).json({ message: 'Maximum 6 photos can be uploaded' });
        }

        // Initialize photos array if it's undefined
        if (!user.photos) {
            user.photos = [];
        }


        // Save photo metadata to user document
        const uploadedPhotos = photos.map(photo => ({
            filename: photo.filename,
            originalname: photo.originalname,
            mimetype: photo.mimetype,
            size: photo.size,
        }));

        user.photos.push(...uploadedPhotos);
        await user.save();

        res.status(201).json({ message: 'Photos uploaded successfully' });
    } catch (error) {
        console.error('Error uploading photos:', error);
        res.status(500).json({ message: 'Failed to upload photos', error: error.message });
    }
};

