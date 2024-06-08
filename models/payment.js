const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: String,
    amount: String,
    orderId: String,
    customerId: String,
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
