const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@mohit.com' });
    if (existingAdmin) {
      // Update admin lastLogin to recent
      existingAdmin.lastLogin = new Date();
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('Admin user lastLogin updated');
    } else {
      // Create default admin user
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@mohit.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        isActive: true,
        lastLogin: new Date(),
        profile: {
          bio: 'System administrator for the alumni portal',
          phone: '+1-555-0100',
          location: 'University Campus',
          currentCompany: 'University',
          jobTitle: 'System Administrator'
        }
      });

      await adminUser.save();
      console.log('Default admin user created:');
      console.log('Email: admin@mohit.com');
      console.log('Password: admin123');
    }

    // Create sample student user (with recent lastLogin)
    const existingStudent = await User.findOne({ email: 'student@alumniportal.com' });
    if (!existingStudent) {
      const studentUser = new User({
        name: 'John Student',
        email: 'student@alumniportal.com',
        password: 'student123',
        role: 'student',
        isVerified: true,
        isActive: true,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // last 7 days
        profile: {
          bio: 'Computer Science student interested in software development',
          phone: '+1-555-0101',
          location: 'University Campus',
          graduationYear: 2024,
          branch: 'Computer Science',
          skills: ['JavaScript', 'React', 'Node.js', 'Python']
        }
      });

      await studentUser.save();
      console.log('Sample student user created:');
      console.log('Email: student@alumniportal.com');
      console.log('Password: student123');
    }

    // Create additional sample students
    const studentEmails = ['student2@alumniportal.com', 'student3@alumniportal.com', 'student4@alumniportal.com', 'student5@alumniportal.com'];
    for (const email of studentEmails) {
      const existing = await User.findOne({ email });
      if (!existing) {
        const studentUser = new User({
          name: `Student ${email.match(/student(\d)/)?.[1] || ''}`,
          email,
          password: 'student123',
          role: 'student',
          isVerified: true,
          isActive: true,
          lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // last 30 days
          profile: {
            graduationYear: 2024,
            branch: 'Computer Science',
            skills: ['JavaScript', 'React']
          }
        });
        await studentUser.save();
        console.log(`Additional student created: ${email}`);
      }
    }

    // Create sample alumni user (with recent lastLogin)
    const existingAlumni = await User.findOne({ email: 'alumni@alumniportal.com' });
    if (!existingAlumni) {
      const alumniUser = new User({
        name: 'Jane Alumni',
        email: 'alumni@alumniportal.com',
        password: 'alumni123',
        role: 'alumni',
        isVerified: true,
        isActive: true,
        lastLogin: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // last 3 days
        profile: {
          bio: 'Software Engineer with 5 years of experience in web development',
          phone: '+1-555-0102',
          location: 'San Francisco, CA',
          graduationYear: 2019,
          branch: 'Computer Science',
          currentCompany: 'Tech Corp',
          jobTitle: 'Senior Software Engineer',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
          linkedin: 'https://linkedin.com/in/janealumni'
        }
      });

      await alumniUser.save();
      console.log('Sample alumni user created:');
      console.log('Email: alumni@alumniportal.com');
      console.log('Password: alumni123');
    }

    // Create additional sample alumni
    const alumniEmails = ['alumni2@alumniportal.com', 'alumni3@alumniportal.com'];
    for (const email of alumniEmails) {
      const existing = await User.findOne({ email });
      if (!existing) {
        const alumniUser = new User({
          name: `Alumni ${email.match(/alumni(\d)/)?.[1] || ''}`,
          email,
          password: 'alumni123',
          role: 'alumni',
          isVerified: true,
          isActive: true,
          lastLogin: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // last 14 days
          profile: {
            graduationYear: 2020,
            branch: 'Computer Science',
            currentCompany: 'Startup Inc',
            jobTitle: 'Software Developer'
          }
        });
        await alumniUser.save();
        console.log(`Additional alumni created: ${email}`);
      }
    }

    // Add sample connections
    const studentUser = await User.findOne({ email: 'student@alumniportal.com' });
    const alumniUser = await User.findOne({ email: 'alumni@alumniportal.com' });
    const alumniUser2 = await User.findOne({ email: 'alumni2@alumniportal.com' });

    if (studentUser && alumniUser && alumniUser2) {
      // Accepted connection with first alumni
      if (!studentUser.connections?.some(c => c.user.toString() === alumniUser._id.toString())) {
        studentUser.connections = studentUser.connections || [];
        studentUser.connections.push({
          user: alumniUser._id,
          status: 'accepted',
          requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        });
        await studentUser.save();
        console.log('Sample accepted connection added: student -> Jane Alumni');
      }

      // Pending connection with second alumni
      if (!studentUser.connections?.some(c => c.user.toString() === alumniUser2._id.toString())) {
        studentUser.connections = studentUser.connections || [];
        studentUser.connections.push({
          user: alumniUser2._id,
          status: 'pending',
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        });
        await studentUser.save();
        console.log('Sample pending connection added: student -> Alumni 2');
      }
    }

    console.log('Database initialization completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@mohit.com / admin123');
    console.log('Student: student@alumniportal.com / student123');
    console.log('Alumni: alumni@alumniportal.com / alumni123');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run initialization
initializeDatabase();
