const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const authMiddleware = require('../middleware/authMiddleware');


// Get potential matches
router.get('/potential-matches/:userId', authMiddleware, matchingController.getPotentialMatches);

// Send request
router.post('/send-request', authMiddleware, matchingController.sendRequest);

// Receive requests
router.get('/receive-requests', authMiddleware, matchingController.receiveRequest);

// Decline request
router.post('/decline-request', authMiddleware, matchingController.declineRequest);

// Accept request
router.post('/accept-request', authMiddleware, matchingController.acceptRequest);

// Get users who accepted requests  :userId
router.post('/accepted-requests', authMiddleware, matchingController.getAcceptedRequests);

router.get('/sent-requests/:userId', authMiddleware, matchingController.getSentRequests);

// Handle scrolling and switch to sent section
router.post('/scroll-to-sent-section/:userId', authMiddleware, matchingController.scrollToSentSection);

module.exports = router;













