const bcrypt = require('bcrypt');
const SuperAdmin = require('../models/superAdmin');


const seedSuperAdmin = async () => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await SuperAdmin.findOne({ email: 'superadmin@example.com' });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            return;
        }

        // If super admin doesn't exist, create a new one
        const password = 'Admin@1234';
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSuperAdmin = new SuperAdmin({
            email: 'ashish.vishwakarma1267@gmail.com',
            password: hashedPassword
        });

        await newSuperAdmin.save();
        console.log('Super admin seeded successfully');
    } catch (error) {
        console.error('Error seeding super admin:', error);
    }
};

// Call the seed function when your application starts or initializes
seedSuperAdmin();
