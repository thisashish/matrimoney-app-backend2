// models/Coupon.js
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: String,
  discountPercentage: Number,
  expiryDate: Date
});

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;
