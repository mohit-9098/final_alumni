const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const admin = await User.findOne({ email: 'admin@mohit.com' });
    
    if (admin) {
      console.log('Admin found');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
      
      const isMatch = await admin.comparePassword('admin123');
      console.log('Password match for "admin123":', isMatch);
    } else {
      console.log('Admin user not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
