// models/SubscriptionPlan.js
const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: String,
  duration: Number,
  price: Number,
  coupon: {
    code: String,
    discountPercentage: Number,
    expiryDate: Date
  }
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

module.exports = SubscriptionPlan;
