const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Changed to simple string
    interactionType: { type: String, enum: ['connect', 'decline'], required: true },
    targetUserId: { type: String, required: true }, // Changed to simple string
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInteraction', userInteractionSchema);

