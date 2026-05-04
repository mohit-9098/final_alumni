const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
    required: [true, 'Job type is required']
  },
  experience: {
    type: String,
    enum: ['entry-level', 'mid-level', 'senior-level', 'executive'],
    required: [true, 'Experience level is required']
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    }
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each requirement cannot exceed 200 characters']
  }],
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each responsibility cannot exceed 200 characters']
  }],
  skills: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  applicationLink: {
    type: String,
    required: [true, 'Application link is required'],
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });

// Method to increment view count
jobSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);
