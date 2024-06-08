const cron = require('node-cron');
const { deleteOldMessages } = require('../controllers/chatController');

// Schedule the task to run once a day
cron.schedule('0 0 * * *', () => {
    deleteOldMessages();
});
