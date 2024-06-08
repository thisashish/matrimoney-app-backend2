const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/payment');

// PhonePe API credentials
const PHONEPE_API_KEY = process.env.PHONEPE_API_KEY;
const PHONEPE_API_SECRET = process.env.PHONEPE_API_SECRET;
const MERCHANT_ID = process.env.MERCHANT_ID;
const CALLBACK_URL = process.env.CALLBACK_URL;
const REDIRECT_URL = process.env.REDIRECT_URL;
const PHONEPE_PAY_URL = process.env.PHONEPE_PAY_URL;
const PHONEPE_REFUND_URL = process.env.PHONEPE_REFUND_URL;

exports.initiatePayment = async (req, res) => {
    try {
        const { amount, orderId, customerId } = req.body;

        const requestBody = {
            merchantId: MERCHANT_ID,
            transactionId: orderId,
            amount: parseInt(amount) * 100, // Convert to paise
            merchantOrderId: orderId,
            customerId: customerId,
            merchantUserId: customerId,
            message: "Payment for order",
            shortDescription: "Order payment",
            paymentInstrument: {
                type: "MOBILE_NUMBER",
                value: "user_mobile_number"
            },
            callbackUrl: CALLBACK_URL
        };

        // Create HMAC signature
        const payload = JSON.stringify(requestBody);
        const checksum = crypto.createHmac('sha256', PHONEPE_API_SECRET)
            .update(payload)
            .digest('base64');

        // PhonePe API endpoint
        const url = 'https://api.phonepe.com/apis/merchant/request';

        // Make the request to PhonePe
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': `${checksum}###${PHONEPE_API_KEY}`,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        });

        if (response.data.success) {
            // Save payment info to the database
            const payment = new Payment({
                paymentId: response.data.transactionId,
                amount,
                orderId,
                customerId,
                status: 'INITIATED'
            });

            await payment.save();

            res.status(200).json({ paymentId: response.data.transactionId });
        } else {
            res.status(400).json({ message: 'Payment initiation failed', error: response.data.message });
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Failed to initiate payment', error: error.message });
    }
};

exports.handleCallback = async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        // Update payment status in the database
        const payment = await Payment.findOne({ paymentId: transactionId });
        if (payment) {
            payment.status = status;
            await payment.save();
            res.status(200).json({ message: 'Payment callback received' });
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        console.error('Error handling payment callback:', error);
        res.status(500).json({ message: 'Failed to handle payment callback', error: error.message });
    }
};

exports.verifyPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const payment = await Payment.findOne({ orderId });
        if (payment) {
            res.status(200).json({ status: payment.status });
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        console.error('Error verifying payment status:', error);
        res.status(500).json({ message: 'Failed to verify payment status', error: error.message });
    }
};

exports.refundPayment = async (req, res) => {
    try {
        const { transactionId, amount } = req.body;

        const requestBody = {
            merchantId: MERCHANT_ID,
            transactionId: transactionId,
            amount: parseInt(amount) * 100, // Convert to paise
            merchantOrderId: transactionId,
            merchantUserId: transactionId,
            message: "Refund for order",
            shortDescription: "Order refund"
        };

        // Create HMAC signature
        const payload = JSON.stringify(requestBody);
        const checksum = crypto.createHmac('sha256', PHONEPE_API_SECRET)
            .update(payload)
            .digest('base64');

        // Make the request to PhonePe
        const response = await axios.post(PHONEPE_REFUND_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': `${checksum}###${PHONEPE_API_KEY}`,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        });

        if (response.data.success) {
            // Update payment status in the database
            const payment = await Payment.findOne({ paymentId: transactionId });
            if (payment) {
                payment.status = 'REFUNDED';
                await payment.save();
            }
            res.status(200).json({ message: 'Refund initiated successfully' });
        } else {
            res.status(400).json({ message: 'Refund initiation failed', error: response.data.message });
        }
    } catch (error) {
        console.error('Error initiating refund:', error);
        res.status(500).json({ message: 'Failed to initiate refund', error: error.message });
    }
};





