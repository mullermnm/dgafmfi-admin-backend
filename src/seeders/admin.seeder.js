const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

const adminUser = {
  username: 'admin',
  email: 'admin@dgaf.com',
  password: 'Admin@123',
  role: 'admin'
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser);
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
