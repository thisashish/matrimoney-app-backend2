const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' }, 
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 10 },
    lastMessage: { type: Boolean, default: false } // This field will be used to determine if this message is the last in the conversation
});

// Add indexes to improve query performance
messageSchema.index({ sender: 1, receiver: 1, lastMessage: 1 });

module.exports = mongoose.model('Message', messageSchema);
