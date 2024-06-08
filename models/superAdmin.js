const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superAdminSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'super-admin' },
    token: { type: String },
    removed: { type: Boolean, default: false } 
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
