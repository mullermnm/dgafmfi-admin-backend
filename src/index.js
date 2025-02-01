require('dotenv').config();
const mongoose = require('mongoose');
const { ServerConfig } = require("./config");
const app = require('./app');  
const User = require('./models/user.model');

const PORT = process.env.PORT || ServerConfig.PORT;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/dgaf_admin';

// Admin user data
const adminUser = {
  username: 'admin',
  email: 'admin@dgaf.com',
  password: 'Admin@123',
  role: 'admin'
};

// Function to seed admin user
const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser);
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Seed admin user
    await seedAdminUser();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
});
