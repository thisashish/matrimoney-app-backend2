const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const photoController = require('../controllers/photoController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/users/:userId/photos', authMiddleware, upload.array('photos'), photoController.uploadPhotos);


module.exports = router;
