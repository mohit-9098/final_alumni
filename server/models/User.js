const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    required: [true, 'Role is required']
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    phone: {
      type: String,
      match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    location: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: Number,
      min: [1950, 'Graduation year must be after 1950'],
      max: [2030, 'Graduation year cannot be in the distant future']
    },
    branch: {
      type: String,
      trim: true
    },
    school: {
      type: String,
      trim: true
    },
    currentCompany: {
      type: String,
      trim: true
    },
    jobTitle: {
      type: String,
      trim: true
    },
    skills: [{
      type: String,
      trim: true
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date
  }]
}, {
  timestamps: true
});

// Indexes for connections
userSchema.index({ 'connections.user': 1 });
userSchema.index({ 'connections.status': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user profile without sensitive info
userSchema.methods.getProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
