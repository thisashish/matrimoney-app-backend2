const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to initiate payment
router.post('/initiate', paymentController.initiatePayment);

// Route to handle payment callback
router.post('/callback', paymentController.handleCallback);

router.get('/status/:orderId', paymentController.verifyPaymentStatus);
router.post('/refund', paymentController.refundPayment);

module.exports = router;
