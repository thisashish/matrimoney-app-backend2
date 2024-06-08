// user_migration.js

require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });

    // Add the 'height' field to existing users
    await User.updateMany({ height: { $exists: false } }, { $set: { height: null } });

    console.log('Migration completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();









