const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 480 minutes (8 hours)']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['seminar', 'workshop', 'webinar', 'meetup', 'meeting', 'conference', 'networking', 'other'],
    required: [true, 'Event type is required']
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    required: [true, 'Event mode is required']
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1'],
    max: [1000, 'Maximum participants cannot exceed 1000']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Current participants cannot be negative']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
    validate: {
      validator: function(value) {
        return value < this.date;
      },
      message: 'Registration deadline must be before event date'
    }
  },
  registrationLink: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  agenda: [{
    time: String,
    activity: String,
    speaker: String
  }],
  speakers: [{
    name: String,
    title: String,
    organization: String,
    bio: String,
    photo: String
  }],
  report: {
    type: String,
    trim: true,
    maxlength: [2000, 'Report cannot exceed 2000 characters']
  },
  targetAudience: [{
    type: String,
    enum: ['student', 'alumni', 'admin', 'all'],
    default: 'all'
  }],
  organizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organized by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  images: [{
    url: String,
    caption: String
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
eventSchema.index({ title: 'text', description: 'text', location: 'text', tags: 'text' });

// Method to register user for event
eventSchema.methods.registerUser = function(userId) {
  if (this.currentParticipants >= this.maxParticipants) {
    throw new Error('Event is full');
  }
  
  if (this.attendees.some(attendee => attendee.user.toString() === userId.toString())) {
    throw new Error('User already registered');
  }
  
  this.attendees.push({ user: userId });
  this.currentParticipants += 1;
  return this.save();
};

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.attendees.some(attendee => attendee.user.toString() === userId.toString());
};

// Method to mark event as completed
eventSchema.methods.markAsCompleted = function() {
  this.isCompleted = true;
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
